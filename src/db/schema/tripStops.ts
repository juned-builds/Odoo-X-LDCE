import { pgTable, uuid, varchar, date, integer, timestamp, index } from "drizzle-orm/pg-core";
import { trips } from "./trips.ts";
import { destinations } from "./destinations.ts";

export const tripStops = pgTable(
  "trip_stops",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tripId: uuid("trip_id")
      .notNull()
      .references(() => trips.id, { onDelete: "cascade" }),
    destinationId: varchar("destination_id", { length: 50 }).references(() => destinations.id, {
      onDelete: "set null",
    }),
    city: varchar("city", { length: 100 }).notNull(),
    country: varchar("country", { length: 100 }).notNull(),
    durationDays: integer("duration_days").notNull().default(1),
    startDate: date("start_date").notNull(),
    endDate: date("end_date").notNull(),
    stopOrder: integer("stop_order").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_trip_stops_trip_order").on(table.tripId, table.stopOrder),
  ]
);
