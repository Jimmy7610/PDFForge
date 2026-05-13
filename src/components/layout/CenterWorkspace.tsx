/* ───────────────────────────────────────────────────────────────
   PDFForge – CenterWorkspace
   ─────────────────────────────────────────────────────────────── */

import { usePdfForgeStore } from '../../store/pdfForgeStore';
import { PageGallery } from '../pdf/PageGallery';
import { PagePreview } from '../pdf/PagePreview';
import { FileText, Info } from 'lucide-react';

export function CenterWorkspace() {
  const pages = usePdfForgeStore((s) => s.pages);
  const selectedPageId = usePdfForgeStore((s) => s.selectedPageId);

  if (pages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-surface-500">
        <div className="rounded-2xl bg-surface-800/50 p-6">
          <FileText className="h-16 w-16 text-surface-600" />
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-surface-300">No PDFs uploaded</p>
          <p className="mt-1 text-sm text-surface-500">Upload PDF files to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-hidden">
      {/* Page gallery */}
      <div className="border-b border-surface-800 bg-surface-900/30">
        <div className="max-h-[220px] overflow-y-auto">
          <PageGallery />
        </div>
      </div>

      {/* Selected page preview */}
      {selectedPageId ? (
        <PagePreview />
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-surface-500">
          <div className="rounded-full bg-surface-800/30 p-4">
            <Info className="h-8 w-8 text-surface-600" />
          </div>
          <p className="text-sm font-medium text-surface-300">Select a page to preview and edit it.</p>
        </div>
      )}
    </div>
  );
}
