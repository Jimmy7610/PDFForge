/* ───────────────────────────────────────────────────────────────
   PDFForge – PDF loading (pdf-lib + pdfjs-dist)
   ─────────────────────────────────────────────────────────────── */

import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import type { PDFFileState, PDFPageState, FormFieldState } from '../types/pdfForgeTypes';
import { detectFormFields } from './pdfForms';
import { renderPageThumbnail } from './pdfRenderer';

// pdfjs worker — use bundled worker from pdfjs-dist
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl;

let idCounter = 0;
function uid(prefix: string): string {
  return `${prefix}_${Date.now()}_${idCounter++}`;
}

export async function loadPdfFile(
  file: File,
): Promise<{ fileState: PDFFileState; pageStates: PDFPageState[] }> {
  const arrayBuffer = await file.arrayBuffer();

  // Load with pdf-lib (for manipulation)
  let pdfLibDoc: PDFDocument;
  try {
    pdfLibDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.toLowerCase().includes('encrypt') || msg.toLowerCase().includes('password')) {
      throw new Error('This PDF is password-protected and cannot be opened.');
    }
    throw new Error(`Failed to load PDF: ${msg}`);
  }

  // Load with pdfjs-dist (for rendering)
  let pdfJsDoc: pdfjsLib.PDFDocumentProxy;
  try {
    pdfJsDoc = await pdfjsLib.getDocument({ data: arrayBuffer.slice(0) }).promise;
  } catch {
    throw new Error('Failed to render PDF. The file may be corrupted.');
  }

  const pageCount = pdfLibDoc.getPageCount();

  // Warn about very large PDFs
  if (pageCount > 200) {
    console.warn(`Large PDF detected: ${pageCount} pages. Performance may be affected.`);
  }

  // Detect form fields
  let formFields: FormFieldState[] = [];
  try {
    formFields = detectFormFields(pdfLibDoc);
  } catch {
    // Form detection failure is non-fatal
    console.warn('Could not detect form fields for', file.name);
  }

  const fileId = uid('file');

  const fileState: PDFFileState = {
    id: fileId,
    originalName: file.name,
    arrayBuffer,
    pageCount,
    detectedFormFields: formFields,
  };

  // Build page states with thumbnails
  const pageStates: PDFPageState[] = [];
  for (let i = 0; i < pageCount; i++) {
    const pdfLibPage = pdfLibDoc.getPage(i);
    const { width, height } = pdfLibPage.getSize();

    let thumbnailUrl = '';
    try {
      thumbnailUrl = await renderPageThumbnail(pdfJsDoc, i, 200);
    } catch {
      console.warn(`Failed to render thumbnail for page ${i + 1}`);
    }

    pageStates.push({
      id: uid('page'),
      sourceFileId: fileId,
      sourcePageIndex: i,
      displayIndex: 0, // will be set by store
      originalWidth: width,
      originalHeight: height,
      rotation: 0,
      excluded: false,
      thumbnailUrl,
      redactions: [],
      crop: null,
      stamps: [],
      ocrTextItems: [],
    });
  }

  // Clean up pdfjs document
  pdfJsDoc.destroy();

  return { fileState, pageStates };
}

export { uid };
