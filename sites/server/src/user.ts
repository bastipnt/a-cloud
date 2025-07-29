import Elysia from "elysia";
import { authPlugin } from "./plugins/authPlugin";

class UserController {}

export const userService = new Elysia({ name: "user/service" })
  .use(authPlugin)
  .macro(({ onBeforeHandle }) => ({
    isSignedIn(enabled: boolean) {
      if (!enabled) return;

      onBeforeHandle(async ({ status, jwt, cookie: { auth } }) => {
        const value = await jwt.verify(auth?.value);
        if (!value) return status(401, { success: false, message: "Unauthorized" });
        return;
      });
    },
  }));

export const withUserId = new Elysia()
  .use(userService)
  .guard({ isSignedIn: true })
  .resolve(async ({ jwt, cookie: { auth } }) => {
    const value = (await jwt.verify(auth?.value)) as {
      userId: string;
      exp: number;
    };
    const userId = value.userId;
    return { userId };
  })
  .as("scoped");

export const userRoutes = new Elysia({ prefix: "/user" })
  .decorate("userController", new UserController())
  .use(withUserId)
  .get("/", async ({ userId }) => {
    return { message: "Get user", userId };
  })
  .post("/sign-out", ({ cookie: { auth } }) => {
    auth?.remove();
  });
