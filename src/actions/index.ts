import { defineAction } from "astro:actions";
import { z } from "astro/zod";
import { createAgreementEvent, createAgreementWithEvent, deleteAgreement, getAgreementById } from "db";
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

      return createAgreementWithEvent({ templateId, ...props });
    },
  }),

  sendUnsignedAgreement: defineAction({
    input: z.object({ id: agreementIdSchema }),
    handler: async ({ id }) => {
      const agreementRecord = await getAgreementById(id);
      const agreementInstance = factory(agreementRecord.templateId as TemplateId, agreementRecord);
      const unsignedContractMarkdown = agreementInstance.get();
      const unsignedContractPdf = await generatePdf(unsignedContractMarkdown);
      await uploadPdf(`agreements/${id}/contract-unsigned.pdf`, unsignedContractPdf, "application/pdf");
      await createAgreementEvent(id, "sent");

      // TODO: imzalama linkini agreementRecord.email'e gönder (servis henüz seçilmedi)
    },
  }),

  removeAgreement: defineAction({
    input: z.object({ id: agreementIdSchema }),
    handler: async ({ id }) => {
      // TODO: Garage'daki agreements/{id}/contract-*.pdf objeleri temizlenmiyor,
      // sadece DB satırı (ve cascade ile event'leri) siliniyor. Sahipsiz dosya kalıyor.
      await deleteAgreement(id);
    },
  }),
};
