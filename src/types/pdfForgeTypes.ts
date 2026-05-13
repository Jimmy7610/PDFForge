/* ───────────────────────────────────────────────────────────────
   PDFForge – TypeScript type definitions
   ─────────────────────────────────────────────────────────────── */

export interface Redaction {
  id: string;
  /** PDF-point coordinates (origin = bottom-left of unrotated page) */
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Stamp {
  id: string;
  text: string;
  /** PDF-point X */
  x: number;
  /** PDF-point Y */
  y: number;
  fontSize: number;
  color: string;
  opacity: number;
}

export interface CropRect {
  /** PDF-point coordinates */
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface OcrTextItem {
  text: string;
  /** PDF-point bounding box */
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
}

export type FormFieldType = 'text' | 'checkbox' | 'radio' | 'dropdown' | 'optionList';

export interface FormFieldState {
  name: string;
  type: FormFieldType;
  value: string | boolean;
  options?: string[]; // for dropdowns / radio
}

export interface PDFPageState {
  id: string;
  sourceFileId: string;
  sourcePageIndex: number; // 0-based
  displayIndex: number;
  originalWidth: number;  // PDF points
  originalHeight: number; // PDF points
  rotation: 0 | 90 | 180 | 270;
  excluded: boolean;
  thumbnailUrl: string;
  redactions: Redaction[];
  crop: CropRect | null;
  stamps: Stamp[];
  ocrTextItems: OcrTextItem[];
}

export interface PDFFileState {
  id: string;
  originalName: string;
  arrayBuffer: ArrayBuffer;
  pageCount: number;
  detectedFormFields: FormFieldState[];
}

export type ActiveTool = 'none' | 'redact' | 'crop' | 'stamp';

export type ExportMode = 'normal' | 'rasterized';

export interface ExportStatus {
  active: boolean;
  mode: ExportMode | null;
  progress: number; // 0-1
  currentPage: number;
  totalPages: number;
  message: string;
  error: string | null;
}

export interface HistorySnapshot {
  pages: PDFPageState[];
  formFields: Record<string, FormFieldState[]>; // fileId -> fields
}

export interface PdfForgeState {
  // ── Data ──
  files: PDFFileState[];
  pages: PDFPageState[];
  selectedPageId: string | null;
  selectedRedactionId: string | null;
  activeTool: ActiveTool;

  // ── Export ──
  exportStatus: ExportStatus;
  flattenForms: boolean;
  includeOcrLayer: boolean;

  // ── Stamp config ──
  stampText: string;
  stampFontSize: number;
  stampColor: string;
  stampOpacity: number;

  // ── OCR ──
  ocrLanguage: string;
  ocrProgress: number; // 0-1
  ocrRunning: boolean;

  // ── Undo / Redo ──
  history: HistorySnapshot[];
  historyIndex: number;

  // ── Actions ──
  addFile: (file: PDFFileState, pages: PDFPageState[]) => void;
  removeFile: (fileId: string) => void;
  clearProject: () => void;
  reorderPages: (sourceIndex: number, destinationIndex: number) => void;
  movePage: (pageId: string, direction: 'left' | 'right') => void;
  selectPage: (pageId: string | null) => void;
  setSelectedRedactionId: (id: string | null) => void;
  setActiveTool: (tool: ActiveTool) => void;
  rotatePage: (pageId: string, direction: 'cw' | 'ccw') => void;
  toggleExclude: (pageId: string) => void;

  // Redactions
  addRedaction: (pageId: string, redaction: Redaction) => void;
  updateRedaction: (pageId: string, redactionId: string, patch: Partial<Omit<Redaction, 'id'>>) => void;
  removeRedaction: (pageId: string, redactionId: string) => void;

  // Stamps
  addStamp: (pageId: string, stamp: Stamp) => void;
  removeStamp: (pageId: string, stampId: string) => void;
  setStampConfig: (config: Partial<Pick<PdfForgeState, 'stampText' | 'stampFontSize' | 'stampColor' | 'stampOpacity'>>) => void;

  // Crop
  setCrop: (pageId: string, crop: CropRect | null) => void;

  // OCR
  setOcrResults: (pageId: string, items: OcrTextItem[]) => void;
  setOcrLanguage: (lang: string) => void;
  setOcrProgress: (progress: number) => void;
  setOcrRunning: (running: boolean) => void;

  // Forms
  setFormFieldValue: (fileId: string, fieldName: string, value: string | boolean) => void;
  getFormFieldsForFile: (fileId: string) => FormFieldState[];

  // Export
  setExportStatus: (status: Partial<ExportStatus>) => void;
  setFlattenForms: (v: boolean) => void;
  setIncludeOcrLayer: (v: boolean) => void;

  // Undo / Redo
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // Selectors
  getSelectedPage: () => PDFPageState | undefined;
  getIncludedPages: () => PDFPageState[];
  getFileById: (id: string) => PDFFileState | undefined;
  getPagesByFile: (fileId: string) => PDFPageState[];
}
