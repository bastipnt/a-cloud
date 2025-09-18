import { getFullPath } from "@acloud/config";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { reset } from "drizzle-seed";
import { db, schema } from "./src/db";

export * from "drizzle-orm";

export const migrateDB = () =>
  migrate(db, { migrationsFolder: getFullPath(import.meta.url, "./drizzle") });

export const resetDB = () => reset(db, schema);

export {
  checkUserExistsByUserId,
  findOttByUserId,
  findUserByEmail,
  findUserByUserId,
} from "./src/helpers/query-helper";

export { getKeyParamsByUserId } from "./src/helpers/key-query-helper";

export { filesTable, type FileType } from "./src/schema/files";
export { keysTable } from "./src/schema/keys";
export { ottsTable, type OTTType } from "./src/schema/otts";
export { srpsTable } from "./src/schema/srps";
export { usersTable, type UserType } from "./src/schema/users";

export { createNewTestUser, createSignedUpTestUser, createVerifiedTestUser } from "./src/seed";

export { eq } from "drizzle-orm";

export { db };

export { getDateNow } from "./src/helpers/default-value-helpers";
