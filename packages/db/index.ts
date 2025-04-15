import { resolve } from "path";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { reset } from "drizzle-seed";
import { db, schema } from "./src/db";

export const migrateDB = () => migrate(db, { migrationsFolder: resolve(__dirname, "./drizzle") });

export const resetDB = () => reset(db, schema);

export { findUserByEmail, findOttByUserId, findUserByUserId } from "./src/helpers/query-helper";

export { usersTable, type UserType } from "./src/schema/users";
export { keysTable } from "./src/schema/keys";
export { ottsTable, type OTTType } from "./src/schema/otts";
export { filesTable } from "./src/schema/files";
export { srpsTable } from "./src/schema/srps";

export { createNewTestUser, createSignedUpTestUser, createVerifiedTestUser } from "./src/seed";

export { eq } from "drizzle-orm";

export { db };
