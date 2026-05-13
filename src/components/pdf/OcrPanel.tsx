/* ───────────────────────────────────────────────────────────────
   PDFForge – OcrPanel
   ─────────────────────────────────────────────────────────────── */

import { useState } from 'react';
import { ScanText, Loader2, AlertCircle, Info } from 'lucide-react';
import { usePdfForgeStore } from '../../store/pdfForgeStore';
import { ocrPage } from '../../lib/pdfOcr';
import { InfoTooltip } from '../ui/InfoTooltip';

export function OcrPanel() {
  const selectedPageId = usePdfForgeStore((s) => s.selectedPageId);
  const pages = usePdfForgeStore((s) => s.pages);
  const files = usePdfForgeStore((s) => s.files);
  const ocrLanguage = usePdfForgeStore((s) => s.ocrLanguage);
  const ocrProgress = usePdfForgeStore((s) => s.ocrProgress);
  const ocrRunning = usePdfForgeStore((s) => s.ocrRunning);
  const setOcrLanguage = usePdfForgeStore((s) => s.setOcrLanguage);
  const setOcrProgress = usePdfForgeStore((s) => s.setOcrProgress);
  const setOcrRunning = usePdfForgeStore((s) => s.setOcrRunning);
  const setOcrResults = usePdfForgeStore((s) => s.setOcrResults);

  const [error, setError] = useState<string | null>(null);

  const page = pages.find((p) => p.id === selectedPageId);
  const file = page ? files.find((f) => f.id === page.sourceFileId) : null;

  async function runOcrOnPage() {
    if (!page || !file) return;
    setError(null);
    setOcrRunning(true);
    setOcrProgress(0);

    try {
      const items = await ocrPage(
        file.arrayBuffer,
        page.sourcePageIndex,
        page.originalWidth,
        page.originalHeight,
        ocrLanguage,
        (p) => setOcrProgress(p),
      );
      setOcrResults(page.id, items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'OCR failed.');
    }

    setOcrRunning(false);
    setOcrProgress(0);
  }

  async function runOcrOnAll() {
    setError(null);
    setOcrRunning(true);

    const included = pages.filter((p) => !p.excluded);
    for (let i = 0; i < included.length; i++) {
      const p = included[i];
      const f = files.find((ff) => ff.id === p.sourceFileId);
      if (!f) continue;

      setOcrProgress(0);
      try {
        const items = await ocrPage(
          f.arrayBuffer,
          p.sourcePageIndex,
          p.originalWidth,
          p.originalHeight,
          ocrLanguage,
          (prog) => setOcrProgress(prog),
        );
        setOcrResults(p.id, items);
      } catch {
        console.warn(`OCR failed for page ${i + 1}`);
      }
    }

    setOcrRunning(false);
    setOcrProgress(0);
  }

  const ocrItemCount = page?.ocrTextItems.length ?? 0;
  const allOcrCount = pages.reduce((sum, p) => sum + p.ocrTextItems.length, 0);

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-surface-400">OCR — Text Recognition</h4>

      {/* Language selector */}
      <div>
        <InfoTooltip content="Choose the language used for text recognition." position="bottom" className="mb-1">
          <label className="block text-[11px] text-surface-400 cursor-help w-fit">Language</label>
        </InfoTooltip>
        <select
          value={ocrLanguage}
          onChange={(e) => setOcrLanguage(e.target.value)}
          className="w-full rounded-lg border border-surface-600 bg-surface-800 px-2.5 py-1.5 text-xs text-surface-100 focus:border-primary-500 focus:outline-none"
          id="ocr-language-select"
        >
          <option value="eng">English</option>
          <option value="swe">Swedish</option>
          <option value="eng+swe">English + Swedish</option>
          <option value="fra">French</option>
          <option value="deu">German</option>
          <option value="spa">Spanish</option>
        </select>
      </div>

      {/* Buttons */}
      <div className="flex gap-2">
        <InfoTooltip content="Run OCR only on the selected page." className="flex-1 w-full">
          <button
            onClick={runOcrOnPage}
            disabled={ocrRunning || !selectedPageId}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-surface-700 py-2 text-xs font-semibold text-surface-200 transition-colors hover:bg-surface-600 disabled:cursor-not-allowed disabled:opacity-40"
            id="ocr-page-btn"
          >
            {ocrRunning ? <Loader2 className="h-3 w-3 animate-spin" /> : <ScanText className="h-3 w-3" />}
            Scan Page
          </button>
        </InfoTooltip>
        <InfoTooltip content="Run OCR on all included pages." className="flex-1 w-full">
          <button
            onClick={runOcrOnAll}
            disabled={ocrRunning || pages.length === 0}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-surface-700 py-2 text-xs font-semibold text-surface-200 transition-colors hover:bg-surface-600 disabled:cursor-not-allowed disabled:opacity-40"
            id="ocr-all-btn"
          >
            {ocrRunning ? <Loader2 className="h-3 w-3 animate-spin" /> : <ScanText className="h-3 w-3" />}
            Scan All
          </button>
        </InfoTooltip>
      </div>

      {/* Progress */}
      {ocrRunning && (
        <div className="space-y-1">
          <div className="h-1.5 overflow-hidden rounded-full bg-surface-700">
            <div
              className="h-full rounded-full bg-primary-500 transition-all duration-300"
              style={{ width: `${ocrProgress * 100}%` }}
            />
          </div>
          <p className="text-[11px] text-surface-400">Recognizing text… {Math.round(ocrProgress * 100)}%</p>
        </div>
      )}

      {/* Results */}
      {ocrItemCount > 0 && (
        <div className="rounded-lg bg-success-500/10 px-2.5 py-2 text-[11px] text-success-500">
          {ocrItemCount} words detected on this page
        </div>
      )}
      {allOcrCount > 0 && (
        <p className="text-[11px] text-surface-400">{allOcrCount} total words across all pages</p>
      )}

      {ocrItemCount === 0 && allOcrCount === 0 && !ocrRunning && (
        <div className="flex items-start gap-2 rounded-lg bg-surface-800/80 p-2 text-[11px] text-surface-400">
          <Info className="mt-0.5 h-3 w-3 shrink-0" />
          <span>Run OCR to detect text and optionally include a searchable text layer during export.</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 rounded-lg bg-danger-500/10 p-2 text-[11px] text-danger-500">
          <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex items-start gap-2 rounded-lg bg-surface-800/80 p-2 text-[11px] text-surface-400">
        <Info className="mt-0.5 h-3 w-3 shrink-0" />
        <span>OCR is automatic and may contain mistakes. Always review important documents.</span>
      </div>
    </div>
  );
}
