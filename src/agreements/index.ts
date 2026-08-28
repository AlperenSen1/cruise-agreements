import { CruiseAgreement } from "./templates/cruiseAgreement";

const registry = [
  { templateId: "cruise-agreement", TemplateClass: CruiseAgreement },
] as const;

export type TemplateId = (typeof registry)[number]["templateId"];

export const templateIds: TemplateId[] = registry.map((entry) => entry.templateId);

export const factory = (agreement: { templateId: string }) => {
  const entry = registry.find((item) => item.templateId === agreement.templateId);
  if (!entry) {
    throw new Error(`Unknown templateId: ${agreement.templateId}`);
  }
  return new entry.TemplateClass(agreement);
};
