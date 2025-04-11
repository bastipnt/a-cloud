import { relations } from "drizzle-orm";
import { pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { getDateNow } from "../helpers/default-value-helpers";
import { usersTable } from "./users";

export const srpsTable = pgTable("srps", {
  userId: varchar()
    .notNull()
    .primaryKey()
    .references(() => usersTable.userId),

  srpSalt: varchar().notNull(),

  srpVerifier: varchar().notNull(),

  createdAt: timestamp()
    .notNull()
    .$defaultFn(() => getDateNow()),
});

export const srpsUsersRelaltions = relations(srpsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [srpsTable.userId],
    references: [usersTable.userId],
  }),
}));
