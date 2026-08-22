import { pgTable, uuid, varchar, timestamp, primaryKey, index } from "drizzle-orm/pg-core";
import { users } from "./users.ts";
import { destinations } from "./destinations.ts";

export const savedDestinations = pgTable(
  "saved_destinations",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    destinationId: varchar("destination_id", { length: 50 })
      .notNull()
      .references(() => destinations.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.destinationId] }),
    index("idx_saved_destinations_user").on(table.userId),
  ]
);
