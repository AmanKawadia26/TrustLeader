import { pgTable, text, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const reviewStatusEnum = pgEnum("review_status", ["pending", "approved", "rejected"]);

export const reviewsTable = pgTable("reviews", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  business_id: text("business_id").notNull(),
  user_id: text("user_id").notNull(),
  rating: integer("rating").notNull(),
  text: text("text").notNull(),
  status: reviewStatusEnum("status").notNull().default("pending"),
  company_response: text("company_response"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

export const insertReviewSchema = createInsertSchema(reviewsTable).omit({ id: true, created_at: true, updated_at: true });
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviewsTable.$inferSelect;
