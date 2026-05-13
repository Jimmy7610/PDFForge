/* ───────────────────────────────────────────────────────────────
   PDFForge – Export pipelines (pdf-lib)
   Normal export + Secure rasterized export
   ─────────────────────────────────────────────────────────────── */

import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
import type { PDFPageState, PDFFileState } from '../types/pdfForgeTypes';
import { applyFormFields } from './pdfForms';
import { scrubMetadata } from './pdfMetadata';
import { renderPageWithEdits } from './pdfRenderer';

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.substring(0, 2), 16) / 255,
    g: parseInt(h.substring(2, 4), 16) / 255,
    b: parseInt(h.substring(4, 6), 16) / 255,
  };
}

export interface ExportOptions {
  pages: PDFPageState[];
  files: PDFFileState[];
  flattenForms: boolean;
  includeOcrLayer: boolean;
  onProgress?: (current: number, total: number, message: string) => void;
}

/* ═══════════════════════════════════════════════════════════════
   NORMAL PDF EXPORT
   ═══════════════════════════════════════════════════════════════ */

export async function exportNormalPdf(options: ExportOptions): Promise<Uint8Array> {
  const { pages, files, flattenForms, includeOcrLayer, onProgress } = options;
  const includedPages = pages.filter((p) => !p.excluded);
  const totalPages = includedPages.length;

  if (totalPages === 0) throw new Error('No pages to export. Include at least one page.');

  const newDoc = await PDFDocument.create();
  const helvetica = await newDoc.embedFont(StandardFonts.Helvetica);

  // Cache loaded source docs
  const sourceDocCache = new Map<string, PDFDocument>();

  for (let i = 0; i < includedPages.length; i++) {
    const pageState = includedPages[i];
    onProgress?.(i + 1, totalPages, `Processing page ${i + 1} of ${totalPages}…`);

    const file = files.find((f) => f.id === pageState.sourceFileId);
    if (!file) continue;

    // Get or load source document
    let sourceDoc = sourceDocCache.get(file.id);
    if (!sourceDoc) {
      sourceDoc = await PDFDocument.load(file.arrayBuffer, { ignoreEncryption: true });
      // Apply form field values before copying pages
      applyFormFields(sourceDoc, file.detectedFormFields, flattenForms);
      sourceDocCache.set(file.id, sourceDoc);
    }

    // Copy the page
    const [copiedPage] = await newDoc.copyPages(sourceDoc, [pageState.sourcePageIndex]);
    const addedPage = newDoc.addPage(copiedPage);

    // Apply rotation
    if (pageState.rotation !== 0) {
      addedPage.setRotation(degrees(pageState.rotation));
    }

    // Apply crop
    const crop = pageState.crop;
    if (crop) {
      addedPage.setCropBox(crop.x, crop.y, crop.width, crop.height);
      addedPage.setMediaBox(crop.x, crop.y, crop.width, crop.height);
    }

    // Apply text stamps
    for (const stamp of pageState.stamps) {
      const { r, g, b } = hexToRgb(stamp.color);
      const textWidth = helvetica.widthOfTextAtSize(stamp.text, stamp.fontSize);
      const visualCenterOffset = stamp.fontSize * 0.35;

      // Adjust coordinates for crop origin (MediaBox shift)
      const x = stamp.x - (crop?.x ?? 0);
      const y = stamp.y - (crop?.y ?? 0);

      addedPage.drawText(stamp.text, {
        x: x - textWidth / 2,
        y: y - visualCenterOffset,
        size: stamp.fontSize,
        font: helvetica,
        color: rgb(r, g, b),
        opacity: stamp.opacity,
        // Counter-rotate text so it stays horizontal on screen
        rotate: degrees(-pageState.rotation),
      });
    }

    // Apply redaction rectangles (visual-only black boxes)
    for (const redaction of pageState.redactions) {
      // Adjust coordinates for crop origin
      const x = redaction.x - (crop?.x ?? 0);
      const y = redaction.y - (crop?.y ?? 0);

      addedPage.drawRectangle({
        x,
        y,
        width: redaction.width,
        height: redaction.height,
        color: rgb(0, 0, 0),
        opacity: 1,
      });
    }

    // Apply OCR invisible text layer
    if (includeOcrLayer && pageState.ocrTextItems.length > 0) {
      for (const item of pageState.ocrTextItems) {
        try {
          const fontSize = Math.max(1, Math.min(item.height * 0.8, 72));
          addedPage.drawText(item.text, {
            x: item.x,
            y: item.y,
            size: fontSize,
            font: helvetica,
            color: rgb(0, 0, 0),
            opacity: 0.01, // Near-invisible for searchability
          });
        } catch {
          // Skip items that fail (unusual characters etc.)
        }
      }
    }
  }

  // Scrub metadata
  scrubMetadata(newDoc);

  return newDoc.save();
}

