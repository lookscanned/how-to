import { type Browser } from "puppeteer";

/**
 * Renders a PDF from a URL using Puppeteer
 * @returns PDF buffer
 */
export async function renderPdfFromUrl(
  browser: Browser,
  url: string,
): Promise<Buffer> {
  const page = await browser.newPage();
  try {
    console.log(`📄 Rendering PDF from ${url}...`);
    await page.goto(url, { waitUntil: "networkidle0", timeout: 30000 });

    // Generate PDF bytes in-memory
    const pdfBuffer = await page.pdf({
      format: "a4",
      printBackground: true,
    });

    return Buffer.from(
      pdfBuffer.buffer.slice(
        pdfBuffer.byteOffset,
        pdfBuffer.byteOffset + pdfBuffer.byteLength,
      ),
    );
  } finally {
    await page.close();
  }
}
