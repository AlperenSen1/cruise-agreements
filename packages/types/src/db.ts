import { z } from "zod";

export const agreementEventTypeSchema = z.enum([
  "created",
  "sent",
  "viewed",
  "signed",
]);

export type AgreementEventType = z.infer<typeof agreementEventTypeSchema>;

export const agreementIdSchema = z.string().uuid();
