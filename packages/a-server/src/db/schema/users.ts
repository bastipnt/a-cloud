import { relations } from "drizzle-orm";
import { boolean, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { getDateNow } from "../helpers/default-value-helpers";
import { filesTable } from "./files";
import { keysTable } from "./keys";
import { ottsTable } from "./otts";
import { srpsTable } from "./srps";

export const usersTable = pgTable("users", {
  userId: varchar()
    .$defaultFn(() => crypto.randomUUID())
    .primaryKey(),

  encryptedEmail: varchar().notNull().unique(),
  emailNonce: varchar().notNull(),
  emailHash: varchar().notNull().unique(),

  hasTwoFactorEnabled: boolean()
    .notNull()
    .$defaultFn(() => false),

  hasEmailVerified: boolean()
    .notNull()
    .$defaultFn(() => false),

  createdAt: timestamp()
    .notNull()
    .$defaultFn(() => getDateNow()),
});

export const usersFilesRelations = relations(usersTable, ({ many }) => ({
  files: many(filesTable),
}));

export const usersKeysRelations = relations(usersTable, ({ one }) => ({
  keys: one(keysTable),
}));

export const usersOTTsRelations = relations(usersTable, ({ one }) => ({
  ott: one(ottsTable),
}));

export const usersSRPsRelations = relations(usersTable, ({ one }) => ({
  srp: one(srpsTable),
}));
