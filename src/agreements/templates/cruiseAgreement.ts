import Handlebars from "handlebars";
import templateSource from "./cruiseAgreement.hbs?raw";
import type { AgreementTemplate } from "../types";

type CruiseAgreementProps = {
  firstName: string;
  lastName: string;
  phoneNumber: string;
};

type CruiseAgreementTemplateData = CruiseAgreementProps & {
  signatureImage?: string;
};

const template = Handlebars.compile<CruiseAgreementTemplateData>(templateSource);

export class CruiseAgreement implements AgreementTemplate {
  templateId = "cruise-agreement";
  firstName: string;
  lastName: string;
  phoneNumber: string;

  constructor(props: CruiseAgreementProps) {
    this.firstName = props.firstName;
    this.lastName = props.lastName;
    this.phoneNumber = props.phoneNumber;
  }

  get = (signatureImage?: string) => {
    return template({
      firstName: this.firstName,
      lastName: this.lastName,
      phoneNumber: this.phoneNumber,
      signatureImage,
    });
  };
}
