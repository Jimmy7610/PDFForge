/* ───────────────────────────────────────────────────────────────
   PDFForge – Coordinate conversion utilities
   All pixel↔PDF point math lives here. Nothing else should
   do coordinate conversion.
   ─────────────────────────────────────────────────────────────── */

import type { CropRect } from '../types/pdfForgeTypes';

/**
 * Convert canvas-pixel position to PDF-point position.
 * PDF origin = bottom-left; canvas origin = top-left.
 */
export function canvasToPdf(
  pixelX: number,
  pixelY: number,
  canvasWidth: number,
  canvasHeight: number,
  pageWidth: number,
  pageHeight: number,
  zoom: number = 1,
  crop: CropRect | null = null,
  rotation: number = 0,
): { pdfX: number; pdfY: number } {
  // Remove zoom
  const x = pixelX / zoom;
  const y = pixelY / zoom;

  // Normalise to 0-1
  const normX = x / canvasWidth;
  const normY = y / canvasHeight;

  // Effective page dimensions (after crop applied visually)
  const effW = crop ? crop.width : pageWidth;
  const effH = crop ? crop.height : pageHeight;
  const offX = crop ? crop.x : 0;
  const offY = crop ? crop.y : 0;

  let pdfX: number;
  let pdfY: number;

  switch (rotation) {
    case 90:
      pdfX = offX + normY * effW;
      pdfY = offY + normX * effH;
      break;
    case 180:
      pdfX = offX + (1 - normX) * effW;
      pdfY = offY + normY * effH;
      break;
    case 270:
      pdfX = offX + (1 - normY) * effW;
      pdfY = offY + (1 - normX) * effH;
      break;
    default: // 0
      pdfX = offX + normX * effW;
      pdfY = offY + (1 - normY) * effH;
      break;
  }

  return { pdfX, pdfY };
}

/**
 * Convert PDF-point position to canvas-pixel position.
 */
export function pdfToCanvas(
  pdfX: number,
  pdfY: number,
  canvasWidth: number,
  canvasHeight: number,
  pageWidth: number,
  pageHeight: number,
  zoom: number = 1,
  crop: CropRect | null = null,
  rotation: number = 0,
): { pixelX: number; pixelY: number } {
  const effW = crop ? crop.width : pageWidth;
  const effH = crop ? crop.height : pageHeight;
  const offX = crop ? crop.x : 0;
  const offY = crop ? crop.y : 0;

  const relX = (pdfX - offX) / effW;
  const relY = (pdfY - offY) / effH;

  let normX: number;
  let normY: number;

  switch (rotation) {
    case 90:
      normX = relY;
      normY = relX;
      break;
    case 180:
      normX = 1 - relX;
      normY = relY;
      break;
    case 270:
      normX = 1 - relY;
      normY = 1 - relX;
      break;
    default:
      normX = relX;
      normY = 1 - relY;
      break;
  }

  return {
    pixelX: normX * canvasWidth * zoom,
    pixelY: normY * canvasHeight * zoom,
  };
}

/**
 * Convert a rectangle drawn on canvas (pixel coords) to PDF-point rect.
 */
export function canvasRectToPdfRect(
  startPixelX: number,
  startPixelY: number,
  endPixelX: number,
  endPixelY: number,
  canvasWidth: number,
  canvasHeight: number,
  pageWidth: number,
  pageHeight: number,
  zoom: number = 1,
  crop: CropRect | null = null,
  rotation: number = 0,
): { x: number; y: number; width: number; height: number } {
  const p1 = canvasToPdf(startPixelX, startPixelY, canvasWidth, canvasHeight, pageWidth, pageHeight, zoom, crop, rotation);
  const p2 = canvasToPdf(endPixelX, endPixelY, canvasWidth, canvasHeight, pageWidth, pageHeight, zoom, crop, rotation);

  const x = Math.min(p1.pdfX, p2.pdfX);
  const y = Math.min(p1.pdfY, p2.pdfY);
  const width = Math.abs(p2.pdfX - p1.pdfX);
  const height = Math.abs(p2.pdfY - p1.pdfY);

  return { x, y, width, height };
}

/**
 * Convert a PDF-point rect to canvas-pixel rect for rendering overlays.
 */
export function pdfRectToCanvasRect(
  rect: { x: number; y: number; width: number; height: number },
  canvasWidth: number,
  canvasHeight: number,
  pageWidth: number,
  pageHeight: number,
  zoom: number = 1,
  crop: CropRect | null = null,
  rotation: number = 0,
): { left: number; top: number; width: number; height: number } {
  const topLeft = pdfToCanvas(rect.x, rect.y + rect.height, canvasWidth, canvasHeight, pageWidth, pageHeight, zoom, crop, rotation);
  const bottomRight = pdfToCanvas(rect.x + rect.width, rect.y, canvasWidth, canvasHeight, pageWidth, pageHeight, zoom, crop, rotation);

  const left = Math.min(topLeft.pixelX, bottomRight.pixelX);
  const top = Math.min(topLeft.pixelY, bottomRight.pixelY);
  const width = Math.abs(bottomRight.pixelX - topLeft.pixelX);
  const height = Math.abs(bottomRight.pixelY - topLeft.pixelY);

  return { left, top, width, height };
}

/**
 * Get effective displayed dimensions considering rotation.
 */
export function getDisplayDimensions(
  pageWidth: number,
  pageHeight: number,
  rotation: number,
): { displayWidth: number; displayHeight: number } {
  if (rotation === 90 || rotation === 270) {
    return { displayWidth: pageHeight, displayHeight: pageWidth };
  }
  return { displayWidth: pageWidth, displayHeight: pageHeight };
}
