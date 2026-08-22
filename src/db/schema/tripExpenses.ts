import { pgTable, uuid, varchar, text, date, integer, numeric, timestamp, index } from "drizzle-orm/pg-core";
import { trips } from "./trips.ts";

export const tripExpenses = pgTable(
  "trip_expenses",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tripId: uuid("trip_id")
      .notNull()
      .references(() => trips.id, { onDelete: "cascade" }),
    category: varchar("category", { length: 30 }).notNull(),
    name: varchar("name", { length: 200 }).notNull(),
    amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
    expenseDate: date("expense_date").notNull(),
    dayNumber: integer("day_number"),
    notes: text("notes"),
    destinationCity: varchar("destination_city", { length: 100 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_trip_expenses_trip_cat").on(table.tripId, table.category),
    index("idx_trip_expenses_trip_date").on(table.tripId, table.expenseDate),
  ]
);
