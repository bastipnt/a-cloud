import { config } from "@acloud/config";
import jwt from "@elysiajs/jwt";
import Elysia from "elysia";

export const authPlugin = new Elysia()
  .use(
    jwt({
      name: "jwt",
      secret: config.jwt.secret,
      exp: "7d",
    }),
  )
  .derive({ as: "scoped" }, ({ jwt }) => {
    return { jwt };
  });
