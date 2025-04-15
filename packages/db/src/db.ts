import { config, isTestENV, isWebTestENV } from "@acloud/config";
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

const dbConf = isTestENV ? (isWebTestENV ? config.dbTestWeb! : config.dbTest!) : config.db!;

const connectionString = `postgres://${dbConf.user}:${dbConf.password}@${dbConf.host}:${dbConf.port}/${dbConf.name}`;

export const db = drizzle(connectionString, { schema });
