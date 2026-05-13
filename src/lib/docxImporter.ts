/* ───────────────────────────────────────────────────────────────
   PDFForge – DOCX Importer
   Converts .docx files to PDF locally in the browser using
   mammoth (DOCX → HTML) + html2canvas (HTML → image) + pdf-lib (image → PDF)
   ─────────────────────────────────────────────────────────────── */

import mammoth from 'mammoth';
import html2canvas from 'html2canvas';
import { PDFDocument } from 'pdf-lib';

/** A4 dimensions in CSS pixels at 96 DPI */
const A4_WIDTH_PX = 794;   // ~210mm
const A4_HEIGHT_PX = 1123;  // ~297mm
const PAGE_PADDING_PX = 60;

/** A4 in PDF points (72 DPI) */
const A4_WIDTH_PT = 595.28;

export interface DocxConversionResult {
  pdfArrayBuffer: ArrayBuffer;
  convertedName: string;
  pageCount: number;
  warnings: string[];
}

/**
 * Convert a .docx File to a PDF ArrayBuffer entirely in the browser.
 *
 * Pipeline:
 * 1. mammoth: DOCX → HTML string
 * 2. Render HTML in a hidden container with A4-like dimensions
 * 3. html2canvas: capture rendered content
 * 4. Split captured content into A4 pages
 * 5. pdf-lib: create a PDF from the page images
 */
