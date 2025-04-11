import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { dbConf } from "../../config";
import * as filesSchema from "./schema/files";
import * as keysSchema from "./schema/keys";
import * as ottsSchema from "./schema/otts";
import * as srpsSchema from "./schema/srps";
// import { migrate } from "drizzle-orm/bun-sqlite/migrator";

import * as usersSchema from "./schema/users";

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
  },
);

export const migrateDB = () => migrate(db, { migrationsFolder: "./drizzle" });
