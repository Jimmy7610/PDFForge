/* ───────────────────────────────────────────────────────────────
   PDFForge – Metadata scrubbing (pdf-lib)
   ─────────────────────────────────────────────────────────────── */

import type { PDFDocument } from 'pdf-lib';

/**
 * Scrub common metadata fields from a PDFDocument.
 * Overwrites Title, Author, Subject, Keywords, Creator, Producer,
 * CreationDate, and ModificationDate with safe defaults.
 */
export function scrubMetadata(pdfDoc: PDFDocument): void {
  pdfDoc.setTitle('');
  pdfDoc.setAuthor('');
  pdfDoc.setSubject('');
  pdfDoc.setKeywords([]);
  pdfDoc.setCreator('PDFForge');
  pdfDoc.setProducer('PDFForge');
  pdfDoc.setCreationDate(new Date(0));
  pdfDoc.setModificationDate(new Date(0));
}
