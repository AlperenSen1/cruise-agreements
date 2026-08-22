import { defineAction } from "astro:actions";
import { z } from "astro/zod";
import { createAgreement, createAgreementEvent, deleteAgreement } from "db";
import { agreementIdSchema, createAgreementRequestSchema } from "types";
import { factory, type TemplateId } from "../agreements";

export const server = {
  submitAgreement: defineAction({
    input: createAgreementRequestSchema,
    handler: async ({ templateId, props }) => {
      const agreementInstance = factory(templateId as TemplateId, props);
      // TODO: get()'in sonucu (üretilen HTML) şu an hiçbir yerde kullanılmıyor.
      // İleride S3'e depolanacak, o zaman bir değişkende tutulup yüklenecek.
      agreementInstance.get();

      // TODO: bu iki insert atomik değil, createAgreement başarılı olup createAgreementEvent
      // başarısız olursa DB'de karşılığı olmayan bir agreements satırı kalır. Transaction'a al.
      const savedAgreement = await createAgreement({ templateId, ...props });
      await createAgreementEvent(savedAgreement.id, "created");

      return savedAgreement;
    },
  }),

  removeAgreement: defineAction({
    input: z.object({ id: agreementIdSchema }),
    handler: async ({ id }) => {
      await deleteAgreement(id);
    },
  }),
};
