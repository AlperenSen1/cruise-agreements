import { markdownToPdf } from "@mdpdf/mdpdf";

export async function generatePdf(markdown: string): Promise<Buffer> {
  return markdownToPdf(markdown);
}
