import { relations } from "drizzle-orm";
import { agreements, agreementsEvents } from "./schema";

export const agreementsRelations = relations(agreements, ({ many }) => ({
  events: many(agreementsEvents),
}));

export const agreementsEventsRelations = relations(agreementsEvents, ({ one }) => ({
  agreement: one(agreements, {
    fields: [agreementsEvents.agreementId],
    references: [agreements.id],
  }),
}));
