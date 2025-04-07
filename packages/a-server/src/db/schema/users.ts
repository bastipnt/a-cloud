import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { getDateNow } from "../helpers/default-value-helpers";
import { relations } from "drizzle-orm";
import { keysTable } from "./keys";
import { filesTable } from "./files";

export const usersTable = sqliteTable("users", {
  userId: text()
    .$defaultFn(() => crypto.randomUUID())
    .primaryKey(),
  encryptedEmail: text().notNull().unique(),
  emailNonce: text().notNull(),
  emailHash: text().notNull(),

  hasTwoFactorEnabled: integer({ mode: "boolean" })
    .notNull()
    .$defaultFn(() => false),
  hasEmailVerified: integer({ mode: "boolean" })
    .notNull()
    .$defaultFn(() => false),

  createdAt: integer({ mode: "timestamp" })
    .notNull()
    .$defaultFn(() => getDateNow()),
});

export const usersFilesRelations = relations(usersTable, ({ many }) => ({
  files: many(filesTable),
}));

export const usersKeysRelations = relations(usersTable, ({ one }) => ({
  keys: one(keysTable),
}));
