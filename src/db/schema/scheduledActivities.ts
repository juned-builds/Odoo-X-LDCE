import { pgTable, uuid, varchar, text, date, time, integer, numeric, boolean, timestamp, index } from "drizzle-orm/pg-core";
import { trips } from "./trips.ts";
import { tripStops } from "./tripStops.ts";
import { activities } from "./activities.ts";

export const scheduledActivities = pgTable(
  "scheduled_activities",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tripId: uuid("trip_id")
      .notNull()
      .references(() => trips.id, { onDelete: "cascade" }),
    stopId: uuid("stop_id").references(() => tripStops.id, { onDelete: "set null" }),
    activityId: varchar("activity_id", { length: 50 }).references(() => activities.id, {
      onDelete: "set null",
    }),
    name: varchar("name", { length: 200 }).notNull(),
    type: varchar("type", { length: 50 }).notNull().default("Culture"),
    destinationCity: varchar("destination_city", { length: 100 }).notNull(),
    activityDate: date("activity_date").notNull(),
    dayNumber: integer("day_number").notNull().default(1),
    startTime: time("start_time").notNull(),
    durationDisplay: varchar("duration_display", { length: 30 }).notNull().default("2 hrs"),
    durationMinutes: integer("duration_minutes").notNull().default(120),
    costDisplay: varchar("cost_display", { length: 30 }).notNull().default("₹0"),
    costTier: varchar("cost_tier", { length: 10 }).notNull().default("Free"),
    costNumeric: numeric("cost_numeric", { precision: 10, scale: 2 }).notNull().default("0.00"),
    rating: numeric("rating", { precision: 3, scale: 2 }),
    imageUrl: text("image_url"),
    description: text("description"),
    notes: text("notes"),
    location: varchar("location", { length: 200 }),
    orderIndex: integer("order_index").notNull().default(0),
    isCustom: boolean("is_custom").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_scheduled_act_trip_day_order").on(table.tripId, table.dayNumber, table.orderIndex),
    index("idx_scheduled_act_trip_date").on(table.tripId, table.activityDate),
    index("idx_scheduled_act_activity_id").on(table.activityId),
  ]
);
