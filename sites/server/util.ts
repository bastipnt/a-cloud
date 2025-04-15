import { jwt } from "@elysiajs/jwt";
import { jwtSecret } from "./config";

/**
 * Only for testing purposes
 * @param payload values to be stored in jwt
 * @returns valid jwt with payload
 */
export const genJWT = async (payload: Record<string, string | number>) => {
  return await jwt({ secret: jwtSecret }).decorator.jwt.sign(payload);
};
