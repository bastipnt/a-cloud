import { relations } from "drizzle-orm";
import { integer, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { getDateNow } from "../helpers/default-value-helpers";
import { usersTable } from "./users";

export const keysTable = pgTable("keys", {
  id: varchar()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  userId: varchar()
    .notNull()
    .references(() => usersTable.userId),

  keyEncryptionKeySalt: varchar().notNull(),

  encryptedMainKey: varchar().notNull(), // encrypted with `keyEncryptionKey`
  mainKeyNonce: varchar().notNull(),

  encryptedMainKeyWithRecoveryKey: varchar().notNull(), // encrypted with `recoveryKey`
  mainKeyWithRecoveryKeyNonce: varchar().notNull(),

  encryptedRecoveryKey: varchar().notNull(), // encrypted with `mainKey`
  recoveryKeyNonce: varchar().notNull(),

  encryptedPrivateKey: varchar().notNull(), // encrypted with `mainKey`
  privateKeyNonce: varchar().notNull(),
  publicKey: varchar().notNull(), // used to encrypt `authToken`

  memLimit: integer().notNull(),
  opsLimit: integer().notNull(),

  createdAt: timestamp()
    .notNull()
    .$defaultFn(() => getDateNow()),
});

export const keysUsersRelaltions = relations(keysTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [keysTable.userId],
    references: [usersTable.userId],
  }),
}));
