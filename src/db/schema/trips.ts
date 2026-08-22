import { pgTable, uuid, varchar, text, date, integer, numeric, timestamp, index } from "drizzle-orm/pg-core";
import { users } from "./users.ts";

export const trips = pgTable(
  "trips",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 200 }).notNull(),
    routeSummary: varchar("route_summary", { length: 255 }),
    startDate: date("start_date").notNull(),
    endDate: date("end_date").notNull(),
    durationDays: integer("duration_days").notNull().default(1),
    status: varchar("status", { length: 20 }).notNull().default("planning"),
    coverImageUrl: text("cover_image_url"),
    progressPercentage: integer("progress_percentage").notNull().default(0),
    budgetTotal: numeric("budget_total", { precision: 12, scale: 2 }).notNull().default("0.00"),
    currency: varchar("currency", { length: 10 }).notNull().default("₹"),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_trips_user_id").on(table.userId),
    index("idx_trips_status").on(table.userId, table.status),
    index("idx_trips_dates").on(table.startDate, table.endDate),
  ]
);
