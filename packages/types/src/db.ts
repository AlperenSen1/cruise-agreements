import { z } from "zod";

export const agreementEventTypeSchema = z.enum([
  "created",
  "sent",
  "viewed",
  "signed",
  "rejected",
]);

export type AgreementEventType = z.infer<typeof agreementEventTypeSchema>;

export const agreementIdSchema = z.uuid();
