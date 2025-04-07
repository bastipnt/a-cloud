import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { usersTable } from "./users";
import { getDateNow } from "../helpers/default-value-helpers";

export const filesTable = sqliteTable("files", {
  fileId: text()
    .$defaultFn(() => crypto.randomUUID())
    .primaryKey(),

  ownerId: text().notNull(),

  fileDecryptionHeader: text().notNull(),
  thumbnailDecryptionHeader: text(),

  metadataDecryptionHeader: text().notNull(),
  encryptedMetadata: text().notNull(), // encrypted with `mainKey` and  `metadateDecryptionHeader`

  createdAt: integer({ mode: "timestamp" })
    .notNull()
    .$defaultFn(() => getDateNow()),
  updatedAt: integer({ mode: "timestamp" })
    .notNull()
    .$defaultFn(() => getDateNow()),
});

export const filesUsersRelations = relations(filesTable, ({ one }) => ({
  owner: one(usersTable, {
    fields: [filesTable.ownerId],
    references: [usersTable.userId],
  }),
}));
