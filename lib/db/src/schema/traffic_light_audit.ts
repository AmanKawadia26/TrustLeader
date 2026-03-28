import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const trafficLightAuditTable = pgTable("traffic_light_audit", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  business_id: text("business_id").notNull(),
  old_state: text("old_state"),
  new_state: text("new_state").notNull(),
  reason: text("reason"),
  triggered_by: text("triggered_by"),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export const insertTrafficLightAuditSchema = createInsertSchema(trafficLightAuditTable).omit({ id: true, created_at: true });
export type InsertTrafficLightAudit = z.infer<typeof insertTrafficLightAuditSchema>;
export type TrafficLightAudit = typeof trafficLightAuditTable.$inferSelect;
