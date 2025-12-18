import * as mupdf from "mupdf";

// -----------------------------
// MuPDF compression helper
// -----------------------------
const MUPDF_SAVE_OPTS = [
  "garbage=deduplicate",
  "compress",
  "compress-images",
  "compress-fonts",
  "compress-effort=100",
  "objstms",
].join(",");

/**
 * Compresses a PDF and stamps it with creation/modification dates
 * @returns Compressed PDF as Uint8Array
 */
export function compressPdf(
  input: ArrayBuffer,
  creationModPdfDate: string,
): Uint8Array {
  const doc = mupdf.PDFDocument.openDocument(input, "application/pdf");
  try {
    // Stamp PDF Info dictionary dates (roughly what you were doing via exiftool)
    doc.setMetaData("info:CreationDate", creationModPdfDate);
    doc.setMetaData("info:ModDate", creationModPdfDate);

    // Rewrite + compress
    const outBuf = doc.saveToBuffer(MUPDF_SAVE_OPTS);
    try {
      return outBuf.asUint8Array();
    } finally {
      outBuf.destroy?.();
    }
  } finally {
    doc.destroy?.();
  }
}
