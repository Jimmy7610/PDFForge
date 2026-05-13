/* ───────────────────────────────────────────────────────────────
   PDFForge – RedactionPanel
   ─────────────────────────────────────────────────────────────── */

import { Shield, Trash2 } from 'lucide-react';
import { usePdfForgeStore } from '../../store/pdfForgeStore';
import { useTranslation } from '../../i18n/useTranslation';

export function RedactionPanel() {
  const { t } = useTranslation();
  const activeTool = usePdfForgeStore((s) => s.activeTool);
  const setActiveTool = usePdfForgeStore((s) => s.setActiveTool);
  const selectedPageId = usePdfForgeStore((s) => s.selectedPageId);
  const selectedRedactionId = usePdfForgeStore((s) => s.selectedRedactionId);
  const setSelectedRedactionId = usePdfForgeStore((s) => s.setSelectedRedactionId);
  const pages = usePdfForgeStore((s) => s.pages);
  const removeRedaction = usePdfForgeStore((s) => s.removeRedaction);

  const page = pages.find((p) => p.id === selectedPageId);
  const isActive = activeTool === 'redact';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-surface-400">{t('inspector.redact.title')}</h4>
        <button
          onClick={() => setActiveTool(isActive ? 'none' : 'redact')}
          disabled={!selectedPageId}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
            isActive
              ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20'
              : 'bg-surface-700 text-surface-300 hover:bg-surface-600'
          } disabled:cursor-not-allowed disabled:opacity-40`}
          id="toggle-redact-btn"
        >
          <Shield className="h-3.5 w-3.5" />
          {isActive ? t('inspector.redact.done') : t('inspector.redact.btn')}
        </button>
      </div>

      {isActive ? (
        <div className="rounded-xl border border-primary-500/30 bg-primary-500/5 p-3">
          <p className="text-[11px] font-medium leading-relaxed text-primary-200">
            {t('inspector.redact.desc')}
          </p>
        </div>
      ) : (
        <p className="text-[11px] leading-relaxed text-surface-400">
          {t('inspector.redact.warning')}
        </p>
      )}

      {/* Selected Redaction info & actions */}
      {selectedRedactionId && (
        <div className="space-y-3 rounded-xl border border-primary-500/50 bg-primary-600/10 p-3 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wide text-primary-400">{t('inspector.redact.selected')}</span>
            <button
              onClick={() => {
                if (selectedPageId && selectedRedactionId) {
                  removeRedaction(selectedPageId, selectedRedactionId);
                  setSelectedRedactionId(null);
                }
              }}
              className="group flex h-7 w-7 items-center justify-center rounded-lg bg-danger-600/20 text-danger-500 hover:bg-danger-600 hover:text-white transition-all"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="text-[10px] leading-relaxed text-primary-200/80">
            {t('inspector.redact.editDesc')}
          </p>
          <button
             onClick={() => {
              if (selectedPageId && selectedRedactionId) {
                removeRedaction(selectedPageId, selectedRedactionId);
                setSelectedRedactionId(null);
              }
            }}
            className="w-full rounded-lg bg-danger-600 px-3 py-2 text-xs font-bold text-white shadow-lg shadow-danger-600/20 hover:bg-danger-500 transition-all"
          >
            {t('inspector.redact.deleteBtn')}
          </button>
        </div>
      )}

      {/* Redaction list */}
      {page && page.redactions.length > 0 && !selectedRedactionId && (
        <div className="space-y-2">
          <p className="text-[11px] font-bold text-surface-400">
            {page.redactions.length} {t('inspector.redact.title').toLowerCase()}
          </p>
          <div className="max-h-[200px] space-y-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-surface-700">
            {page.redactions.map((r, i) => (
              <button 
                key={r.id} 
                onClick={() => setSelectedRedactionId(r.id)}
                className="flex w-full items-center justify-between rounded-lg bg-surface-800/40 border border-transparent hover:border-primary-500/50 px-3 py-2 transition-all hover:bg-surface-800"
              >
                <span className="text-[11px] font-medium text-surface-300">
                  {t('inspector.redact.title')} {i + 1}
                </span>
                <span className="text-[9px] text-surface-500 uppercase font-bold tracking-tighter">
                  {r.width.toFixed(0)}×{r.height.toFixed(0)}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

