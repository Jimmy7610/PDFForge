/* ───────────────────────────────────────────────────────────────
   PDFForge – PDF rendering (pdfjs-dist)
   ─────────────────────────────────────────────────────────────── */

import * as pdfjsLib from 'pdfjs-dist';
import type { PDFPageState } from '../types/pdfForgeTypes';

/**
 * Render a single page of a pdfjs document to a canvas data URL.
 * Used for thumbnail generation.
 */
export async function renderPageThumbnail(
  pdfJsDoc: pdfjsLib.PDFDocumentProxy,
  pageIndex: number,
  maxDimension: number = 200,
): Promise<string> {
  const page = await pdfJsDoc.getPage(pageIndex + 1); // pdfjs is 1-based
  const vp = page.getViewport({ scale: 1 });

  const scale = maxDimension / Math.max(vp.width, vp.height);
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;

  const ctx = canvas.getContext('2d')!;
  // pdfjs-dist v5 render parameters
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await page.render({ canvasContext: ctx, viewport, canvas } as any).promise;

  const dataUrl = canvas.toDataURL('image/png');
  page.cleanup();
  return dataUrl;
}

/**
 * Render a page to a canvas element (for preview or export).
 * Returns the canvas. Caller is responsible for cleanup.
 */
export async function renderPageToCanvas(
  arrayBuffer: ArrayBuffer,
  pageIndex: number,
  scale: number = 2,
  rotation: number = 0,
): Promise<HTMLCanvasElement> {
  const pdfJsDoc = await pdfjsLib.getDocument({ data: arrayBuffer.slice(0) }).promise;
  const page = await pdfJsDoc.getPage(pageIndex + 1);

  const viewport = page.getViewport({ scale, rotation });

  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;

  const ctx = canvas.getContext('2d')!;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await page.render({ canvasContext: ctx, viewport, canvas } as any).promise;

  page.cleanup();
  pdfJsDoc.destroy();
  return canvas;
}

/**
 * Render a page with all visual edits applied (for rasterized export).
 * Draws stamps, redactions on the canvas.
 */
export async function renderPageWithEdits(
  arrayBuffer: ArrayBuffer,
  pageState: PDFPageState,
  dpi: number = 150,
): Promise<HTMLCanvasElement> {
  const pdfJsDoc = await pdfjsLib.getDocument({ data: arrayBuffer.slice(0) }).promise;
  const page = await pdfJsDoc.getPage(pageState.sourcePageIndex + 1);

  const baseViewport = page.getViewport({ scale: 1 });
  const scale = dpi / 72; // 72 PDF points per inch
  const viewport = page.getViewport({ scale, rotation: pageState.rotation });

  const canvas = document.createElement('canvas');

  // If cropped, only render the crop area
  const crop = pageState.crop;
  if (crop) {
    const cropW = crop.width * scale;
    const cropH = crop.height * scale;
    canvas.width = cropW;
    canvas.height = cropH;

    const fullCanvas = document.createElement('canvas');
    fullCanvas.width = viewport.width;
    fullCanvas.height = viewport.height;

    const fullCtx = fullCanvas.getContext('2d')!;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await page.render({ canvasContext: fullCtx, viewport, canvas: fullCanvas } as any).promise;

    // Map crop rect to rotated canvas coordinates
    const ctx = canvas.getContext('2d')!;
    const sx = crop.x * scale;
    const sy = (baseViewport.height - crop.y - crop.height) * scale;
    ctx.drawImage(fullCanvas, sx, sy, cropW, cropH, 0, 0, cropW, cropH);
  } else {
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d')!;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await page.render({ canvasContext: ctx, viewport, canvas } as any).promise;
  }

  const ctx = canvas.getContext('2d')!;

  // Draw redactions
  for (const r of pageState.redactions) {
    const rx = (r.x - (crop?.x ?? 0)) * scale;
    const ry = canvas.height - (r.y + r.height - (crop?.y ?? 0)) * scale;
    ctx.fillStyle = '#000000';
    ctx.fillRect(rx, ry, r.width * scale, r.height * scale);
  }

  // Draw stamps
  for (const s of pageState.stamps) {
    const sx = (s.x - (crop?.x ?? 0)) * scale;
    const sy = canvas.height - (s.y - (crop?.y ?? 0)) * scale;
    ctx.save();
    ctx.globalAlpha = s.opacity;
    ctx.fillStyle = s.color;
    ctx.font = `${s.fontSize * scale}px Helvetica, Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(s.text, sx, sy);
    ctx.restore();
  }

  page.cleanup();
  pdfJsDoc.destroy();
  return canvas;
}
