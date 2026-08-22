import { pgTable, uuid, varchar, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  fullName: varchar("full_name", { length: 150 }).notNull(),
  avatarUrl: text("avatar_url"),
  preferredStyle: varchar("preferred_style", { length: 100 }).default("Cultural Explorer"),
  language: varchar("language", { length: 10 }).notNull().default("en"),
  homeCity: varchar("home_city", { length: 150 }),
  bio: text("bio"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
