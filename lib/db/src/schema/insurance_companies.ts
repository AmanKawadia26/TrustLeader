import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const insuranceCompaniesTable = pgTable("insurance_companies", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  logo_url: text("logo_url"),
  description: text("description"),
  terms_url: text("terms_url"),
  created_at: timestamp("created_at").notNull().defaultNow(),
});
