import { config } from "@acloud/config";
import { drizzle } from "drizzle-orm/node-postgres";
import * as filesSchema from "./schema/files";
import * as keysSchema from "./schema/keys";
import * as ottsSchema from "./schema/otts";
import * as srpsSchema from "./schema/srps";
import * as usersSchema from "./schema/users";

export const schema = {
  ...usersSchema,
  ...keysSchema,
  ...ottsSchema,
  ...filesSchema,
  ...srpsSchema,
};

const connectionString = `postgres://${config.db.user}:${config.db.password}@${config.db.host}:${config.db.port}/${config.db.name}`;

export const db = drizzle(connectionString, { schema });
