import * as client from "@acloud/client";
import { api } from "@acloud/client/api";
import { config } from "@acloud/config";
import * as aCrypto from "@acloud/crypto";
import { createSignedUpTestUser, resetDB } from "@acloud/db";
import { testUsers } from "@acloud/testing";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  Mock,
  spyOn,
} from "bun:test";
import { useLocation } from "wouter";
import SignIn from "./SignIn";

describe("SignIn", () => {
  let emailField: HTMLInputElement;
  let passwordField: HTMLInputElement;
  let submitButton: HTMLButtonElement;
  let verifySrpSessionSpy: Mock<(typeof aCrypto)["verifySrpSession"]>;
  let proofSignInSpy: Mock<(typeof client)["proofSignIn"]>;
  let signInSpy: Mock<(typeof client)["signIn"]>;

  const renee = testUsers.renee;

  afterAll(async () => {
    await resetDB();
  });

  beforeAll(async () => {
    await createSignedUpTestUser("renee");
    verifySrpSessionSpy = spyOn(aCrypto, "verifySrpSession");
    proofSignInSpy = spyOn(client, "proofSignIn");
    signInSpy = spyOn(client, "signIn");
  });

  afterEach(() => {
    verifySrpSessionSpy.mockClear();
    proofSignInSpy.mockClear();
    signInSpy.mockClear();
    // @ts-expect-error is a mocked function
    api["user-auth"]["sign-in"]["verify-srp"].post.mockClear();
    // @ts-expect-error is a mocked function
    api["user-auth"]["sign-in"].post.mockClear();
  });

  describe("No preexisting cookies", () => {
    beforeEach(() => {
      render(<SignIn />);
      emailField = screen.getByLabelText<HTMLInputElement>("Email");
      passwordField = screen.getByLabelText<HTMLInputElement>("Password");
      submitButton = screen.getByRole<HTMLButtonElement>("button", { name: /submit/i });
    });

    it("loads and has empty email and password field", async () => {
      expect(emailField.value).toBe("");
      expect(passwordField.value).toBe("");
      expect(submitButton.type).toBe("submit");
    });

    describe("valid form values", () => {
      it("signs in the user", async () => {
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
          expect(verifySrpSessionSpy).toHaveBeenCalled();
        });

        await waitFor(() => {
          expect(proofSignInSpy).toHaveReturned();
        });

        await waitFor(() => {
          expect(useLocation()[1]).toHaveBeenCalledWith("/");
        });

        const cookies = await cookieJar.getCookies(config.endpoint.api);
        expect(cookies.length).toBe(1);
        expect(cookies[0].toString()).toContain("auth=");
      });
    });

    describe("invalid form values", () => {
      it("does not sign in the user with an invalid email", async () => {
        const { password } = renee;
        const email = "invalid@example.com";

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

        expect(await screen.findByText("Invalid email, password combination!")).toBeDefined();

        await waitFor(() => {
          expect(proofSignInSpy).toHaveReturned();
        });

        await waitFor(() => {
          expect(verifySrpSessionSpy).not.toHaveBeenCalled();
        });

        expect(useLocation()[1]).not.toHaveBeenCalledWith("/");

        const cookies = await cookieJar.getCookies(config.endpoint.api);
        expect(cookies.length).toBe(1);
        expect(cookies[0].toString()).toContain("tmpSignInAuth=");
      });

      it("does not sign in the user with an invalid password", async () => {
        const { email } = renee;
        const password = "invalid";

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

        expect(await screen.findByText("Invalid email, password combination!")).toBeDefined();

        await waitFor(() => {
          expect(proofSignInSpy).toHaveReturned();
        });

        await waitFor(() => {
          expect(verifySrpSessionSpy).not.toHaveBeenCalled();
        });

        expect(useLocation()[1]).not.toHaveBeenCalledWith("/");

        const cookies = await cookieJar.getCookies(config.endpoint.api);
        expect(cookies.length).toBe(1);
        expect(cookies[0].toString()).toContain("tmpSignInAuth=");
      });
    });

    describe("already signed in user (when already on sign in page)", () => {
      it("redirects to index page", async () => {
        const { email, password } = renee;

        await cookieJar.setCookie(`auth=${renee.jwt}`, config.endpoint.api);

        fireEvent.change(emailField, { target: { value: email } });
        fireEvent.change(passwordField, { target: { value: password } });
        fireEvent.click(submitButton);

        await waitFor(async () => {
          expect(api["user-auth"]["sign-in"].post).toHaveBeenCalled();
        });

        await waitFor(() => {
          expect(signInSpy).toHaveReturned();
        });

        await waitFor(() => {
          expect(useLocation()[1]).toHaveBeenCalledWith("/");
        });

        expect(proofSignInSpy).not.toHaveBeenCalled();
        expect(api["user-auth"]["sign-in"]["verify-srp"].post).not.toHaveBeenCalled();
      });
    });
  });

  describe("already signed in user (when navigation to sign in page)", () => {
    beforeEach(async () => {
      await cookieJar.setCookie(`auth=${renee.jwt}`, config.endpoint.api);
      render(<SignIn />);
    });

    it("redirects to index page", async () => {
      await waitFor(() => {
        expect(useLocation()[1]).toHaveBeenCalledWith("/");
      });
    });
  });
});
