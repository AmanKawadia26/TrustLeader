import { pgTable, text, real, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const referralStatusEnum = pgEnum("referral_status", ["pending", "approved", "paid"]);

export const resellersTable = pgTable("resellers", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  user_id: text("user_id").notNull().unique(),
  total_earnings: real("total_earnings").notNull().default(0),
  pending_earnings: real("pending_earnings").notNull().default(0),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

export const referralsTable = pgTable("referrals", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  reseller_id: text("reseller_id").notNull(),
  business_id: text("business_id").notNull(),
  status: referralStatusEnum("status").notNull().default("pending"),
  commission_amount: real("commission_amount").notNull().default(0),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

export const insertResellerSchema = createInsertSchema(resellersTable).omit({ id: true, created_at: true, updated_at: true });
export const insertReferralSchema = createInsertSchema(referralsTable).omit({ id: true, created_at: true, updated_at: true });
export type InsertReseller = z.infer<typeof insertResellerSchema>;
export type Reseller = typeof resellersTable.$inferSelect;
export type InsertReferral = z.infer<typeof insertReferralSchema>;
export type Referral = typeof referralsTable.$inferSelect;
