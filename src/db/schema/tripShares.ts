import { pgTable, uuid, varchar, boolean, integer, timestamp, index } from "drizzle-orm/pg-core";
import { trips } from "./trips.ts";

export const tripShares = pgTable(
  "trip_shares",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tripId: uuid("trip_id")
      .notNull()
      .unique()
      .references(() => trips.id, { onDelete: "cascade" }),
    shareToken: varchar("share_token", { length: 100 }).notNull().unique(),
    isEnabled: boolean("is_enabled").notNull().default(true),
    viewCount: integer("view_count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_trip_shares_token").on(table.shareToken),
  ]
);
