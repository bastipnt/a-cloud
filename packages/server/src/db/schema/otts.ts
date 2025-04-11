import { relations } from "drizzle-orm";
import { pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { getDateNow, getFutureDate } from "../helpers/default-value-helpers";
import { usersTable } from "./users";

export const ottsTable = pgTable("otts", {
  userId: varchar()
    .notNull()
    .primaryKey()
    .references(() => usersTable.userId),

  ott: varchar().notNull(),

  createdAt: timestamp()
    .notNull()
    .$defaultFn(() => getDateNow()),

  expiresAt: timestamp()
    .notNull()
    .$defaultFn(() => getFutureDate(60)),
});

export const ottsUsersRelaltions = relations(ottsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [ottsTable.userId],
    references: [usersTable.userId],
  }),
}));