/* ═══════════════════════════════════════════════════════════════
   SECURE RASTERIZED EXPORT
   ═══════════════════════════════════════════════════════════════ */

export async function exportRasterizedPdf(options: ExportOptions): Promise<Uint8Array> {
  const { pages, files, includeOcrLayer, onProgress } = options;
  const includedPages = pages.filter((p) => !p.excluded);
  const totalPages = includedPages.length;

  if (totalPages === 0) throw new Error('No pages to export. Include at least one page.');

  const newDoc = await PDFDocument.create();
  const helvetica = await newDoc.embedFont(StandardFonts.Helvetica);

  for (let i = 0; i < includedPages.length; i++) {
    const pageState = includedPages[i];
    onProgress?.(i + 1, totalPages, `Rasterizing page ${i + 1} of ${totalPages}…`);

    const file = files.find((f) => f.id === pageState.sourceFileId);
    if (!file) continue;

    // Render the page with all visual edits to a canvas
    const canvas = await renderPageWithEdits(file.arrayBuffer, pageState, 200); // 200 DPI

    // Convert canvas to JPEG
    const blob = await new Promise<Blob>((resolve) =>
      canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.92)
    );
    const imgBytes = new Uint8Array(await blob.arrayBuffer());

    // Embed image in new PDF
    const jpgImage = await newDoc.embedJpg(imgBytes);

    // Create page with image dimensions
    const pageWidth = canvas.width * (72 / 200); // Convert pixels back to PDF points at 200 DPI
    const pageHeight = canvas.height * (72 / 200);
    const newPage = newDoc.addPage([pageWidth, pageHeight]);

    newPage.drawImage(jpgImage, {
      x: 0,
      y: 0,
      width: pageWidth,
      height: pageHeight,
    });

    // Optionally add OCR text layer on top
    if (includeOcrLayer && pageState.ocrTextItems.length > 0) {
      for (const item of pageState.ocrTextItems) {
        try {
          // Adjust OCR coordinates for crop if needed
          const crop = pageState.crop;
          const adjX = crop ? item.x - crop.x : item.x;
          const adjY = crop ? item.y - crop.y : item.y;
          const scaleX = pageWidth / (crop ? crop.width : pageState.originalWidth);
          const scaleY = pageHeight / (crop ? crop.height : pageState.originalHeight);

          const fontSize = Math.max(1, Math.min(item.height * scaleY * 0.8, 72));
          newPage.drawText(item.text, {
            x: adjX * scaleX,
            y: adjY * scaleY,
            size: fontSize,
            font: helvetica,
            color: rgb(0, 0, 0),
            opacity: 0.01,
          });
        } catch {
          // Skip
        }
      }
    }
  }

  // Scrub metadata
  scrubMetadata(newDoc);

  return newDoc.save();
}

/**
 * Trigger browser download of a Uint8Array as a PDF file.
 */
export function downloadPdf(data: Uint8Array, filename: string): void {
  const blob = new Blob([data.slice().buffer], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
