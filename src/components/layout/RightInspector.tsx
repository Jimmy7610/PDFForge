/* ───────────────────────────────────────────────────────────────
   PDFForge – Right Inspector sidebar
   ─────────────────────────────────────────────────────────────── */

import { usePdfForgeStore } from '../../store/pdfForgeStore';
import { RedactionPanel } from '../pdf/RedactionPanel';
import { CropPanel } from '../pdf/CropPanel';
import { StampPanel } from '../pdf/StampPanel';
import { OcrPanel } from '../pdf/OcrPanel';
import { FormFieldEditor } from '../pdf/FormFieldEditor';
import { RotateCw, RotateCcw, Eye, EyeOff, Info } from 'lucide-react';
import { InfoTooltip } from '../ui/InfoTooltip';

export function RightInspector() {
  const selectedPageId = usePdfForgeStore((s) => s.selectedPageId);
  const pages = usePdfForgeStore((s) => s.pages);
  const files = usePdfForgeStore((s) => s.files);
  const rotatePage = usePdfForgeStore((s) => s.rotatePage);
  const toggleExclude = usePdfForgeStore((s) => s.toggleExclude);

  const page = pages.find((p) => p.id === selectedPageId);
  const file = page ? files.find((f) => f.id === page.sourceFileId) : null;

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-surface-800 px-4 py-3">
        <InfoTooltip content="Tools and settings for the currently selected page." position="bottom">
          <h2 className="text-sm font-semibold text-surface-200 cursor-help w-fit">Smart Inspector</h2>
        </InfoTooltip>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {!page ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 pt-12 text-center text-surface-500">
            <div className="rounded-full bg-surface-800/50 p-4">
              <Info className="h-8 w-8 text-surface-400" />
            </div>
            <p className="text-sm font-medium text-surface-300">Select a page to preview and edit it.</p>
            <p className="max-w-[200px] text-xs leading-relaxed text-surface-500">
              Click on any page in the center workspace to view its details and access editing tools.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Page info */}
            <div className="rounded-xl bg-surface-800/60 p-3 space-y-2">
              <InfoTooltip content="Shows information about the selected page." position="bottom">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-surface-400 cursor-help w-fit">Page Info</h4>
              </InfoTooltip>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
                <InfoTooltip content="The original file this page came from." position="left" className="col-span-1">
                  <span className="text-surface-500 cursor-help flex w-full">Source</span>
                </InfoTooltip>
                <span className="truncate text-surface-200">{file?.originalName}</span>
                
                <InfoTooltip content="The original page number and total pages." position="left" className="col-span-1">
                  <span className="text-surface-500 cursor-help flex w-full">Page</span>
                </InfoTooltip>
                <span className="text-surface-200">{page.sourcePageIndex + 1} of {file?.pageCount}</span>
                
                <InfoTooltip content="The PDF page size in points." position="left" className="col-span-1">
                  <span className="text-surface-500 cursor-help flex w-full">Size</span>
                </InfoTooltip>
                <span className="text-surface-200">{page.originalWidth.toFixed(0)} × {page.originalHeight.toFixed(0)} pt</span>
                
                <InfoTooltip content="Rotate the selected page before export." position="left" className="col-span-1">
                  <span className="text-surface-500 cursor-help flex w-full">Rotation</span>
                </InfoTooltip>
                <span className="text-surface-200">{page.rotation}°</span>
                
                <InfoTooltip content="Excluded pages stay visible but are not exported." position="left" className="col-span-1">
                  <span className="text-surface-500 cursor-help flex w-full">Status</span>
                </InfoTooltip>
                <span className={page.excluded ? 'text-warning-500' : 'text-success-500'}>
                  {page.excluded ? 'Excluded' : 'Included'}
                </span>
              </div>

              {/* Quick actions */}
              <div className="flex items-center gap-1.5 pt-1">
                <button
                  onClick={() => rotatePage(page.id, 'ccw')}
                  className="rounded-lg p-1.5 text-surface-400 hover:bg-surface-700 hover:text-surface-200 transition-colors"
                  title="Rotate left"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => rotatePage(page.id, 'cw')}
                  className="rounded-lg p-1.5 text-surface-400 hover:bg-surface-700 hover:text-surface-200 transition-colors"
                  title="Rotate right"
                >
                  <RotateCw className="h-3.5 w-3.5" />
                </button>
                <div className="flex-1" />
                <button
                  onClick={() => toggleExclude(page.id)}
                  className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium transition-colors ${
                    page.excluded
                      ? 'bg-warning-500/20 text-warning-500 hover:bg-warning-500/30'
                      : 'bg-surface-700 text-surface-300 hover:bg-surface-600'
                  }`}
                >
                  {page.excluded ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  {page.excluded ? 'Excluded' : 'Included'}
                </button>
              </div>
            </div>

            {/* Dividers + panels */}
            <hr className="border-surface-800" />
            <RedactionPanel />

            <hr className="border-surface-800" />
            <CropPanel />

            <hr className="border-surface-800" />
            <StampPanel />

            <hr className="border-surface-800" />
            <OcrPanel />

            <hr className="border-surface-800" />
            <FormFieldEditor />
          </div>
        )}
      </div>
    </div>
  );
}
