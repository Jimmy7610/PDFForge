/* ───────────────────────────────────────────────────────────────
   PDFForge – PageThumbnail
   ─────────────────────────────────────────────────────────────── */

import { memo } from 'react';
import { RotateCw, RotateCcw, Eye, EyeOff, GripVertical } from 'lucide-react';
import { usePdfForgeStore } from '../../store/pdfForgeStore';
import type { PDFPageState } from '../../types/pdfForgeTypes';
import { InfoTooltip } from '../ui/InfoTooltip';

interface PageThumbnailProps {
  page: PDFPageState;
  index: number;
  dragHandleProps?: Record<string, unknown>;
}

export const PageThumbnail = memo(function PageThumbnail({
  page,
  index,
  dragHandleProps,
}: PageThumbnailProps) {
  const selectPage = usePdfForgeStore((s) => s.selectPage);
  const selectedPageId = usePdfForgeStore((s) => s.selectedPageId);
  const rotatePage = usePdfForgeStore((s) => s.rotatePage);
  const toggleExclude = usePdfForgeStore((s) => s.toggleExclude);
  const files = usePdfForgeStore((s) => s.files);

  const file = files.find((f) => f.id === page.sourceFileId);
  const isSelected = selectedPageId === page.id;

  return (
    <div
      className={`group relative flex flex-col rounded-xl border-2 transition-all duration-200 ${
        isSelected
          ? 'border-primary-500 bg-primary-500/10 shadow-lg shadow-primary-500/10'
          : 'border-surface-700 bg-surface-800/60 hover:border-surface-500'
      } ${page.excluded ? 'opacity-40' : ''}`}
    >
      {/* Drag handle */}
      <div
        {...dragHandleProps}
        className="absolute left-1 top-1 z-10 cursor-grab rounded p-0.5 text-surface-500 opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
      >
        <GripVertical className="h-3.5 w-3.5" />
      </div>

      {/* Sequence badge */}
      <div className="absolute right-1.5 top-1.5 z-10 flex h-5 min-w-5 items-center justify-center rounded-full bg-surface-900/90 px-1.5 text-[10px] font-bold text-surface-300">
        {index + 1}
      </div>

      {/* Thumbnail */}
      <InfoTooltip content="Click to select. Drag to reorder." position="top" className="w-full">
        <button
          onClick={() => selectPage(page.id)}
          className="relative flex aspect-[3/4] w-full items-center justify-center overflow-hidden rounded-t-[10px] bg-surface-900"
          id={`page-thumbnail-${page.id}`}
        >
        {page.thumbnailUrl ? (
          <img
            src={page.thumbnailUrl}
            alt={`Page ${page.sourcePageIndex + 1}`}
            className="h-full w-full object-contain"
            style={{ transform: `rotate(${page.rotation}deg)` }}
            loading="lazy"
          />
        ) : (
          <div className="text-xs text-surface-500">Loading…</div>
        )}

        {/* Excluded overlay */}
        {page.excluded && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface-900/60">
            <EyeOff className="h-6 w-6 text-surface-400" />
          </div>
        )}

        {/* Redaction/stamp indicators */}
        {(page.redactions.length > 0 || page.stamps.length > 0 || page.crop) && (
          <div className="absolute bottom-1 left-1 flex gap-0.5">
            {page.redactions.length > 0 && (
              <span className="rounded bg-danger-600 px-1 py-0.5 text-[8px] font-bold text-white">R</span>
            )}
            {page.stamps.length > 0 && (
              <span className="rounded bg-primary-600 px-1 py-0.5 text-[8px] font-bold text-white">T</span>
            )}
            {page.crop && (
              <span className="rounded bg-warning-500 px-1 py-0.5 text-[8px] font-bold text-white">C</span>
            )}
            {page.ocrTextItems.length > 0 && (
              <span className="rounded bg-success-500 px-1 py-0.5 text-[8px] font-bold text-white">OCR</span>
            )}
          </div>
        )}
        </button>
      </InfoTooltip>

      {/* Info + controls */}
      <div className="flex flex-col gap-1 p-2">
        <p className="truncate text-[10px] text-surface-400">{file?.originalName ?? 'Unknown'}</p>
        <p className="text-[10px] text-surface-500">Page {page.sourcePageIndex + 1} · {page.rotation}°</p>

        <div className="flex items-center gap-1 pt-0.5">
          <InfoTooltip content="Rotate left">
            <button
              onClick={() => rotatePage(page.id, 'ccw')}
              className="rounded p-1 text-surface-400 hover:bg-surface-700 hover:text-surface-200 transition-colors cursor-help"
            >
              <RotateCcw className="h-3 w-3" />
            </button>
          </InfoTooltip>
          <InfoTooltip content="Rotate right">
            <button
              onClick={() => rotatePage(page.id, 'cw')}
              className="rounded p-1 text-surface-400 hover:bg-surface-700 hover:text-surface-200 transition-colors cursor-help"
            >
              <RotateCw className="h-3 w-3" />
            </button>
          </InfoTooltip>
          <div className="flex-1" />
          <InfoTooltip content={page.excluded ? 'Include this page in the final export.' : 'Exclude this page from the final export.'} position="left">
            <button
              onClick={() => toggleExclude(page.id)}
              className={`rounded p-1 transition-colors cursor-help ${
                page.excluded
                  ? 'text-warning-500 hover:bg-warning-500/20'
                  : 'text-surface-400 hover:bg-surface-700 hover:text-surface-200'
              }`}
            >
              {page.excluded ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            </button>
          </InfoTooltip>
        </div>
      </div>
    </div>
  );
});
