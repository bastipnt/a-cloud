import Elysia from "elysia";
import { withUserIdPlugin } from "./plugins";

export const userRoutes = new Elysia({ prefix: "/user" })
  .use(withUserIdPlugin)
  .get("/", async ({ userId }) => {
    return { message: "Get user", userId };
  })
  .post("/sign-out", ({ cookie: { auth } }) => {
    auth?.remove();
  });
