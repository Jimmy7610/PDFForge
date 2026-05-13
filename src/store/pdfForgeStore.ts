/* ───────────────────────────────────────────────────────────────
   PDFForge – Zustand store
   ─────────────────────────────────────────────────────────────── */
import { create } from 'zustand';
import type {
  PdfForgeState,
  PDFFileState,
  PDFPageState,
  Redaction,
  Stamp,
  CropRect,
  OcrTextItem,
  ActiveTool,
  ExportStatus,
  HistorySnapshot,
} from '../types/pdfForgeTypes';

const MAX_HISTORY = 50;

function clonePages(pages: PDFPageState[]): PDFPageState[] {
  return pages.map((p) => ({
    ...p,
    redactions: p.redactions.map((r) => ({ ...r })),
    stamps: p.stamps.map((s) => ({ ...s })),
    crop: p.crop ? { ...p.crop } : null,
    ocrTextItems: p.ocrTextItems.map((o) => ({ ...o })),
  }));
}

function makeSnapshot(state: { pages: PDFPageState[]; files: PDFFileState[] }): HistorySnapshot {
  return {
    pages: clonePages(state.pages),
    formFields: Object.fromEntries(
      state.files.map((f) => [f.id, f.detectedFormFields.map((ff) => ({ ...ff }))])
    ),
  };
}

const defaultExportStatus: ExportStatus = {
  active: false,
  mode: null,
  progress: 0,
  currentPage: 0,
  totalPages: 0,
  message: '',
  error: null,
};

