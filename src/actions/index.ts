import { ActionError, defineAction } from "astro:actions";
import { z } from "astro/zod";
import { createAgreementEvent, createAgreementWithEvent, getAgreementWithLatestEventById } from "db";
import { agreementIdSchema, createAgreementRequestSchema } from "types";
import { factory as agreementFactory, templateIds, type TemplateId } from "../agreements";
import { sendSigningEmail } from "../agreements/email";
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
      const agreementRecord = await getAgreementWithLatestEventById(id);
      const agreementInstance = agreementFactory(agreementRecord);
      const unsignedContractMarkdown = agreementInstance.get();
      const unsignedContractPdf = await generatePdf(unsignedContractMarkdown);
      await uploadPdf(`agreements/${id}/contract-unsigned.pdf`, unsignedContractPdf, "application/pdf");
      await createAgreementEvent(id, "sent");
      await sendSigningEmail(agreementRecord.email, id);
    },
  }),

  getUnsignedAgreementPdf: defineAction({
    input: z.object({ id: agreementIdSchema }),
    handler: async ({ id }) => {
      return getPdf(`agreements/${id}/contract-unsigned.pdf`);
    },
  }),

  markAgreementViewed: defineAction({
    input: z.object({ id: agreementIdSchema }),
    handler: async ({ id }) => {
      await createAgreementEvent(id, "viewed");
    },
  }),

  submitSignedAgreement: defineAction({
    input: z.object({ id: agreementIdSchema, signatureImage: z.string() }),
    handler: async ({ id, signatureImage }) => {
      const agreementRecord = await getAgreementWithLatestEventById(id);
      const latestEventType = agreementRecord.events[0]?.eventType;
      if (latestEventType === "signed" || latestEventType === "rejected") {
        throw new ActionError({ code: "CONFLICT", message: `Agreement already finalized: ${id}` });
      }

      const agreementInstance = agreementFactory(agreementRecord);
      const signedContractMarkdown = agreementInstance.get(signatureImage);
      const signedContractPdf = await generatePdf(signedContractMarkdown);
      await uploadPdf(`agreements/${id}/contract-signed.pdf`, signedContractPdf, "application/pdf");
      await createAgreementEvent(id, "signed");
    },
  }),

  rejectAgreement: defineAction({
    input: z.object({ id: agreementIdSchema }),
    handler: async ({ id }) => {
      const agreementRecord = await getAgreementWithLatestEventById(id);
      const latestEventType = agreementRecord.events[0]?.eventType;
      if (latestEventType === "signed" || latestEventType === "rejected") {
        throw new ActionError({ code: "CONFLICT", message: `Agreement already finalized: ${id}` });
      }

      await createAgreementEvent(id, "rejected");
    },
  }),
};
