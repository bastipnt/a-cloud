import { drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";

import { Database } from "bun:sqlite";

const sqlite = new Database("data/sqlite.db");
export const db = drizzle(sqlite);
export const migrateDB = () => migrate(db, { migrationsFolder: "./drizzle" });
