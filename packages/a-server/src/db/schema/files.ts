import { pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { usersTable } from "./users";
import { getDateNow } from "../helpers/default-value-helpers";

export const filesTable = pgTable("files", {
  fileId: varchar()
    .$defaultFn(() => crypto.randomUUID())
    .primaryKey(),

  ownerId: varchar()
    .notNull()
    .references(() => usersTable.userId),

  fileDecryptionHeader: varchar().notNull(),
  thumbnailDecryptionHeader: varchar(),

  metadataDecryptionHeader: varchar().notNull(),
  encryptedMetadata: varchar().notNull(), // encrypted with `mainKey` and  `metadateDecryptionHeader`

  createdAt: timestamp()
    .notNull()
    .$defaultFn(() => getDateNow()),
  updatedAt: timestamp()
    .notNull()
    .$defaultFn(() => getDateNow()),
});

export const filesUsersRelations = relations(filesTable, ({ one }) => ({
  owner: one(usersTable, {
    fields: [filesTable.ownerId],
    references: [usersTable.userId],
  }),
}));
