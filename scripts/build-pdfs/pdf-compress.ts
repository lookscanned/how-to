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
  const doc = mupdf.PDFDocument.openDocument(input, "application/pdf").asPDF();

  if (!doc) {
    throw new Error("Failed to open PDF document");
  }

  // Stamp PDF Info dictionary dates (roughly what you were doing via exiftool)
  doc.setMetaData(mupdf.Document.META_INFO_CREATIONDATE, creationModPdfDate);
  doc.setMetaData(
    mupdf.Document.META_INFO_MODIFICATIONDATE,
    creationModPdfDate,
  );

  // Rewrite + compress
  const array = doc.saveToBuffer(MUPDF_SAVE_OPTS).asUint8Array();
  doc.destroy();
  return array;
}
