import { api } from "@acloud/client/api";
import { config } from "@acloud/config";
import { genSrpAttributes } from "@acloud/crypto";
import {
  createNewTestUser,
  createSignedUpTestUser,
  createVerifiedTestUser,
  db,
  resetDB,
} from "@acloud/db";
import { genJWT, testUsers } from "@acloud/testing";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ReactNode, useRef } from "react";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, Mock, vi } from "vitest";
import { useLocation } from "wouter";
import FinishSignUp from "./FinishSignUp";

// vi.mock("@acloud/client/src/worker-pools/crypto-worker-pool.ts", () => {
//   class CryptoWorkerPool {
//     genNewUserKeys = vi.fn();
//     encryptFile = vi.fn();
//     encryptObject = vi.fn();
//     encryptBoxBase64 = vi.fn();
//     encryptBlobToFile = vi.fn();

//     init = vi.fn();
//     terminateAll = vi.fn();
//   }

//   const createCryptoWorkerPool = vi.fn(() => new CryptoWorkerPool());

//   return {
//     createCryptoWorkerPool,
//   };
// });

class MockCryptoWorkerPool {
  genNewUserKeys = vi.fn();
  encryptFile = vi.fn();
  encryptObject = vi.fn();
  encryptBoxBase64 = vi.fn();
  encryptBlobToFile = vi.fn();

  init = vi.fn();
  terminateAll = vi.fn();
}

const cryptoWorkerPool = new MockCryptoWorkerPool();

// const MockWorkerContext = createContext({});

const { MockWorkerContext } = await vi.hoisted(async () => {
  const { createContext } = await import("react");
  return { MockWorkerContext: createContext({}) };
});

const MockWorkerProvider = ({ children }: { children: ReactNode }) => {
  const cryptoWorkerPoolRef = useRef(cryptoWorkerPool);
  return (
    <MockWorkerContext.Provider value={{ cryptoWorkerPool: cryptoWorkerPoolRef }}>
      {children}
    </MockWorkerContext.Provider>
  );
};

vi.mock("../providers/WorkerProvider", async (importOriginal) => {
  const mod = await importOriginal<typeof import("../providers/WorkerProvider")>();
  return {
    ...mod,
    WorkerContext: MockWorkerContext,
  };
});

const renderFinishSignUp = () => {
  render(
    <MockWorkerProvider>
      <FinishSignUp />
    </MockWorkerProvider>,
  );
};

