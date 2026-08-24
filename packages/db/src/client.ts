import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { config } from "config";
import { agreementEventTypeSchema, agreementIdSchema, type AgreementsListQuery } from "types";
import * as relations from "./relations";
import { agreements, agreementsEvents } from "./schema";
import * as schema from "./schema";

export const db = drizzle(postgres(config.DATABASE_URL), {
  schema: { ...schema, ...relations },
});

export async function createAgreement(data: {
  templateId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
}) {
  const [agreement] = await db.insert(agreements).values(data).returning();
  return agreement;
}

export async function createAgreementEvent(agreementId: string, eventType: string) {
  const validEventType = agreementEventTypeSchema.parse(eventType);
  await db.insert(agreementsEvents).values({
    agreementId,
    eventType: validEventType,
  });
}

export async function getAgreementsWithLatestEvent({ limit, offset }: AgreementsListQuery) {
  return db.query.agreements.findMany({
    orderBy: desc(agreements.createdAt),
    limit,
    offset,
    with: {
      events: {
        orderBy: desc(agreementsEvents.createdAt),
        limit: 1,
      },
    },
  });
}

export async function getAgreementById(id: string) {
  const validId = agreementIdSchema.parse(id);
  const [agreement] = await db.select().from(agreements).where(eq(agreements.id, validId));
  if (!agreement) {
    throw new Error(`Agreement not found: ${id}`);
  }
  return agreement;
}

export async function deleteAgreement(id: string) {
  const validId = agreementIdSchema.parse(id);
  await db.delete(agreements).where(eq(agreements.id, validId));
}
