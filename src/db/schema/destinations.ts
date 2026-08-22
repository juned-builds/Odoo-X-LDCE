import { pgTable, varchar, text, integer, numeric, jsonb, timestamp, index } from "drizzle-orm/pg-core";

export const destinations = pgTable(
  "destinations",
  {
    id: varchar("id", { length: 50 }).primaryKey(),
    city: varchar("city", { length: 100 }).notNull(),
    country: varchar("country", { length: 100 }).notNull(),
    region: varchar("region", { length: 50 }).notNull(),
    description: text("description").notNull(),
    shortDescription: varchar("short_description", { length: 255 }),
    costIndex: varchar("cost_index", { length: 10 }).notNull().default("$$"),
    popularity: integer("popularity").notNull().default(80),
    rating: numeric("rating", { precision: 3, scale: 2 }).notNull().default("4.50"),
    reviewCount: integer("review_count").notNull().default(0),
    imageUrl: text("image_url").notNull(),
    bestSeason: varchar("best_season", { length: 100 }),
    highlights: jsonb("highlights").notNull().default("[]"),
    tags: jsonb("tags").notNull().default("[]"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_destinations_city_country").on(table.city, table.country),
    index("idx_destinations_region_cost").on(table.region, table.costIndex),
    index("idx_destinations_popularity").on(table.popularity),
  ]
);
