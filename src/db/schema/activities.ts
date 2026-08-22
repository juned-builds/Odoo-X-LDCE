import { pgTable, varchar, text, integer, numeric, jsonb, timestamp, index } from "drizzle-orm/pg-core";
import { destinations } from "./destinations.ts";

export const activities = pgTable(
  "activities",
  {
    id: varchar("id", { length: 50 }).primaryKey(),
    destinationId: varchar("destination_id", { length: 50 })
      .notNull()
      .references(() => destinations.id, { onDelete: "cascade" }),
    destinationCity: varchar("destination_city", { length: 100 }).notNull(),
    destinationCountry: varchar("destination_country", { length: 100 }).notNull(),
    name: varchar("name", { length: 200 }).notNull(),
    type: varchar("type", { length: 50 }).notNull().default("Culture"),
    description: text("description").notNull(),
    costDisplay: varchar("cost_display", { length: 30 }).notNull().default("₹0"),
    costTier: varchar("cost_tier", { length: 10 }).notNull().default("Free"),
    costNumeric: numeric("cost_numeric", { precision: 10, scale: 2 }).notNull().default("0.00"),
    durationDisplay: varchar("duration_display", { length: 30 }).notNull().default("2 hrs"),
    durationMinutes: integer("duration_minutes").notNull().default(120),
    durationRange: varchar("duration_range", { length: 20 }).notNull().default("medium"),
    rating: numeric("rating", { precision: 3, scale: 2 }).notNull().default("4.50"),
    reviewCount: integer("review_count").notNull().default(0),
    imageUrl: text("image_url").notNull(),
    bestTime: varchar("best_time", { length: 50 }).default("Morning"),
    tags: jsonb("tags").notNull().default("[]"),
    popularity: integer("popularity").notNull().default(80),
    location: varchar("location", { length: 200 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_activities_dest_type").on(table.destinationId, table.type),
    index("idx_activities_cost_duration").on(table.destinationId, table.costTier, table.durationRange),
    index("idx_activities_popularity").on(table.popularity),
  ]
);
