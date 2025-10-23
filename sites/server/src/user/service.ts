import { findUserByUserId } from "@acloud/db";

// TODO: check for actual user in db
export abstract class UserService {
  static async checkUserExists(userId: string) {
    const user = await findUserByUserId(userId);

    return user !== undefined;
  }
}