describe("FinishSignUp", () => {
  let emailField: HTMLInputElement;
  let passwordField: HTMLInputElement;
  let passwordRepeatField: HTMLInputElement;
  let submitButton: HTMLButtonElement;

  const renee = testUsers.renee;
  const ty = testUsers.ty;
  const julia = testUsers.julia;

  afterAll(async () => {
    await resetDB();
  });

  // const genNewUserKeys = vi.fn(async (_password: string) => {
  //   return renee.signUpParams.keyParams;
  // });

  // const genNewUserKeys = vi.fn();

  beforeAll(async () => {
    // vi.mock("@acloud/client", async (importOriginal) => {
    //   const mod = await importOriginal<typeof import("@acloud/client")>();

    //   return {
    //     ...mod,
    //     createCryptoWorkerPool: vi.fn(async () => ({
    //       genNewUserKeys: vi.fn(),
    //     })),
    //   };
    // });

    vi.mock("@acloud/crypto", async (importOriginal) => {
      const mod = await importOriginal<typeof import("@acloud/crypto")>();

      return {
        ...mod,
        genSrpAttributes: vi.fn((_password: string) => renee.signUpParams.srpParams),
      };
    });

    await createVerifiedTestUser("renee");
    await createNewTestUser("ty");
    await createSignedUpTestUser("julia");

    cryptoWorkerPool.genNewUserKeys.mockReturnValue(renee.signUpParams.keyParams);
  });

  afterEach(() => {
    (
      api["user-auth"]["finish-sign-up"].put as Mock<
        (typeof api)["user-auth"]["finish-sign-up"]["put"]
      >
    ).mockClear();
  });

  describe("valid form values", () => {
    beforeEach(async () => {
      const tmpSignUpAuthJWT = await genJWT({
        userId: renee.userId,
        ott: "12345d",
      });
      await cookieJar.setCookie(`tmpSignUpAuth=${tmpSignUpAuthJWT}`, config.endpoint.api);
      window.localStorage.setItem("email", renee.email);

      renderFinishSignUp();
      emailField = screen.getByLabelText<HTMLInputElement>("Email");
      passwordField = screen.getByLabelText<HTMLInputElement>("Password");
      passwordRepeatField = screen.getByLabelText<HTMLInputElement>("Repeat Password");
      submitButton = screen.getByRole<HTMLButtonElement>("button", { name: /submit/i });

      cryptoWorkerPool.genNewUserKeys.mockReturnValueOnce(renee.signUpParams.keyParams);
      (genSrpAttributes as Mock).mockReturnValueOnce(renee.signUpParams.srpParams);
    });

    it("finishes the sign up", async () => {
      const { password } = renee;

      expect(emailField.value).toBe(renee.email);
      fireEvent.change(passwordField, { target: { value: password } });
      fireEvent.change(passwordRepeatField, { target: { value: password } });
      fireEvent.click(submitButton);

      await waitFor(async () => {
        expect(api["user-auth"]["finish-sign-up"].put).toHaveBeenCalledWith(renee.signUpParams);
      });

      await waitFor(() => {
        expect(cryptoWorkerPool.genNewUserKeys).toHaveBeenCalledWith(renee.password);
        expect(genSrpAttributes).toHaveBeenCalledWith(renee.password);
      });

      await waitFor(() => {
        expect(useLocation()[1]).toHaveBeenCalledWith("/sign-in");
      });

      const cookies = await cookieJar.getCookies(config.endpoint.api);
      expect(cookies.length).toBe(0);

      expect(
        await db.query.keysTable.findFirst({
          where: (k, { eq }) => eq(k.userId, renee.userId),
        }),
      ).toMatchObject(renee.signUpParams.keyParams);

      expect(
        await db.query.srpsTable.findFirst({
          where: (s, { eq }) => eq(s.userId, renee.userId),
        }),
      ).toMatchObject(renee.signUpParams.srpParams);
    });
  });

  describe("invalid form values", () => {
    beforeEach(async () => {
      window.localStorage.setItem("email", renee.email);

      renderFinishSignUp();
      emailField = screen.getByLabelText<HTMLInputElement>("Email");
      passwordField = screen.getByLabelText<HTMLInputElement>("Password");
      passwordRepeatField = screen.getByLabelText<HTMLInputElement>("Repeat Password");
      submitButton = screen.getByRole<HTMLButtonElement>("button", { name: /submit/i });
    });

    it("does not submit the form", async () => {
      const password = "password123";

      expect(emailField.value).toBe(renee.email);
      fireEvent.change(passwordField, { target: { value: password } });
      fireEvent.change(passwordRepeatField, { target: { value: "different" } });
      fireEvent.click(submitButton);

      await waitFor(async () => {
        expect(api["user-auth"]["finish-sign-up"].put).not.toHaveBeenCalled();
      });

      expect(await screen.findByText("Passwords not equal")).toBeDefined();
    });
  });

  describe("not verified user", () => {
    beforeEach(async () => {
      const tmpSignUpAuthJWT = await genJWT({
        userId: ty.userId,
        ott: "12345d",
      });
      await cookieJar.setCookie(`tmpSignUpAuth=${tmpSignUpAuthJWT}`, config.endpoint.api);
      window.localStorage.setItem("email", ty.email);

      renderFinishSignUp();
      emailField = screen.getByLabelText<HTMLInputElement>("Email");
      passwordField = screen.getByLabelText<HTMLInputElement>("Password");
      passwordRepeatField = screen.getByLabelText<HTMLInputElement>("Repeat Password");
      submitButton = screen.getByRole<HTMLButtonElement>("button", { name: /submit/i });

      cryptoWorkerPool.genNewUserKeys.mockReturnValueOnce(ty.signUpParams.keyParams);
      (genSrpAttributes as Mock).mockReturnValueOnce(ty.signUpParams.srpParams);
    });

    it("redirects to /verify-ott", async () => {
      const { password } = ty;

      expect(emailField.value).toBe(ty.email);
      fireEvent.change(passwordField, { target: { value: password } });
      fireEvent.change(passwordRepeatField, { target: { value: password } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(cryptoWorkerPool.genNewUserKeys).toHaveBeenCalledWith(ty.password);
        expect(genSrpAttributes).toHaveBeenCalledWith(ty.password);
      });

      await waitFor(async () => {
        expect(api["user-auth"]["finish-sign-up"].put).toHaveBeenCalledWith(ty.signUpParams);
      });

      await waitFor(() => {
        expect(useLocation()[1]).toHaveBeenCalledWith("/ott");
      });
    });
  });

  describe("already finished user", () => {
    beforeEach(async () => {
      const tmpSignUpAuthJWT = await genJWT({
        userId: julia.userId,
        ott: "12345d",
      });
      await cookieJar.setCookie(`tmpSignUpAuth=${tmpSignUpAuthJWT}`, config.endpoint.api);
      window.localStorage.setItem("email", julia.email);

      renderFinishSignUp();
      emailField = screen.getByLabelText<HTMLInputElement>("Email");
      passwordField = screen.getByLabelText<HTMLInputElement>("Password");
      passwordRepeatField = screen.getByLabelText<HTMLInputElement>("Repeat Password");
      submitButton = screen.getByRole<HTMLButtonElement>("button", { name: /submit/i });

      cryptoWorkerPool.genNewUserKeys.mockReturnValueOnce(julia.signUpParams.keyParams);
      (genSrpAttributes as Mock).mockReturnValueOnce(julia.signUpParams.srpParams);
    });

    it("redirects to /sign-in", async () => {
      const { password } = julia;

      expect(emailField.value).toBe(julia.email);
      fireEvent.change(passwordField, { target: { value: password } });
      fireEvent.change(passwordRepeatField, { target: { value: password } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(cryptoWorkerPool.genNewUserKeys).toHaveBeenCalledWith(julia.password);
        expect(genSrpAttributes).toHaveBeenCalledWith(julia.password);
      });

      await waitFor(async () => {
        expect(api["user-auth"]["finish-sign-up"].put).toHaveBeenCalledWith(julia.signUpParams);
      });

      await waitFor(() => {
        expect(useLocation()[1]).toHaveBeenCalledWith("/sign-in");
      });
    });
  });
});
