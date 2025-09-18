import { relations, type InferSelectModel } from "drizzle-orm";
import { boolean, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { getDateNow } from "../helpers/default-value-helpers";
import { usersTable } from "./users";

export const filesTable = pgTable("files", {
  fileId: varchar()
    .$defaultFn(() => crypto.randomUUID())
    .primaryKey(),

  parentId: varchar(),

  isDir: boolean()
    .notNull()
    .$defaultFn(() => false),

  isLocal: boolean()
    .notNull()
    .$defaultFn(() => true),

  ownerId: varchar()
    .notNull()
    .references(() => usersTable.userId),

  fileDecryptionHeader: varchar(),
  thumbnailDecryptionHeader: varchar(),
  metadataDecryptionHeader: varchar(),

  encryptedMetadata: varchar().notNull(),

  encryptedFileKey: varchar().notNull(),
  fileKeyNonce: varchar().notNull(),

  createdAt: timestamp()
    .notNull()
    .$defaultFn(() => getDateNow()),
  updatedAt: timestamp()
    .notNull()
    .$defaultFn(() => getDateNow()),

  deletedAt: timestamp(),
});

export const filesUsersRelations = relations(filesTable, ({ one }) => ({
  owner: one(usersTable, {
    fields: [filesTable.ownerId],
    references: [usersTable.userId],
  }),
}));

export const filesFilesRelations = relations(filesTable, ({ one }) => ({
  parent: one(filesTable, {
    fields: [filesTable.parentId],
    references: [filesTable.fileId],
  }),
}));

export type FileType = InferSelectModel<typeof filesTable>;
