/* ───────────────────────────────────────────────────────────────
   PDFForge – PDF rendering (pdfjs-dist)
   ─────────────────────────────────────────────────────────────── */

import * as pdfjsLib from 'pdfjs-dist';
import type { PDFPageState } from '../types/pdfForgeTypes';
import { pdfToCanvas } from './pdfCoordinates';

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

    // Map crop rect to rotated canvas coordinates using pdfToCanvas
    const { pixelX: sx, pixelY: sy } = pdfToCanvas(
      crop.x, crop.y + crop.height,
      viewport.width / scale, viewport.height / scale,
      pageState.originalWidth, pageState.originalHeight,
      scale,
      null, // Get coords on full uncropped canvas
      pageState.rotation
    );

    const ctx = canvas.getContext('2d')!;
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
    // Get top-left of redaction in canvas pixels
    const { pixelX: rx, pixelY: ry } = pdfToCanvas(
      r.x, r.y + r.height,
      canvas.width, canvas.height,
      pageState.originalWidth, pageState.originalHeight,
      1, // zoom=1 since canvas is already scaled
      pageState.crop,
      pageState.rotation
    );

    const rw = r.width * scale;
    const rh = r.height * scale;

    ctx.fillStyle = '#000000';
    ctx.fillRect(rx, ry, rw, rh);
  }

  // Draw stamps
  for (const s of pageState.stamps) {
    // Stamps are centered, so get the click point
    const { pixelX: sx, pixelY: sy } = pdfToCanvas(
      s.x, s.y,
      canvas.width, canvas.height,
      pageState.originalWidth, pageState.originalHeight,
      1,
      pageState.crop,
      pageState.rotation
    );

    ctx.save();
    ctx.globalAlpha = s.opacity;
    ctx.fillStyle = s.color;
    ctx.font = `bold ${s.fontSize * scale}px Helvetica, Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(s.text, sx, sy);
    ctx.restore();
  }

  page.cleanup();
  pdfJsDoc.destroy();
  return canvas;
}