export async function convertDocxToPdf(
  file: File,
  onProgress?: (message: string) => void,
): Promise<DocxConversionResult> {
  const warnings: string[] = [];

  // ── Step 1: DOCX → HTML via mammoth ──
  onProgress?.('Reading DOCX file…');
  const arrayBuffer = await file.arrayBuffer();

  let html: string;
  try {
    const result = await mammoth.convertToHtml(
      { arrayBuffer },
      {
        styleMap: [
          "p[style-name='Heading 1'] => h1:fresh",
          "p[style-name='Heading 2'] => h2:fresh",
          "p[style-name='Heading 3'] => h3:fresh",
        ],
      },
    );
    html = result.value;
    if (result.messages.length > 0) {
      for (const msg of result.messages) {
        warnings.push(msg.message);
      }
    }
  } catch (e) {
    throw new Error(`Failed to read DOCX file: ${e instanceof Error ? e.message : String(e)}`);
  }

  if (!html || html.trim().length === 0) {
    throw new Error('The DOCX file appears to be empty or could not be converted.');
  }

  // ── Step 2: Render HTML in hidden isolated iframe ──
  onProgress?.('Rendering document…');
  
  const iframe = document.createElement('iframe');
  iframe.style.cssText = `
    position: fixed;
    left: -9999px;
    top: 0;
    width: ${A4_WIDTH_PX}px;
    height: 100vh;
    border: none;
    z-index: -1;
  `;
  document.body.appendChild(iframe);

  const iframeWindow = iframe.contentWindow;
  const iframeDoc = iframe.contentDocument || iframeWindow?.document;
  
  if (!iframeDoc || !iframeWindow) {
    document.body.removeChild(iframe);
    throw new Error('Failed to create isolated rendering context.');
  }

  const container = iframeDoc.createElement('div');
  container.style.cssText = `
    width: ${A4_WIDTH_PX - PAGE_PADDING_PX * 2}px;
    padding: ${PAGE_PADDING_PX}px;
    background: white;
    color: black;
    font-family: 'Times New Roman', Georgia, serif;
    font-size: 12pt;
    line-height: 1.5;
  `;

  // Add some basic styling for the converted HTML
  container.innerHTML = `
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      h1 { font-size: 20pt; font-weight: bold; margin: 12pt 0 6pt 0; }
      h2 { font-size: 16pt; font-weight: bold; margin: 10pt 0 5pt 0; }
      h3 { font-size: 14pt; font-weight: bold; margin: 8pt 0 4pt 0; }
      p { margin: 0 0 6pt 0; }
      table { border-collapse: collapse; width: 100%; margin: 8pt 0; }
      td, th { border: 1px solid #666; padding: 4pt 6pt; text-align: left; font-size: 11pt; }
      th { background: #f0f0f0; font-weight: bold; }
      ul, ol { margin: 6pt 0 6pt 20pt; }
      li { margin: 2pt 0; }
      img { max-width: 100%; height: auto; }
      strong, b { font-weight: bold; }
      em, i { font-style: italic; }
    </style>
    ${html}
  `;

  iframeDoc.body.appendChild(container);

  // Wait for any images to load
  const images = container.querySelectorAll('img');
  if (images.length > 0) {
    await Promise.allSettled(
      Array.from(images).map(
        (img) =>
          new Promise<void>((resolve) => {
            if (img.complete) return resolve();
            img.onload = () => resolve();
            img.onerror = () => resolve();
          }),
      ),
    );
  }

  // ── Step 3: Capture with html2canvas ──
  onProgress?.('Capturing pages…');
  let fullCanvas: HTMLCanvasElement;
  try {
    fullCanvas = await html2canvas(container, {
      scale: 2, // 2x for quality
      useCORS: true,
      backgroundColor: '#ffffff',
      width: A4_WIDTH_PX,
      windowWidth: A4_WIDTH_PX,
      window: iframeWindow as Window,
    } as any);
  } catch (e) {
    document.body.removeChild(iframe);
    throw new Error(`Failed to render document: ${e instanceof Error ? e.message : String(e)}`);
  }

  document.body.removeChild(iframe);

  // ── Step 4: Split into A4 pages ──
  onProgress?.('Creating PDF pages…');
  const scaleFactor = 2; // matches html2canvas scale
  const pageHeightPx = A4_HEIGHT_PX * scaleFactor;
  const pageWidthPx = A4_WIDTH_PX * scaleFactor;
  const totalHeight = fullCanvas.height;
  const pageCount = Math.max(1, Math.ceil(totalHeight / pageHeightPx));

  const pageCanvases: HTMLCanvasElement[] = [];
  for (let i = 0; i < pageCount; i++) {
    const pageCanvas = document.createElement('canvas');
    pageCanvas.width = pageWidthPx;
    const remainingHeight = totalHeight - i * pageHeightPx;
    pageCanvas.height = Math.min(pageHeightPx, remainingHeight);

    const ctx = pageCanvas.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
    ctx.drawImage(
      fullCanvas,
      0, i * pageHeightPx,               // source x, y
      pageWidthPx, pageCanvas.height,      // source w, h
      0, 0,                                // dest x, y
      pageWidthPx, pageCanvas.height,      // dest w, h
    );
    pageCanvases.push(pageCanvas);
  }

  // ── Step 5: Create PDF from page images via pdf-lib ──
  onProgress?.('Building PDF…');
  const pdfDoc = await PDFDocument.create();

  for (let i = 0; i < pageCanvases.length; i++) {
    const pageCanvas = pageCanvases[i];
    onProgress?.(`Embedding page ${i + 1} of ${pageCanvases.length}…`);

    const blob = await new Promise<Blob>((resolve) =>
      pageCanvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.92),
    );
    const imgBytes = new Uint8Array(await blob.arrayBuffer());
    const jpgImage = await pdfDoc.embedJpg(imgBytes);

    // Scale page dimensions proportionally to A4
    const aspectRatio = pageCanvas.height / pageCanvas.width;
    const pageWidth = A4_WIDTH_PT;
    const pageHeight = pageWidth * aspectRatio;

    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    page.drawImage(jpgImage, {
      x: 0,
      y: 0,
      width: pageWidth,
      height: pageHeight,
    });
  }

  const pdfBytes = await pdfDoc.save();
  const pdfArrayBuffer = pdfBytes.buffer as ArrayBuffer;

  // Generate converted filename
  const baseName = file.name.replace(/\.docx$/i, '');
  const convertedName = `${baseName}-converted.pdf`;

  return {
    pdfArrayBuffer,
    convertedName,
    pageCount: pageCanvases.length,
    warnings,
  };
}

/**
 * Check if a file is a DOCX file by extension or MIME type.
 */
export function isDocxFile(file: File): boolean {
  const name = file.name.toLowerCase();
  if (name.endsWith('.docx')) return true;
  if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return true;
  return false;
}

/**
 * Check if a file is a PDF file by extension or MIME type.
 */
export function isPdfFile(file: File): boolean {
  const name = file.name.toLowerCase();
  if (name.endsWith('.pdf')) return true;
  if (file.type === 'application/pdf') return true;
  return false;
}
