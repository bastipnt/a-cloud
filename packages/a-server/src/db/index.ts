import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
// import { migrate } from "drizzle-orm/bun-sqlite/migrator";

import * as usersSchema from "./schema/users";
import * as keysSchema from "./schema/keys";
import * as ottsSchema from "./schema/otts";
import * as filesSchema from "./schema/files";
import * as srpsSchema from "./schema/srps";
import { dbConf } from "../../config";

export const db = drizzle(
  `postgres://${dbConf.user}:${dbConf.password}@${dbConf.host}:${dbConf.port}/${dbConf.name}
`,
  {
    schema: {
      ...usersSchema,
      ...keysSchema,
      ...ottsSchema,
      ...filesSchema,
      ...srpsSchema,
    },
  }
);

export const migrateDB = () => migrate(db, { migrationsFolder: "./drizzle" });
