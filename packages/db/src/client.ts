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

export async function createAgreementWithEvent(data: {
  templateId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
}) {
  return db.transaction(async (tx) => {
    const [agreement] = await tx.insert(agreements).values(data).returning();
    await tx.insert(agreementsEvents).values({ agreementId: agreement.id, eventType: "created" });
    return agreement;
  });
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
