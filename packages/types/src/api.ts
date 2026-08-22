import { z } from "zod";

export const agreementsListQuerySchema = z.object({
  limit: z.coerce.number().int().positive().default(20),
  offset: z.coerce.number().int().nonnegative().default(0),
});

export type AgreementsListQuery = z.infer<typeof agreementsListQuerySchema>;

export const createAgreementRequestSchema = z.object({
  // Alternatif: templateId'yi burada z.enum([...]) ile kayıtlı template id'lerin
  // listesine karşı doğrulamak da mümkün, ama bu packages/types'ın
  // src/agreements/index.ts'teki registry'yi bilmesini gerektirir (katmanlar arası bağımlılık).
  // Şu an bu kontrol factory() içinde (iş mantığı katmanında) yapılıyor.
  templateId: z.string().min(1),
  props: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    phoneNumber: z
      .string()
      .regex(/^\+?[0-9]{7,15}$/, "Phone number must contain digits only"),
  }),
});

export type CreateAgreementRequest = z.infer<typeof createAgreementRequestSchema>;
