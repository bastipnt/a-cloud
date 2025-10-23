import Elysia from "elysia";
import {
  srpState,
  UserAlreadyVerifiedError,
  UserEmailNotVerifiedError,
  UserNotFoundError,
} from "./model";
import { userAuthPlugin, withOTTtmpUserIdPlugin } from "./plugins";
import { UserAuthService } from "./service";

export const userAuthRoutes = new Elysia({ prefix: "/user-auth" })
  .state("srp", srpState)
  .use(userAuthPlugin)
  .decorate("userAuthController", UserAuthService)
  .put(
    "/sign-up",
    async ({ body: { email }, userAuthController }): Promise<AResponse> => {
      const res = await userAuthController.signUp({ email });

      if (res === "alreadyVerified") return { message: res };

      return { message: "signedUp" };
    },
    {
      body: "signUpUserParams",
    },
  )
  /**
   * Used to verify the email address initially
   */
  .post(
    "/verify-ott",
    async ({
      userAuthController,
      body: { email, ott },
      status,
      cookie: { tmpSignUpAuth },
      jwt,
    }) => {
      let userId: string;

      try {
        userId = await userAuthController.verifyOTT({ email, ott });
      } catch {
        return status(401, "Unauthorized");
      }

      const value = await jwt.sign({ userId, ott });

      tmpSignUpAuth.set({
        value,
        httpOnly: true,
        maxAge: 1800, // 30 min
        sameSite: false,
        secure: false, // TODO: enable
      });

      return { message: "verified" };
    },
    { body: "verifyOTTParams", cookie: "cookies" },
  )
  .post(
    "/sign-in",
    async ({
      body: { email, srpClientEphemeralPublic },
      userAuthController,
      store,
      jwt,
      cookie: { tmpSignInAuth, auth },
    }) => {
      // Check user already signed in
      if (auth?.value) {
        const value = await jwt.verify(auth.value);
        if (value) {
          return { message: "already signed in" };
        } else {
          auth.remove();
        }
      }

      const { srpSalt, srpServerEphemeral, srpVerifier, userId } =
        await userAuthController.genSrpServerEphemeral(email);

      const srpServerEphemeralPublic = srpServerEphemeral.public;
      const srpServerEphemeralSecret = srpServerEphemeral.secret;

      // Remove previous entries
      store.srp.signInUsers = store.srp.signInUsers.filter((srp) => srp.userId !== userId);

      store.srp.signInUsers.push({
        userId,
        srpServerEphemeralSecret,
        srpSalt,
        srpVerifier,
      });

      const value = await jwt.sign({ userId, srpClientEphemeralPublic });

      tmpSignInAuth.set({
        value,
        httpOnly: true,
        maxAge: 1800, // 30 min
        sameSite: false,
        secure: false, // TODO: enable
      });

      return {
        srpSalt,
        srpServerEphemeralPublic,
      };
    },
    {
      body: "signInParams",
      cookie: "cookies",
    },
  )
  .post(
    "/sign-in/verify-srp",
    async ({
      body: { srpClientSessionProof },
      userAuthController,
      store,
      status,
      jwt,
      cookie: { auth, tmpSignInAuth },
    }) => {
      // Check user already signed in
      if (auth?.value) {
        const value = await jwt.verify(auth.value);
        if (value) {
          return status(208, { message: "already signed in" });
        }
      }

      const tmpSignInAuthValue = (await jwt.verify(tmpSignInAuth?.value)) as {
        userId: string;
        srpClientEphemeralPublic: string;
        exp: number;
      };

      const { userId, srpClientEphemeralPublic } = tmpSignInAuthValue;

      const srpUserState = store.srp.signInUsers.find((srp) => srp.userId === userId);
      if (!srpUserState) return status(401, { message: "Unauthorized" });

      const userExists = await userAuthController.checkUserExistsByUserId(userId);

      if (!userExists) return status(401, { message: "Unauthorized" });

      const { srpServerEphemeralSecret, srpSalt, srpVerifier } = srpUserState;
      let srpServerSession: Awaited<ReturnType<typeof userAuthController.verifySrpSession>>;

      try {
        srpServerSession = await userAuthController.verifySrpSession(
          srpServerEphemeralSecret,
          srpClientEphemeralPublic,
          srpSalt,
          srpVerifier,
          srpClientSessionProof,
        );
      } catch {
        // wrong password
        return status(401, { message: "Unauthorized" });
      }

      const { proof: srpServerSessionProof, key: srpServerSessionKey } = srpServerSession;

      // Remove user srp session from tmp store
      // TODO: have this in the database (sessions table)
      store.srp.signInUsers = store.srp.signInUsers.filter((srp) => srp.userId !== userId);

      const keyParams = await userAuthController.getKeyParams(userId);

      // create jwt token for further authorization
      const value = await jwt.sign({ userId, srpServerSessionKey });

      // Remove temporary cookie
      tmpSignInAuth?.remove();

      auth.set({
        value,
        httpOnly: true,
        maxAge: 7 * 86400,
        sameSite: false,
        secure: false, // TODO: enable
      });

      return {
        srpServerSessionProof,
        keyParams,
      };
    },
    {
      body: "signInVerifySrpParams",
      cookie: "cookies",
      response: {
        200: "signInResponseParams",
        208: "signInAlreadySignedInResponseParams",
        401: "signInErrorResponseParams",
      },
    },
  )
  .use(withOTTtmpUserIdPlugin)
  .put(
    "/finish-sign-up",
    async ({ body, userId, userAuthController, cookie: { tmpSignUpAuth }, status }) => {
      try {
        await userAuthController.finishSignUp(userId, body);
      } catch (e) {
        if (e instanceof UserNotFoundError) {
          return status(401, "Unauthorized");
        } else if (e instanceof UserEmailNotVerifiedError) {
          return status(401, "Not Verified");
        } else if (e instanceof UserAlreadyVerifiedError) {
          return status(400, e.name);
        }

        throw e;
      } finally {
        tmpSignUpAuth.remove();
      }

      return { status: 200, message: "success" };
    },
    { body: "finishSignUpParams", cookie: "cookies" },
  );
