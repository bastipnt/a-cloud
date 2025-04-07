import { genNewUserKeys } from "a-crypto";
import { client } from "..";
import type { UserKeys } from "a-crypto/types";

/**
 *
 * @param email the users email
 * @param password the users password
 * @returns the userId of the new created user and the generated keyParams
 */
export const createNewUser = async (
  email: string,
  password: string
): Promise<[string, UserKeys]> => {
  const keyParams = await genNewUserKeys(password);
  const userParams = { email };

  const res = await client.user.new.put({ userParams, keyParams });

  if (!res.data || !res.data.userId)
    throw new Error("User could not be created");

  const { userId } = res.data;

  return [userId, keyParams];
};
