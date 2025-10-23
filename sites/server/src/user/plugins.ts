import Elysia from "elysia";
import { jwtPlugin } from "../plugins/jwtPlugin";
import { UserService } from "./service";
import { UserCookie } from "./model";
import { authCookie } from "../auth/model";

export const userPlugin = new Elysia({ name: "user/plugin" })
  .use(jwtPlugin)
  .model({ authCookie })
  .decorate("userService", UserService)
  .macro({
    isSignedIn: {
      async resolve({ status, jwt, cookie: { auth }, userService: { checkUserExists } }) {
        // @ts-expect-error somehow the type is not set
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
      cookie: "authCookie",
    },
  });

export const withUserIdPlugin = new Elysia({ name: "withUserId/plugin" })
  .use(userPlugin)
  .guard({ isSignedIn: true })
  .resolve(async ({ jwt, cookie: { auth } }) => {
    // @ts-expect-error somehow the type is not set
    const value = (await jwt.verify(auth?.value)) as UserCookie;
    const userId = value.userId;
    return { userId };
  })
  .as("scoped");
