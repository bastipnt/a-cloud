import Elysia from "elysia";
import { jwtPlugin } from "../plugins/jwtPlugin";
import {
  authCookie,
  cookies,
  finishSignUpParams,
  signInAlreadySignedInResponseParams,
  signInErrorResponseParams,
  signInParams,
  signInResponseParams,
  signInVerifySrpParams,
  signUpUserParams,
  tmpSignInAuthCookie,
  tmpSignUpAuthCookie,
  verifyOTTParams,
} from "./model";

export const userAuthPlugin = new Elysia({ name: "user-auth/plugin" })
  .use(jwtPlugin)
  .model({
    signUpUserParams,
    finishSignUpParams,
    signInParams,
    verifyOTTParams,
    signInVerifySrpParams,
    cookies,
    authCookie,
    tmpSignInAuthCookie,
    tmpSignUpAuthCookie,
    signInResponseParams,
    signInAlreadySignedInResponseParams,
    signInErrorResponseParams,
  })
  .macro({
    isSignedIn: {
      async resolve({ status, jwt, cookie: { auth } }) {
        // @ts-expect-error somehow the type is not set
        const value = await jwt.verify(auth?.value);
        if (!value) return status(401, "Unauthorized");

        return;
      },
      cookie: "authCookie",
    },

    isOTTtmpSignedIn: {
      async resolve({ status, jwt, cookie: { tmpSignUpAuth } }) {
        // @ts-expect-error somehow the type is not set
        const value = await jwt.verify(tmpSignUpAuth?.value);

        console.log({ value });

        if (!value) return status(401, "Unauthorized");

        return;
      },
      cookie: "tmpSignUpAuthCookie",
    },
  });

export const withOTTtmpUserIdPlugin = new Elysia({ name: "withOTTtmpUserId/plugin" })
  .use(userAuthPlugin)
  .guard({ isSignedIn: false, isOTTtmpSignedIn: true })
  .resolve(async ({ jwt, cookie }) => {
    // @ts-expect-error somehow the type is not set
    const value = (await jwt.verify(cookie.tmpSignUpAuth?.value)) as {
      userId: string;
      ott: string;
      exp: number;
    };

    console.log("lol", { cookie, value });

    const { userId, ott } = value;
    return { userId, ott };
  })
  .as("scoped");
