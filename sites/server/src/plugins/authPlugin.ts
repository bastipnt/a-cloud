import jwt from "@elysiajs/jwt";
import Elysia from "elysia";
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
  });
