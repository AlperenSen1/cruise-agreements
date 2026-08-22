import type { AgreementTemplate } from "../types";

export class CruiseAgreement implements AgreementTemplate {
  templateId = "cruise-agreement";
  firstName: string;
  lastName: string;
  phoneNumber: string;

  constructor(props: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
  }) {
    this.firstName = props.firstName;
    this.lastName = props.lastName;
    this.phoneNumber = props.phoneNumber;
  }

  get = () => {
    return "";
  };
}
