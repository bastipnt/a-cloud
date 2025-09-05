import { findUserByUserId } from "@acloud/db";
import Elysia from "elysia";
import { authPlugin } from "./plugins/authPlugin";

type UserCookie = {
  userId: string;
  exp: number;
};

// TODO: check for actual user in db
class UserController {
  async checkUserExists(userId: string) {
    const user = await findUserByUserId(userId);

    return user !== undefined;
  }
}

export const userService = new Elysia({ name: "user/service" })
  .use(authPlugin)
  .decorate("userController", new UserController())
  .macro(({ onBeforeHandle }) => ({
    isSignedIn(enabled: boolean) {
      if (!enabled) return;

      onBeforeHandle(
        async ({ status, jwt, cookie: { auth }, userController: { checkUserExists } }) => {
          const value = (await jwt.verify(auth?.value)) as UserCookie;
          let success = false;

          if (value) {
            const userExists = await checkUserExists(value.userId);
            if (userExists) success = true;
          }

          if (!success) {
            auth?.remove();
            return status(401, { success: false, message: "Unauthorized" });
          }
          return;
        },
      );
    },
  }));

export const withUserId = new Elysia()
  .use(userService)
  .guard({ isSignedIn: true })
  .resolve(async ({ jwt, cookie: { auth } }) => {
    const value = (await jwt.verify(auth?.value)) as UserCookie;
    const userId = value.userId;
    return { userId };
  })
  .as("scoped");

export const userRoutes = new Elysia({ prefix: "/user" })
  .use(withUserId)
  .get("/", async ({ userId }) => {
    return { message: "Get user", userId };
  })
  .post("/sign-out", ({ cookie: { auth } }) => {
    auth?.remove();
  });
