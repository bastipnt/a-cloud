import { api } from "@acloud/client/api";
import { config } from "@acloud/config";
import { createSignedUpTestUser, findOttByUserId, findUserByEmail, resetDB } from "@acloud/db";
import { testUsers } from "@acloud/testing";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "bun:test";
import { useLocation } from "wouter";
import SignUp from "./SignUp";

describe("SignUp", () => {
  afterAll(async () => {
    await resetDB();
  });

  describe("new user", () => {
    const ben = testUsers.ben;
    let emailField: HTMLInputElement;
    let submitButton: HTMLButtonElement;

    beforeEach(() => {
      window.localStorage.clear();
      render(<SignUp />);
      emailField = screen.getByLabelText<HTMLInputElement>("Email");
      submitButton = screen.getByRole<HTMLButtonElement>("button", { name: /submit/i });
    });

    it("shows a link, that redirects to /sing-in", async () => {
      const signInLink = screen.getByRole<HTMLAnchorElement>("link", { name: /sign in/i });
      expect(signInLink.href).toBe("http://localhost:5173/sign-in");
      fireEvent.click(signInLink);

      await waitFor(() => {
        expect(window.location.href).toBe("http://localhost:5173/sign-in");
      });
    });

    describe("valid form params", () => {
      it("creates a new user", async () => {
        const { email } = ben;

        expect(window.localStorage.getItem("email")).toBeNull();

        fireEvent.change(emailField, { target: { value: email } });
        fireEvent.click(submitButton);

        await waitFor(() => {
          expect(api["user-auth"]["sign-up"].put).toHaveBeenCalledWith({ email });
        });

        await waitFor(() => {
          expect(useLocation()[1]).toHaveBeenCalledWith("/ott");
        });

        expect(window.localStorage.getItem("email")).toBe(email);

        const user = (await findUserByEmail(email))!;
        expect(user.userId).toBeString();

        const ott = (await findOttByUserId(user.userId))!;
        expect(ott.ott).toBeString();
      });
    });

    describe("invalid email", () => {
      it("does not send the form", async () => {
        const email = "invalid";

        expect(window.localStorage.getItem("email")).toBeNull();

        fireEvent.change(emailField, { target: { value: email } });
        fireEvent.click(submitButton);

        await waitFor(() => {
          expect(api["user-auth"]["sign-up"].put).not.toHaveBeenCalledWith({ email });
        });

        await waitFor(() => {
          expect(useLocation()[1]).not.toHaveBeenCalledWith("/ott");
        });

        // expect(await screen.findByText("email must be a valid email")).toBeDefined();
      });
    });
  });

  describe("already signed in user", () => {
    const user = testUsers.peter;

    beforeAll(async () => {
      await createSignedUpTestUser("peter");
    });

    beforeEach(async () => {
      window.localStorage.clear();
      window.location.search = "";
      await cookieJar.setCookie(`auth=${user.jwt}`, config.endpoint.api);
      render(<SignUp />);
    });

    it("will be redirected to the index page", async () => {
      await waitFor(() => {
        expect(useLocation()[1]).toHaveBeenCalledWith("/");
      });
    });
  });
});
