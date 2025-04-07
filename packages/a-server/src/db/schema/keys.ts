import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { getDateNow } from "../helpers/default-value-helpers";
import { usersTable } from "./users";
import { relations } from "drizzle-orm";

export const keysTable = sqliteTable("keys", {
  id: text()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  userId: text()
    .notNull()
    .references(() => usersTable.userId),

  keyEncryptionKeySalt: text().notNull(),

  encryptedMainKey: text().notNull(), // encrypted with `keyEncryptionKey`
  mainKeyNonce: text().notNull(),

  encryptedMainKeyWithRecoveryKey: text().notNull(), // encrypted with `recoveryKey`
  mainKeyWithRecoveryKeyNonce: text().notNull(),

  encryptedRecoveryKey: text().notNull(), // encrypted with `mainKey`
  recoveryKeyNonce: text().notNull(),

  encryptedPrivateKey: text().notNull(), // encrypted with `mainKey`
  privateKeyNonce: text().notNull(),
  publicKey: text().notNull(), // used to encrypt `authToken`

  memLimit: integer().notNull(),
  opsLimit: integer().notNull(),

  createdAt: integer({ mode: "timestamp" })
    .notNull()
    .$defaultFn(() => getDateNow()),
});

export const keysUsersRelaltions = relations(keysTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [keysTable.userId],
    references: [usersTable.userId],
  }),
}));
