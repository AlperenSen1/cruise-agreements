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

export async function getAgreementsWithLatestEvent({
  limit,
  offset,
  status,
  firstName,
  lastName,
  email,
  phoneNumber,
  sort,
}: AgreementsListQuery) {
  const allAgreements = await db.query.agreements.findMany({
    orderBy: desc(agreements.createdAt),
    with: {
      events: {
        orderBy: desc(agreementsEvents.createdAt),
        limit: 1,
      },
    },
  });

  let filtered = allAgreements;

  if (status) {
    filtered = filtered.filter((agreement) => agreement.events[0].eventType === status);
  }
  if (firstName) {
    filtered = filtered.filter((agreement) =>
      agreement.firstName.toLowerCase().includes(firstName.toLowerCase()),
    );
  }
  if (lastName) {
    filtered = filtered.filter((agreement) =>
      agreement.lastName.toLowerCase().includes(lastName.toLowerCase()),
    );
  }
  if (email) {
    filtered = filtered.filter((agreement) => agreement.email.toLowerCase().includes(email.toLowerCase()));
  }
  if (phoneNumber) {
    filtered = filtered.filter((agreement) => agreement.phoneNumber.includes(phoneNumber));
  }
  if (sort === "oldest") {
    filtered = [...filtered].reverse();
  }

  return { items: filtered.slice(offset, offset + limit), total: filtered.length };
}

export async function getAgreementWithLatestEventById(id: string) {
  const validId = agreementIdSchema.parse(id);
  const agreement = await db.query.agreements.findFirst({
    where: eq(agreements.id, validId),
    with: {
      events: {
        orderBy: desc(agreementsEvents.createdAt),
        limit: 1,
      },
    },
  });
  if (!agreement) {
    throw new Error(`Agreement not found: ${id}`);
  }
  return agreement;
}

export async function getAgreementStatusCounts() {
  const allAgreements = await db.query.agreements.findMany({
    with: {
      events: {
        orderBy: desc(agreementsEvents.createdAt),
        limit: 1,
      },
    },
  });

  const counts: Record<string, number> = {};
  for (const agreement of allAgreements) {
    const eventType = agreement.events[0].eventType;
    counts[eventType] = (counts[eventType] ?? 0) + 1;
  }
  return counts;
}

export async function getAgreementWithEventsById(id: string) {
  const validId = agreementIdSchema.parse(id);
  const agreement = await db.query.agreements.findFirst({
    where: eq(agreements.id, validId),
    with: {
      events: {
        orderBy: agreementsEvents.createdAt,
      },
    },
  });
  if (!agreement) {
    throw new Error(`Agreement not found: ${id}`);
  }
  return agreement;
}

export async function updateAgreement(id: string, data: {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}) {
  const validId = agreementIdSchema.parse(id);
  await db.update(agreements).set(data).where(eq(agreements.id, validId));
}

export async function deleteAgreement(id: string) {
  const validId = agreementIdSchema.parse(id);
  await db.delete(agreements).where(eq(agreements.id, validId));
}
