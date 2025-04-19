import { api } from "@acloud/client/api";
import { config } from "@acloud/config";
import {
  createNewTestUser,
  createSignedUpTestUser,
  createVerifiedTestUser,
  findOttByUserId,
  findUserByEmail,
  resetDB,
  UserType,
} from "@acloud/db";
import { genJWT, testUsers } from "@acloud/testing";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterAll, beforeAll, beforeEach, describe, expect, it, Mock } from "bun:test";
import { useLocation } from "wouter";
import OTT from "./OTT";

describe("OTT", () => {
  let emailField: HTMLInputElement;
  let ottField: HTMLInputElement;
  let submitButton: HTMLButtonElement;

  afterAll(async () => {
    await resetDB();
  });

  beforeEach(() => {
    (
      api["user-auth"]["verify-ott"].post as Mock<(typeof api)["user-auth"]["verify-ott"]["post"]>
    ).mockClear();
  });

  describe("new user", () => {
    describe("valid form params", () => {
      const ben = testUsers.ben;
      let dbBen: UserType;
      let benOtt: string;

      beforeAll(async () => {
        await createNewTestUser("ben");

        dbBen = (await findUserByEmail(ben.email))!;
        benOtt = (await findOttByUserId(dbBen.userId))!.ott;
      });

      beforeEach(() => {
        window.location.search = "";
        window.localStorage.setItem("email", ben.email);
        render(<OTT />);

        emailField = screen.getByLabelText<HTMLInputElement>("Email");
        ottField = screen.getByLabelText<HTMLInputElement>("Token");
        submitButton = screen.getByRole<HTMLButtonElement>("button", { name: /submit/i });
      });

      it("verifies the ott", async () => {
        const { email } = ben;

        expect(dbBen.hasEmailVerified).toBeFalse();
        expect(emailField.value).toBe(ben.email);
        expect(ottField.value).toBe("");

        fireEvent.change(ottField, { target: { value: benOtt } });

        fireEvent.click(submitButton);

        await waitFor(() => {
          expect(api["user-auth"]["verify-ott"].post).toHaveBeenCalledWith({ email, ott: benOtt });
        });

        await waitFor(() => {
          expect(useLocation()[1]).toHaveBeenCalledWith("/finish-sign-up");
        });

        expect(window.localStorage.getItem("email")).toBe(email);

        expect((await findUserByEmail(email))!.hasEmailVerified).toBeTrue();

        const tmpSignUpAuthJWT = await genJWT({
          userId: dbBen.userId,
          ott: benOtt,
        });

        const cookies = await cookieJar.getCookies(config.endpoint.api);
        expect(cookies.length).toBe(1);
        expect(cookies[0].toString()).toContain(`tmpSignUpAuth=${tmpSignUpAuthJWT}`);
      });
    });

    describe("invalid ott", () => {
      const renee = testUsers.renee;
      let dbRenee: UserType;

      beforeAll(async () => {
        await createNewTestUser("renee");

        dbRenee = (await findUserByEmail(renee.email))!;
      });

      beforeEach(() => {
        window.location.search = "";
        window.localStorage.setItem("email", renee.email);
        render(<OTT />);

        emailField = screen.getByLabelText<HTMLInputElement>("Email");
        ottField = screen.getByLabelText<HTMLInputElement>("Token");
        submitButton = screen.getByRole<HTMLButtonElement>("button", { name: /submit/i });
      });

      it("does not verify the email", async () => {
        const { email } = renee;
        const invalidOtt = "12345a";

        expect(dbRenee.hasEmailVerified).toBeFalse();
        expect(emailField.value).toBe(email);
        expect(ottField.value).toBe("");

        fireEvent.change(ottField, { target: { value: invalidOtt } });

        fireEvent.click(submitButton);

        await waitFor(() => {
          expect(api["user-auth"]["verify-ott"].post).toHaveBeenCalledWith({
            email,
            ott: invalidOtt,
          });
        });

        expect(await screen.findByText("Invalid Token!")).toBeDefined();

        await waitFor(() => {
          expect(useLocation()[1]).not.toHaveBeenCalledWith("/finish-sign-up");
        });

        expect(window.localStorage.getItem("email")).toBe(email);

        const user = (await findUserByEmail(email))!;
        expect(user.hasEmailVerified).toBeFalse();

        const cookies = await cookieJar.getCookies(config.endpoint.api);
        expect(cookies.length).toBe(0);
      });
    });

    describe("with verify ott url", () => {
      const jo = testUsers.jo;
      let dbJo: UserType;
      let joOtt: string;

      beforeAll(async () => {
        await createNewTestUser("jo");

        dbJo = (await findUserByEmail(jo.email))!;
        joOtt = (await findOttByUserId(dbJo.userId))!.ott;
      });

      beforeEach(() => {
        window.localStorage.clear();
        window.location.search = `?email=${jo.email}&ott=${joOtt}`;
        render(<OTT />);

        emailField = screen.getByLabelText<HTMLInputElement>("Email");
        ottField = screen.getByLabelText<HTMLInputElement>("Token");
        submitButton = screen.getByRole<HTMLButtonElement>("button", { name: /submit/i });
      });

      it("fills the email and ott from the url and automatically submits the form", async () => {
        const { email } = jo;

        expect(emailField.value).toBe(email);
        expect(ottField.value).toBe(joOtt);

        await waitFor(() => {
          expect(api["user-auth"]["verify-ott"].post).toHaveBeenCalledWith({ email, ott: joOtt });
        });

        await waitFor(() => {
          expect(useLocation()[1]).toHaveBeenCalledWith("/finish-sign-up");
        });

        expect(window.localStorage.getItem("email")).toBe(email);

        const user = (await findUserByEmail(email))!;
        expect(user.hasEmailVerified).toBeTrue();

        const tmpSignInAuthJWT = await genJWT({
          userId: user.userId,
          ott: joOtt,
        });

        const cookies = await cookieJar.getCookies(config.endpoint.api);
        expect(cookies.length).toBe(1);
        expect(cookies[0].toString()).toContain(`tmpSignUpAuth=${tmpSignInAuthJWT}`);
      });
    });

    describe("already verified user", () => {
      const user = testUsers.julia;
      let dbUser: UserType;
      let ott: string;

      beforeAll(async () => {
        await createVerifiedTestUser("julia");

        dbUser = (await findUserByEmail(user.email))!;
        ott = (await findOttByUserId(user.userId))!.ott;
      });

      beforeEach(() => {
        window.localStorage.setItem("email", user.email);
        window.location.search = "";
        render(<OTT />);

        emailField = screen.getByLabelText<HTMLInputElement>("Email");
        ottField = screen.getByLabelText<HTMLInputElement>("Token");
        submitButton = screen.getByRole<HTMLButtonElement>("button", { name: /submit/i });
      });

      it("will be redirected to the finish-sign-up-page", async () => {
        const { email } = user;

        expect(dbUser.hasEmailVerified).toBeTrue();
        expect(emailField.value).toBe(email);
        expect(ottField.value).toBe("");

        fireEvent.change(ottField, { target: { value: ott } });
        fireEvent.click(submitButton);

        await waitFor(() => {
          expect(api["user-auth"]["verify-ott"].post).toHaveBeenCalledWith({ email, ott: ott });
        });

        await waitFor(() => {
          expect(useLocation()[1]).toHaveBeenCalledWith("/finish-sign-up");
        });

        expect(window.localStorage.getItem("email")).toBe(email);

        const tmpSignInAuthJWT = await genJWT({
          userId: dbUser.userId,
          ott: ott,
        });

        const cookies = await cookieJar.getCookies(config.endpoint.api);
        expect(cookies.length).toBe(1);
        expect(cookies[0].toString()).toContain(`tmpSignUpAuth=${tmpSignInAuthJWT}`);
      });

      describe("with invalid ott", () => {
        it("shows an error message", async () => {
          const { email } = user;
          const invalidOTT = "12345e";

          expect(dbUser.hasEmailVerified).toBeTrue();
          expect(emailField.value).toBe(email);
          expect(ottField.value).toBe("");

          fireEvent.change(ottField, { target: { value: invalidOTT } });
          fireEvent.click(submitButton);

          await waitFor(() => {
            expect(api["user-auth"]["verify-ott"].post).toHaveBeenCalledWith({
              email,
              ott: invalidOTT,
            });
          });

          expect(await screen.findByText("Invalid Token!")).toBeDefined();

          await waitFor(() => {
            expect(useLocation()[1]).not.toHaveBeenCalledWith("/finish-sign-up");
          });

          expect(window.localStorage.getItem("email")).toBe(email);

          const cookies = await cookieJar.getCookies(config.endpoint.api);
          expect(cookies.length).toBe(0);
        });
      });
    });

    describe("already finished user", () => {
      const user = testUsers.phillis;
      let dbUser: UserType;

      beforeAll(async () => {
        await createSignedUpTestUser("phillis");

        dbUser = (await findUserByEmail(user.email))!;
      });

      beforeEach(() => {
        window.localStorage.setItem("email", user.email);
        window.location.search = "";
        render(<OTT />);

        emailField = screen.getByLabelText<HTMLInputElement>("Email");
        ottField = screen.getByLabelText<HTMLInputElement>("Token");
        submitButton = screen.getByRole<HTMLButtonElement>("button", { name: /submit/i });
      });

      it("will be handled as invalid ott", async () => {
        const { email } = user;
        const ott = "12345d";

        expect(dbUser.hasEmailVerified).toBeTrue();
        expect(emailField.value).toBe(email);
        expect(ottField.value).toBe("");

        fireEvent.change(ottField, { target: { value: ott } });
        fireEvent.click(submitButton);

        await waitFor(() => {
          expect(api["user-auth"]["verify-ott"].post).toHaveBeenCalledWith({ email, ott: ott });
        });

        expect(await screen.findByText("Invalid Token!")).toBeDefined();

        await waitFor(() => {
          expect(useLocation()[1]).not.toHaveBeenCalledWith("/finish-sign-up");
        });

        expect(window.localStorage.getItem("email")).toBe(email);

        const cookies = await cookieJar.getCookies(config.endpoint.api);
        expect(cookies.length).toBe(0);
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
        render(<OTT />);

        emailField = screen.getByLabelText<HTMLInputElement>("Email");
        ottField = screen.getByLabelText<HTMLInputElement>("Token");
        submitButton = screen.getByRole<HTMLButtonElement>("button", { name: /submit/i });
      });

      it("will be redirected to the index page", async () => {
        await waitFor(() => {
          expect(useLocation()[1]).toHaveBeenCalledWith("/");
        });
      });
    });
  });
});
