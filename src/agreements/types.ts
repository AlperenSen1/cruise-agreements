export interface AgreementTemplate {
  templateId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  get: (signatureImage?: string) => string;
}
