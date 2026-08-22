import { CruiseAgreement } from "./templates/cruiseAgreement";

const registry = [
  { templateId: "cruise-agreement", TemplateClass: CruiseAgreement },
] as const;

export type TemplateId = (typeof registry)[number]["templateId"];

export const templateIds: TemplateId[] = registry.map((entry) => entry.templateId);

export const factory = (templateId: TemplateId, props: any) => {
  const entry = registry.find((item) => item.templateId === templateId);
  if (!entry) {
    throw new Error(`Unknown templateId: ${templateId}`);
  }
  return new entry.TemplateClass(props);
};
