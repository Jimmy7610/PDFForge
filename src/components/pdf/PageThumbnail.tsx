import { memo } from 'react';
import { RotateCw, RotateCcw, Eye, EyeOff, GripVertical, ChevronLeft, ChevronRight } from 'lucide-react';
import { usePdfForgeStore } from '../../store/pdfForgeStore';
import type { PDFPageState } from '../../types/pdfForgeTypes';
import { InfoTooltip } from '../ui/InfoTooltip';
import { useTranslation } from '../../i18n/useTranslation';

interface PageThumbnailProps {
  page: PDFPageState;
  index: number;
  isDragging?: boolean;
  dragHandleProps?: Record<string, unknown>;
}

export const PageThumbnail = memo(function PageThumbnail({
  page,
  index,
  isDragging,
  dragHandleProps,
}: PageThumbnailProps) {
  const { t } = useTranslation();
  const selectPage = usePdfForgeStore((s) => s.selectPage);
  const selectedPageId = usePdfForgeStore((s) => s.selectedPageId);
  const rotatePage = usePdfForgeStore((s) => s.rotatePage);
  const toggleExclude = usePdfForgeStore((s) => s.toggleExclude);
  const movePage = usePdfForgeStore((s) => s.movePage);
  const files = usePdfForgeStore((s) => s.files);

  const file = files.find((f) => f.id === page.sourceFileId);
  const isSelected = selectedPageId === page.id;

  return (
    <div
      className={`group relative flex flex-col rounded-xl border-2 transition-all duration-200 ${
        isSelected
          ? 'border-primary-500 bg-primary-500/10 shadow-lg shadow-primary-500/10'
          : 'border-surface-700 bg-surface-800/60 hover:border-surface-500'
      } ${page.excluded ? 'opacity-40' : ''} ${isDragging ? 'scale-105 shadow-2xl ring-2 ring-primary-500/50' : ''}`}
    >
      {/* Drag handle */}
      <div
        {...dragHandleProps}
        className="absolute left-1 top-1 z-20 cursor-grab rounded bg-surface-900/60 p-1 text-surface-400 opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4" />
      </div>

      {/* Sequence badge */}
      <div className="absolute right-1.5 top-1.5 z-10 flex h-5 min-w-5 items-center justify-center rounded-full bg-surface-900/90 px-1.5 text-[10px] font-bold text-surface-300">
        {index + 1}
      </div>

      {/* Move fallbacks (Overlay on hover) */}
      <div className="absolute inset-x-0 top-1/2 z-20 flex -translate-y-1/2 justify-between px-1 opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none">
        <button
          onClick={(e) => { e.stopPropagation(); movePage(page.id, 'left'); }}
          className="pointer-events-auto flex h-7 w-7 items-center justify-center rounded-full bg-surface-900/80 text-white shadow-lg hover:bg-primary-500 transition-colors disabled:opacity-30"
          disabled={index === 0}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); movePage(page.id, 'right'); }}
          className="pointer-events-auto flex h-7 w-7 items-center justify-center rounded-full bg-surface-900/80 text-white shadow-lg hover:bg-primary-500 transition-colors disabled:opacity-30"
          disabled={index >= usePdfForgeStore.getState().pages.length - 1}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Thumbnail */}
      <button
        onClick={() => selectPage(page.id)}
        className="relative flex aspect-[3/4] w-full items-center justify-center overflow-hidden rounded-t-[10px] bg-surface-950"
        id={`page-thumbnail-${page.id}`}
      >
        {page.thumbnailUrl ? (
          <img
            src={page.thumbnailUrl}
            alt={`${t('workspace.page')} ${page.sourcePageIndex + 1}`}
            className="h-full w-full object-contain pointer-events-none"
            style={{ transform: `rotate(${page.rotation}deg)` }}
            loading="lazy"
          />
        ) : (
          <div className="text-xs text-surface-500">{t('common.loading')}</div>
        )}

        {/* Excluded overlay */}
        {page.excluded && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface-900/60">
            <EyeOff className="h-6 w-6 text-surface-400" />
          </div>
        )}

        {/* Indicators */}
        {(page.redactions.length > 0 || page.stamps.length > 0 || page.crop) && (
          <div className="absolute bottom-1 left-1 flex gap-0.5">
            {page.redactions.length > 0 && <span className="rounded bg-danger-600 px-1 py-0.5 text-[8px] font-bold text-white">R</span>}
            {page.stamps.length > 0 && <span className="rounded bg-primary-600 px-1 py-0.5 text-[8px] font-bold text-white">T</span>}
            {page.crop && <span className="rounded bg-warning-500 px-1 py-0.5 text-[8px] font-bold text-white">C</span>}
          </div>
        )}
      </button>

      {/* Info + controls */}
      <div className="flex flex-col gap-1 p-2">
        <p className="truncate text-[9px] font-medium text-surface-400">{file?.originalName ?? 'Unknown'}</p>
        <div className="flex items-center gap-1">
          <InfoTooltip content={t('sidebar.undoTooltip')}>
            <button
              onClick={(e) => { e.stopPropagation(); rotatePage(page.id, 'ccw'); }}
              className="rounded p-1 text-surface-400 hover:bg-surface-700 hover:text-surface-200 transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
            </button>
          </InfoTooltip>
          <InfoTooltip content={t('sidebar.redoTooltip')}>
            <button
              onClick={(e) => { e.stopPropagation(); rotatePage(page.id, 'cw'); }}
              className="rounded p-1 text-surface-400 hover:bg-surface-700 hover:text-surface-200 transition-colors"
            >
              <RotateCw className="h-3 w-3" />
            </button>
          </InfoTooltip>
          <div className="flex-1" />
          <button
            onClick={(e) => { e.stopPropagation(); toggleExclude(page.id); }}
            className={`rounded p-1 transition-colors ${
              page.excluded ? 'text-warning-500 hover:bg-warning-500/20' : 'text-surface-400 hover:bg-surface-700 hover:text-surface-200'
            }`}
          >
            {page.excluded ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
          </button>
        </div>
      </div>
    </div>
  );
});