export const usePdfForgeStore = create<PdfForgeState>((set, get) => ({
  // ── Data ──
  files: [],
  pages: [],
  selectedPageId: null,
  activeTool: 'none',

  // ── Export ──
  exportStatus: { ...defaultExportStatus },
  flattenForms: false,
  includeOcrLayer: true,

  // ── Stamp config ──
  stampText: 'DRAFT',
  stampFontSize: 24,
  stampColor: '#ef4444',
  stampOpacity: 0.7,

  // ── OCR ──
  ocrLanguage: 'eng',
  ocrProgress: 0,
  ocrRunning: false,

  // ── History ──
  history: [],
  historyIndex: -1,

  /* ═══════════════════ ACTIONS ═══════════════════ */

  addFile: (file: PDFFileState, pages: PDFPageState[]) => {
    const state = get();
    const startIndex = state.pages.length;
    const indexedPages = pages.map((p, i) => ({ ...p, displayIndex: startIndex + i }));
    set({
      files: [...state.files, file],
      pages: [...state.pages, ...indexedPages],
    });
    get().pushHistory();
  },

  removeFile: (fileId: string) => {
    get().pushHistory();
    set((s) => {
      const remainingPages = s.pages
        .filter((p) => p.sourceFileId !== fileId)
        .map((p, i) => ({ ...p, displayIndex: i }));
      return {
        files: s.files.filter((f) => f.id !== fileId),
        pages: remainingPages,
        selectedPageId:
          s.selectedPageId && remainingPages.find((p) => p.id === s.selectedPageId)
            ? s.selectedPageId
            : null,
      };
    });
  },

  clearProject: () =>
    set({
      files: [],
      pages: [],
      selectedPageId: null,
      activeTool: 'none',
      exportStatus: { ...defaultExportStatus },
      history: [],
      historyIndex: -1,
      ocrProgress: 0,
      ocrRunning: false,
    }),

  reorderPages: (sourceIndex: number, destinationIndex: number) => {
    get().pushHistory();
    const pages = [...get().pages];
    const [moved] = pages.splice(sourceIndex, 1);
    pages.splice(destinationIndex, 0, moved);
    set({ pages: pages.map((p, i) => ({ ...p, displayIndex: i })) });
  },

  movePage: (pageId: string, direction: 'left' | 'right') => {
    const s = get();
    const index = s.pages.findIndex((p) => p.id === pageId);
    if (index === -1) return;
    const destIndex = direction === 'left' ? index - 1 : index + 1;
    if (destIndex < 0 || destIndex >= s.pages.length) return;
    s.reorderPages(index, destIndex);
  },

  selectPage: (pageId: string | null) => set({ selectedPageId: pageId }),

  setActiveTool: (tool: ActiveTool) => set({ activeTool: tool }),

  rotatePage: (pageId: string, direction: 'cw' | 'ccw') => {
    get().pushHistory();
    set((s) => ({
      pages: s.pages.map((p) => {
        if (p.id !== pageId) return p;
        const delta = direction === 'cw' ? 90 : -90;
        const newRot = (((p.rotation + delta) % 360) + 360) % 360;
        return { ...p, rotation: newRot as 0 | 90 | 180 | 270 };
      }),
    }));
  },

  toggleExclude: (pageId: string) => {
    get().pushHistory();
    set((s) => ({
      pages: s.pages.map((p) => (p.id === pageId ? { ...p, excluded: !p.excluded } : p)),
    }));
  },

  // ── Redactions ──
  addRedaction: (pageId: string, redaction: Redaction) => {
    get().pushHistory();
    set((s) => ({
      pages: s.pages.map((p) =>
        p.id === pageId ? { ...p, redactions: [...p.redactions, redaction] } : p
      ),
    }));
  },

  removeRedaction: (pageId: string, redactionId: string) => {
    get().pushHistory();
    set((s) => ({
      pages: s.pages.map((p) =>
        p.id === pageId
          ? { ...p, redactions: p.redactions.filter((r) => r.id !== redactionId) }
          : p
      ),
    }));
  },

  // ── Stamps ──
  addStamp: (pageId: string, stamp: Stamp) => {
    get().pushHistory();
    set((s) => ({
      pages: s.pages.map((p) =>
        p.id === pageId ? { ...p, stamps: [...p.stamps, stamp] } : p
      ),
    }));
  },

  removeStamp: (pageId: string, stampId: string) => {
    get().pushHistory();
    set((s) => ({
      pages: s.pages.map((p) =>
        p.id === pageId ? { ...p, stamps: p.stamps.filter((st) => st.id !== stampId) } : p
      ),
    }));
  },

  setStampConfig: (config) => set(config),

  // ── Crop ──
  setCrop: (pageId: string, crop: CropRect | null) => {
    get().pushHistory();
    set((s) => ({
      pages: s.pages.map((p) => (p.id === pageId ? { ...p, crop } : p)),
    }));
  },

  // ── OCR ──
  setOcrResults: (pageId: string, items: OcrTextItem[]) =>
    set((s) => ({
      pages: s.pages.map((p) => (p.id === pageId ? { ...p, ocrTextItems: items } : p)),
    })),

  setOcrLanguage: (lang: string) => set({ ocrLanguage: lang }),
  setOcrProgress: (progress: number) => set({ ocrProgress: progress }),
  setOcrRunning: (running: boolean) => set({ ocrRunning: running }),

  // ── Forms ──
  setFormFieldValue: (fileId: string, fieldName: string, value: string | boolean) =>
    set((s) => ({
      files: s.files.map((f) => {
        if (f.id !== fileId) return f;
        return {
          ...f,
          detectedFormFields: f.detectedFormFields.map((ff) =>
            ff.name === fieldName ? { ...ff, value } : ff
          ),
        };
      }),
    })),

  getFormFieldsForFile: (fileId: string) => {
    const file = get().files.find((f) => f.id === fileId);
    return file?.detectedFormFields ?? [];
  },

  // ── Export ──
  setExportStatus: (status: Partial<ExportStatus>) =>
    set((s) => ({ exportStatus: { ...s.exportStatus, ...status } })),

  setFlattenForms: (v: boolean) => set({ flattenForms: v }),
  setIncludeOcrLayer: (v: boolean) => set({ includeOcrLayer: v }),

  // ── Undo / Redo ──
  pushHistory: () =>
    set((s) => {
      const snapshot = makeSnapshot(s);
      const newHistory = s.history.slice(0, s.historyIndex + 1);
      newHistory.push(snapshot);
      if (newHistory.length > MAX_HISTORY) newHistory.shift();
      return { history: newHistory, historyIndex: newHistory.length - 1 };
    }),

  undo: () => {
    const s = get();
    if (s.historyIndex <= 0) return;
    const prev = s.history[s.historyIndex - 1];
    set({
      pages: clonePages(prev.pages),
      files: s.files.map((f) => ({
        ...f,
        detectedFormFields: prev.formFields[f.id]
          ? prev.formFields[f.id].map((ff) => ({ ...ff }))
          : f.detectedFormFields,
      })),
      historyIndex: s.historyIndex - 1,
    });
  },

  redo: () => {
    const s = get();
    if (s.historyIndex >= s.history.length - 1) return;
    const next = s.history[s.historyIndex + 1];
    set({
      pages: clonePages(next.pages),
      files: s.files.map((f) => ({
        ...f,
        detectedFormFields: next.formFields[f.id]
          ? next.formFields[f.id].map((ff) => ({ ...ff }))
          : f.detectedFormFields,
      })),
      historyIndex: s.historyIndex + 1,
    });
  },

  canUndo: () => get().historyIndex > 0,
  canRedo: () => get().historyIndex < get().history.length - 1,

  // ── Selectors ──
  getSelectedPage: () => {
    const s = get();
    return s.pages.find((p) => p.id === s.selectedPageId);
  },

  getIncludedPages: () => get().pages.filter((p) => !p.excluded),

  getFileById: (id: string) => get().files.find((f) => f.id === id),

  getPagesByFile: (fileId: string) => get().pages.filter((p) => p.sourceFileId === fileId),
}));
