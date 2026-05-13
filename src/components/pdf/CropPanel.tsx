import { Crop, RotateCcw } from 'lucide-react';
import { usePdfForgeStore } from '../../store/pdfForgeStore';
import { InfoTooltip } from '../ui/InfoTooltip';
import { useTranslation } from '../../i18n/useTranslation';

export function CropPanel() {
  const { t } = useTranslation();
  const activeTool = usePdfForgeStore((s) => s.activeTool);
  const setActiveTool = usePdfForgeStore((s) => s.setActiveTool);
  const selectedPageId = usePdfForgeStore((s) => s.selectedPageId);
  const pages = usePdfForgeStore((s) => s.pages);
  const setCrop = usePdfForgeStore((s) => s.setCrop);

  const page = pages.find((p) => p.id === selectedPageId);
  const isActive = activeTool === 'crop';

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-surface-400">{t('inspector.crop.title')}</h4>
        <InfoTooltip content={t('inspector.crop.desc')} position="bottom">
          <button
            onClick={() => setActiveTool(isActive ? 'none' : 'crop')}
            disabled={!selectedPageId}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              isActive
                ? 'bg-warning-500 text-black'
                : 'bg-surface-700 text-surface-300 hover:bg-surface-600'
            } disabled:cursor-not-allowed disabled:opacity-40`}
            id="toggle-crop-btn"
          >
            <Crop className="h-3 w-3" />
            {isActive ? t('inspector.crop.active') : t('inspector.crop.btn')}
          </button>
        </InfoTooltip>
      </div>

      {isActive && (
        <p className="text-[11px] text-primary-300">
          {t('inspector.crop.desc')}
        </p>
      )}

      {page?.crop && (
        <div className="space-y-2">
          <div className="rounded-lg bg-surface-800/60 px-2.5 py-2 text-[11px] text-surface-300">
            <p>{t('inspector.crop.title')}: {page.crop.width.toFixed(0)} × {page.crop.height.toFixed(0)} pt</p>
            <p className="text-surface-500">at ({page.crop.x.toFixed(0)}, {page.crop.y.toFixed(0)})</p>
          </div>
          <button
            onClick={() => setCrop(page.id, null)}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-surface-600 py-1.5 text-xs text-surface-300 hover:bg-surface-800 transition-colors"
            id="reset-crop-btn"
          >
            <RotateCcw className="h-3 w-3" />
            {t('common.redo')} {/* Using redo for Reset? No, let's use a common Reset or just t('inspector.crop.title') */}
            Reset
          </button>
        </div>
      )}
    </div>
  );
}

