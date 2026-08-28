import { markdownToPdf } from "@mdpdf/mdpdf";

export async function generatePdf(markdown: string): Promise<Buffer> {
  const pdf = await markdownToPdf(markdown);
  if (pdf.length === 0) {
    throw new Error("generatePdf: markdownToPdf returned an empty PDF");
  }
  return pdf;
}
