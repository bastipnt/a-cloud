import jwt from "@elysiajs/jwt";
import Elysia, { t } from "elysia";
import { jwtSecret } from "../../config";

export const authPlugin = new Elysia()
  .use(
    jwt({
      name: "jwt",
      secret: jwtSecret,
      exp: "7d",
    }),
  )
  .derive({ as: "scoped" }, ({ jwt }) => {
    return { jwt };
  })
  .guard({
    cookie: t.Optional(
      t.Object({
        auth: t.String(),
        tmpAuth: t.String(),
        tmpOTTAuth: t.String(),
      }),
    ),
  });
// .get("/sign/:name", async ({ jwt, params }) => jwt.sign(params));
