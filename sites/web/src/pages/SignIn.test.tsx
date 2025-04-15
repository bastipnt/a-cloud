import { api } from "@acloud/client/api";
import { config } from "@acloud/config";
import { createSignedUpTestUser, resetDB } from "@acloud/db";
import { testUsers } from "@acloud/testing";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, mock } from "bun:test";
import { useLocation } from "wouter";
import SignIn from "./SignIn";
import "@acloud/testing/types.d.ts"; // TODO: why is it not working in tsconfig???

describe("SignUp", () => {
  let emailField: HTMLInputElement;
  let passwordField: HTMLInputElement;
  let submitButton: HTMLButtonElement;

  const renee = testUsers.renee;

  beforeAll(async () => {
    mock.module("wouter", () => {
      const navigate = mock((_location: string) => {});

      return {
        useLocation: () => [undefined, navigate],
      };
    });

    await createSignedUpTestUser("renee");
  });

  afterAll(async () => {
    await resetDB();
  });

  beforeEach(() => {
    render(<SignIn />);
    emailField = screen.getByLabelText<HTMLInputElement>("Email");
    passwordField = screen.getByLabelText<HTMLInputElement>("Password");
    submitButton = screen.getByRole<HTMLButtonElement>("button", { name: /submit/i });
  });

  afterEach(() => {
    cleanup();
  });

  it("loads and has empty email and password field", async () => {
    expect(emailField.value).toBe("");
    expect(passwordField.value).toBe("");
    expect(submitButton.type).toBe("submit");
  });

  describe("valid form values", () => {
    it("submits the form", async () => {
      const { email, password } = renee;

      fireEvent.change(emailField, { target: { value: email } });
      fireEvent.change(passwordField, { target: { value: password } });
      fireEvent.click(submitButton);

      await waitFor(async () => {
        expect(api["user-auth"]["sign-in"].post).toHaveBeenCalled();

        const tmpSignInAuthCookies = await cookieJar.getCookies(config.endpoint.api);
        expect(tmpSignInAuthCookies.length).toBe(1);
        expect(tmpSignInAuthCookies[0].toString()).toContain("tmpSignInAuth=");
      });

      await waitFor(() => {
        expect(api["user-auth"]["sign-in"]["verify-srp"].post).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(useLocation()[1]).toHaveBeenCalledWith("/");
      });

      const cookies = await cookieJar.getCookies(config.endpoint.api);
      expect(cookies.length).toBe(1);
      expect(cookies[0].toString()).toContain("auth=");
    });
  });
});
