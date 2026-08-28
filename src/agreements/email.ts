import { Resend } from "resend";
import { config } from "config";

export async function sendSigningEmail(to: string, agreementId: string) {
  const resend = new Resend(config.RESEND_API_KEY);
  const signingUrl = `${config.APP_BASE_URL}/sign/${agreementId}`;

  const { error } = await resend.emails.send({
    from: "onboarding@resend.dev", // TODO: doğrulanmış domain belirlenince güncellenecek
    to,
    subject: "Sözleşmenizi imzalayın",
    html: `<p>Sözleşmenizi görüntülemek ve imzalamak için <a href="${signingUrl}">buraya tıklayın</a>.</p>`,
  });

  if (error) {
    throw new Error(error.message);
  }
}
