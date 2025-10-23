import { config } from "@acloud/config";
import jwt from "@elysiajs/jwt";
import Elysia from "elysia";

export const jwtPlugin = new Elysia({ name: "jwt/plugin" })
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
