/* ───────────────────────────────────────────────────────────────
   PDFForge – RedactionPanel
   ─────────────────────────────────────────────────────────────── */

import { Shield, Trash2, AlertTriangle } from 'lucide-react';
import { usePdfForgeStore } from '../../store/pdfForgeStore';
import { InfoTooltip } from '../ui/InfoTooltip';
import { useTranslation } from '../../i18n/useTranslation';

export function RedactionPanel() {
  const { t } = useTranslation();
  const activeTool = usePdfForgeStore((s) => s.activeTool);
  const setActiveTool = usePdfForgeStore((s) => s.setActiveTool);
  const selectedPageId = usePdfForgeStore((s) => s.selectedPageId);
  const pages = usePdfForgeStore((s) => s.pages);
  const removeRedaction = usePdfForgeStore((s) => s.removeRedaction);

  const page = pages.find((p) => p.id === selectedPageId);
  const isActive = activeTool === 'redact';

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-surface-400">{t('inspector.redact.title')}</h4>
        <InfoTooltip content={t('inspector.redact.desc')} position="bottom">
          <button
            onClick={() => setActiveTool(isActive ? 'none' : 'redact')}
            disabled={!selectedPageId}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              isActive
                ? 'bg-danger-600 text-white'
                : 'bg-surface-700 text-surface-300 hover:bg-surface-600'
            } disabled:cursor-not-allowed disabled:opacity-40`}
            id="toggle-redact-btn"
          >
            <Shield className="h-3 w-3" />
            {isActive ? t('inspector.redact.active') : t('inspector.redact.btn')}
          </button>
        </InfoTooltip>
      </div>

      {isActive && (
        <p className="text-[11px] text-primary-300">
          {t('inspector.redact.desc')}
        </p>
      )}

      {/* Redaction list */}
      {page && page.redactions.length > 0 && (
        <div className="space-y-1">
          <p className="text-[11px] text-surface-400">{page.redactions.length} {t('inspector.redact.title').toLowerCase()}</p>
          {page.redactions.map((r, i) => (
            <div key={r.id} className="flex items-center justify-between rounded-lg bg-surface-800/60 px-2.5 py-1.5">
              <span className="text-[11px] text-surface-300">
                Area {i + 1} ({r.width.toFixed(0)}×{r.height.toFixed(0)} pt)
              </span>
              <button
                onClick={() => removeRedaction(page.id, r.id)}
                className="rounded p-0.5 text-surface-500 hover:text-danger-500 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-start gap-2 rounded-lg bg-warning-500/10 p-2.5 text-[11px] text-warning-500">
        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <span>{t('inspector.redact.warning')}</span>
      </div>
    </div>
  );
}

