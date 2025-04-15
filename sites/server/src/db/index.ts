import { config } from "@acloud/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { reset } from "drizzle-seed";
import * as filesSchema from "./schema/files";
import * as keysSchema from "./schema/keys";
import * as ottsSchema from "./schema/otts";
import * as srpsSchema from "./schema/srps";
import * as usersSchema from "./schema/users";

// import { migrate } from "drizzle-orm/bun-sqlite/migrator";

const schema = {
  ...usersSchema,
  ...keysSchema,
  ...ottsSchema,
  ...filesSchema,
  ...srpsSchema,
};

export const db = drizzle(
  `postgres://${config.db.user}:${config.db.password}@${config.db.host}:${config.db.port}/${config.db.name}
`,
  { schema },
);

export const migrateDB = () => migrate(db, { migrationsFolder: "./drizzle" });

export const resetDB = () => reset(db, schema);

export { findUserByEmail, findOttByUserId, findUserByUserId } from "./helpers/query-helper";
