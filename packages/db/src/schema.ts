import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const agreements = pgTable("agreements", {
  id: uuid("id").primaryKey().defaultRandom(),
  templateId: text("template_id").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phoneNumber: text("phone_number").notNull(),
  email: text("email").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const agreementsEvents = pgTable("agreements_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  agreementId: uuid("agreement_id")
    .notNull()
    .references(() => agreements.id, { onDelete: "cascade" }),
  eventType: text("event_type").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
