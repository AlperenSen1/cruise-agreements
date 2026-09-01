import { ActionError, defineAction } from "astro:actions";
import { z } from "astro/zod";
import {
  createAgreementEvent,
  createAgreementWithEvent,
  deleteAgreement,
  getAgreementWithLatestEventById,
  updateAgreement,
} from "db";
import { agreementIdSchema, createAgreementRequestSchema } from "types";
import { factory as agreementFactory, templateIds, type TemplateId } from "../agreements";
import { sendSigningEmail } from "../agreements/email";
import { generatePdf } from "../agreements/pdf";
import { get as getPdf, upload as uploadPdf } from "storage";

// TODO: Bu erken kontrol ile son event insert'i arasında hâlâ bir yarış durumu var
// (iki eşzamanlı istek ikisi de kontrolü geçebilir). Temiz çözüm: son-durum kontrolünü
// event insert'iyle aynı transaction içine taşımak (ör. createAgreementEventIfNotFinalized).
// Şimdilik kabul edilebilir, gerçekleşmesi eşzamanlı çağrı gerektiriyor.
function assertNotFinalized(agreementRecord: { events: { eventType: string }[] }, id: string) {
  const latestEventType = agreementRecord.events[0]?.eventType;
  if (latestEventType === "signed" || latestEventType === "rejected") {
    throw new ActionError({ code: "CONFLICT", message: `Agreement already finalized: ${id}` });
  }
}

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
      await sendSigningEmail(agreementRecord.email, id);
      await createAgreementEvent(id, "sent");
    },
  }),

  getUnsignedAgreementPdf: defineAction({
    input: z.object({ id: agreementIdSchema }),
    handler: async ({ id }) => {
      return getPdf(`agreements/${id}/contract-unsigned.pdf`);
    },
  }),

  getSignedAgreementPdf: defineAction({
    input: z.object({ id: agreementIdSchema }),
    handler: async ({ id }) => {
      return getPdf(`agreements/${id}/contract-signed.pdf`);
    },
  }),

  markAgreementViewed: defineAction({
    input: z.object({ id: agreementIdSchema }),
    handler: async ({ id }) => {
      const agreementRecord = await getAgreementWithLatestEventById(id);
      assertNotFinalized(agreementRecord, id);

      await createAgreementEvent(id, "viewed");
    },
  }),

  submitSignedAgreement: defineAction({
    input: z.object({ id: agreementIdSchema, signatureImage: z.string() }),
    handler: async ({ id, signatureImage }) => {
      const agreementRecord = await getAgreementWithLatestEventById(id);
      assertNotFinalized(agreementRecord, id);

      const agreementInstance = agreementFactory(agreementRecord);
      const signedContractMarkdown = agreementInstance.get(signatureImage);
      const signedContractPdf = await generatePdf(signedContractMarkdown);
      await uploadPdf(`agreements/${id}/contract-signed.pdf`, signedContractPdf, "application/pdf");
      await createAgreementEvent(id, "signed");
    },
  }),

  editAgreementDetails: defineAction({
    input: createAgreementRequestSchema.shape.props.extend({ id: agreementIdSchema }),
    handler: async ({ id, firstName, lastName, email, phoneNumber }) => {
      const agreementRecord = await getAgreementWithLatestEventById(id);
      if (agreementRecord.events[0].eventType !== "created") {
        throw new ActionError({ code: "CONFLICT", message: `Agreement can no longer be edited: ${id}` });
      }

      await updateAgreement(id, { firstName, lastName, email, phoneNumber });
    },
  }),

  removeAgreement: defineAction({
    input: z.object({ id: agreementIdSchema }),
    handler: async ({ id }) => {
      const agreementRecord = await getAgreementWithLatestEventById(id);
      if (agreementRecord.events[0].eventType !== "created") {
        throw new ActionError({ code: "CONFLICT", message: `Agreement can no longer be deleted: ${id}` });
      }

      await deleteAgreement(id);
    },
  }),

  rejectAgreement: defineAction({
    input: z.object({ id: agreementIdSchema }),
    handler: async ({ id }) => {
      const agreementRecord = await getAgreementWithLatestEventById(id);
      assertNotFinalized(agreementRecord, id);

      await createAgreementEvent(id, "rejected");
    },
  }),
};
