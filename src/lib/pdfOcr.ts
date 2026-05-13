/* ───────────────────────────────────────────────────────────────
   PDFForge – OCR via tesseract.js
   ─────────────────────────────────────────────────────────────── */

import { createWorker, OEM } from 'tesseract.js';
import type { OcrTextItem } from '../types/pdfForgeTypes';
import { renderPageToCanvas } from './pdfRenderer';

/**
 * Run OCR on a single page. Returns OcrTextItem[] with PDF-point coords.
 */
export async function ocrPage(
  arrayBuffer: ArrayBuffer,
  pageIndex: number,
  pageWidth: number,
  pageHeight: number,
  language: string = 'eng',
  onProgress?: (p: number) => void,
): Promise<OcrTextItem[]> {
  // Render page to canvas at 2x scale for better OCR accuracy
  const scale = 2;
  const canvas = await renderPageToCanvas(arrayBuffer, pageIndex, scale, 0);

  const worker = await createWorker(language, OEM.DEFAULT, {
    logger: (m: { status: string; progress: number }) => {
      if (m.status === 'recognizing text' && onProgress) {
        onProgress(m.progress);
      }
    },
  });

  const { data } = await worker.recognize(canvas);

  const canvasW = canvas.width;
  const canvasH = canvas.height;

  interface TessWord {
    text: string;
    bbox: { x0: number; y0: number; x1: number; y1: number };
    confidence: number;
  }

  let words: TessWord[] = [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const d = data as any;

  try {
    // tesseract.js v7 hierarchical: blocks > paragraphs > lines > words
    if (d && d.blocks && Array.isArray(d.blocks)) {
      for (const block of d.blocks) {
        for (const para of block.paragraphs ?? []) {
          for (const line of para.lines ?? []) {
            for (const word of line.words ?? []) {
              if (word.text && word.text.trim().length > 0) {
                words.push(word as TessWord);
              }
            }
          }
        }
      }
    }
    // Fallback: data.words (older structure)
    if (words.length === 0 && d.words && Array.isArray(d.words)) {
      words = (d.words as TessWord[]).filter(
        (w) => w.text && w.text.trim().length > 0
      );
    }
  } catch {
    words = [];
  }

  const items: OcrTextItem[] = words.map((w) => {
    const x = (w.bbox.x0 / canvasW) * pageWidth;
    const yTop = (w.bbox.y0 / canvasH) * pageHeight;
    const width = ((w.bbox.x1 - w.bbox.x0) / canvasW) * pageWidth;
    const height = ((w.bbox.y1 - w.bbox.y0) / canvasH) * pageHeight;
    const y = pageHeight - yTop - height;

    return {
      text: w.text,
      x,
      y,
      width,
      height,
      confidence: w.confidence,
    };
  });

  await worker.terminate();
  return items;
}
