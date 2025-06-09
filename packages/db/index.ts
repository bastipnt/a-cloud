import { getFullPath } from "@acloud/config";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { reset } from "drizzle-seed";
import { db, schema } from "./src/db";

export const migrateDB = () =>
  migrate(db, { migrationsFolder: getFullPath(import.meta.url, "./drizzle") });

export const resetDB = () => reset(db, schema);

export {
  findUserByEmail,
  findOttByUserId,
  findUserByUserId,
  checkUserExistsByUserId,
} from "./src/helpers/query-helper";

export { getKeyParamsByUserId } from "./src/helpers/key-query-helper";

export { usersTable, type UserType } from "./src/schema/users";
export { keysTable } from "./src/schema/keys";
export { ottsTable, type OTTType } from "./src/schema/otts";
export { filesTable, type FileType } from "./src/schema/files";
export { srpsTable } from "./src/schema/srps";

export { createNewTestUser, createSignedUpTestUser, createVerifiedTestUser } from "./src/seed";

export { eq } from "drizzle-orm";

export { db };
