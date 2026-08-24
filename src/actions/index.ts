import { defineAction } from "astro:actions";
import { z } from "astro/zod";
import { createAgreement, createAgreementEvent, deleteAgreement, getAgreementById } from "db";
import { agreementIdSchema, createAgreementRequestSchema } from "types";
import { factory, templateIds, type TemplateId } from "../agreements";
import { generatePdf } from "../agreements/pdf";
import { get as getPdf, upload as uploadPdf } from "storage";

export const server = {
  initiateAgreement: defineAction({
    input: createAgreementRequestSchema,
    handler: async ({ templateId, props }) => {
      if (!templateIds.includes(templateId as TemplateId)) {
        throw new Error(`Unknown templateId: ${templateId}`);
      }

      // TODO: bu iki adım (createAgreement, createAgreementEvent) atomik değil,
      // biri başarısız olursa öbürü geri alınmıyor. Transaction/rollback'e al.
      const savedAgreement = await createAgreement({ templateId, ...props });
      await createAgreementEvent(savedAgreement.id, "created");

      return savedAgreement;
    },
  }),

  sendUnsignedAgreement: defineAction({
    input: z.object({ id: agreementIdSchema }),
    handler: async ({ id }) => {
      const agreement = await getAgreementById(id);
      const agreementInstance = factory(agreement.templateId as TemplateId, agreement);
      const markdown = agreementInstance.get();
      const pdf = await generatePdf(markdown);
      await uploadPdf(`agreements/${id}/contract-unsigned.pdf`, pdf, "application/pdf");
      await createAgreementEvent(id, "sent");

      // TODO: imzalama linkini agreement.email'e gönder (servis henüz seçilmedi)
    },
  }),

  removeAgreement: defineAction({
    input: z.object({ id: agreementIdSchema }),
    handler: async ({ id }) => {
      await deleteAgreement(id);
    },
  }),
};
