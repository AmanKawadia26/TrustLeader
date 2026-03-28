import { pgTable, text, boolean, integer, real, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const trafficLightEnum = pgEnum("traffic_light", ["red", "orange", "green"]);

export const businessesTable = pgTable("businesses", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  domain: text("domain").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  traffic_light: trafficLightEnum("traffic_light").notNull().default("orange"),
  green_insurance_eligible: boolean("green_insurance_eligible").notNull().default(false),
  review_count: integer("review_count").notNull().default(0),
  average_rating: real("average_rating"),
  owner_user_id: text("owner_user_id"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

export const insertBusinessSchema = createInsertSchema(businessesTable).omit({ id: true, created_at: true, updated_at: true });
export type InsertBusiness = z.infer<typeof insertBusinessSchema>;
export type Business = typeof businessesTable.$inferSelect;
