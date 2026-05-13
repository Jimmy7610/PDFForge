/* ───────────────────────────────────────────────────────────────
   PDFForge – ExportPanel
   ─────────────────────────────────────────────────────────────── */

import { useState } from 'react';
import { Shield, FileDown, Loader2, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { usePdfForgeStore } from '../../store/pdfForgeStore';
import { exportNormalPdf, exportRasterizedPdf, downloadPdf } from '../../lib/pdfExporter';
import { InfoTooltip } from '../ui/InfoTooltip';

export function ExportPanel() {
  const pages = usePdfForgeStore((s) => s.pages);
  const files = usePdfForgeStore((s) => s.files);
  const flattenForms = usePdfForgeStore((s) => s.flattenForms);
  const includeOcrLayer = usePdfForgeStore((s) => s.includeOcrLayer);
  const setFlattenForms = usePdfForgeStore((s) => s.setFlattenForms);
  const setIncludeOcrLayer = usePdfForgeStore((s) => s.setIncludeOcrLayer);
  const exportStatus = usePdfForgeStore((s) => s.exportStatus);
  const setExportStatus = usePdfForgeStore((s) => s.setExportStatus);

  const [showSuccess, setShowSuccess] = useState(false);

  const includedCount = pages.filter((p) => !p.excluded).length;
  const hasRedactions = pages.some((p) => p.redactions.length > 0);
  const hasOcr = pages.some((p) => p.ocrTextItems.length > 0);

  async function handleExport(mode: 'normal' | 'rasterized') {
    setShowSuccess(false);
    setExportStatus({
      active: true,
      mode,
      progress: 0,
      currentPage: 0,
      totalPages: includedCount,
      message: 'Starting export…',
      error: null,
    });

    try {
      const options = {
        pages,
        files,
        flattenForms,
        includeOcrLayer,
        onProgress: (current: number, total: number, message: string) => {
          setExportStatus({ currentPage: current, totalPages: total, progress: current / total, message });
        },
      };

      const data = mode === 'normal'
        ? await exportNormalPdf(options)
        : await exportRasterizedPdf(options);

      const timestamp = new Date().toISOString().slice(0, 10);
      const suffix = mode === 'rasterized' ? '-secure' : '';
      downloadPdf(data, `pdfforge-export${suffix}-${timestamp}.pdf`);

      setExportStatus({ active: false, progress: 1, message: 'Export complete!', error: null });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 4000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Export failed.';
      setExportStatus({ active: false, error: msg, message: '' });
    }
  }

  if (pages.length === 0) return null;

  return (
    <div className="px-3 pb-3">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-surface-400">
        Export
      </h3>

      {/* Options */}
      <div className="mb-3 space-y-2">
        <InfoTooltip content="Makes filled PDF form values permanent instead of leaving them editable." className="w-full">
          <label className="flex items-center gap-2 text-xs text-surface-300 cursor-pointer">
            <input
              type="checkbox"
              checked={flattenForms}
              onChange={(e) => setFlattenForms(e.target.checked)}
              className="rounded border-surface-600 bg-surface-800 text-primary-500"
            />
            Flatten form fields
          </label>
        </InfoTooltip>
        <InfoTooltip content="Adds recognized text to exported PDFs so scanned pages can become searchable." className="w-full">
          <label className="flex items-center gap-2 text-xs text-surface-300 cursor-pointer">
            <input
              type="checkbox"
              checked={includeOcrLayer}
              onChange={(e) => setIncludeOcrLayer(e.target.checked)}
              className="rounded border-surface-600 bg-surface-800 text-primary-500"
            />
            Include OCR text layer
            {hasOcr && <span className="text-primary-400">✓</span>}
          </label>
        </InfoTooltip>
      </div>

      {/* Normal Export */}
      <InfoTooltip content="Exports a normal PDF while keeping PDF structure where possible." className="mb-2 w-full">
        <button
          onClick={() => handleExport('normal')}
          disabled={exportStatus.active || includedCount === 0}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-500 disabled:cursor-not-allowed disabled:opacity-50"
          id="export-normal-btn"
        >
          {exportStatus.active && exportStatus.mode === 'normal' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileDown className="h-4 w-4" />
          )}
          Normal Export ({includedCount} pages)
        </button>
      </InfoTooltip>

      {/* Secure Rasterized Export */}
      <InfoTooltip content="Flattens pages into images. Best for sensitive documents and redaction." className="mb-3 w-full">
        <button
          onClick={() => handleExport('rasterized')}
          disabled={exportStatus.active || includedCount === 0}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-surface-700 px-4 py-2.5 text-sm font-semibold text-surface-100 ring-1 ring-surface-600 transition-colors hover:bg-surface-600 disabled:cursor-not-allowed disabled:opacity-50"
          id="export-rasterized-btn"
        >
          {exportStatus.active && exportStatus.mode === 'rasterized' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Shield className="h-4 w-4" />
          )}
          Secure Rasterized Export
        </button>
      </InfoTooltip>

      {/* Progress */}
      {exportStatus.active && (
        <div className="mb-3 space-y-1.5">
          <div className="h-1.5 overflow-hidden rounded-full bg-surface-700">
            <div
              className="h-full rounded-full bg-primary-500 transition-all duration-300"
              style={{ width: `${exportStatus.progress * 100}%` }}
            />
          </div>
          <p className="text-xs text-surface-400">{exportStatus.message}</p>
        </div>
      )}

      {/* Success */}
      {showSuccess && (
        <div className="mb-3 flex items-center gap-2 rounded-lg bg-success-500/10 p-2.5 text-xs text-success-500">
          <CheckCircle className="h-3.5 w-3.5 shrink-0" />
          <span>PDF exported successfully!</span>
        </div>
      )}

      {/* Error */}
      {exportStatus.error && (
        <div className="mb-3 flex items-center gap-2 rounded-lg bg-danger-500/10 p-2.5 text-xs text-danger-500">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{exportStatus.error}</span>
        </div>
      )}

      {/* Warnings */}
      {hasRedactions && (
        <div className="mb-2 flex items-start gap-2 rounded-lg bg-warning-500/10 p-2.5 text-xs text-warning-500">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>Normal redaction covers content visually. For truly sensitive documents, use Secure Rasterized Export, which flattens each page into an image.</span>
        </div>
      )}

      <div className="flex items-start gap-2 rounded-lg bg-surface-800/80 p-2.5 text-xs text-surface-400">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <span>PDFForge removes common metadata during export. For maximum privacy, use Secure Rasterized Export.</span>
      </div>
    </div>
  );
}
