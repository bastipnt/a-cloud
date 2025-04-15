import { config } from "@acloud/config";
import { jwt } from "@elysiajs/jwt";

/**
 * Only for testing purposes
 * @param payload values to be stored in jwt
 * @returns valid jwt with payload
 */
export const genJWT = async (payload: Record<string, string | number>) => {
  return await jwt({ secret: config.jwt.secret }).decorator.jwt.sign(payload);
};
