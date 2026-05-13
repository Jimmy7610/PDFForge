import { usePdfForgeStore } from '../../store/pdfForgeStore';
import { PageGallery } from '../pdf/PageGallery';
import { PagePreview } from '../pdf/PagePreview';
import { FileText, Info } from 'lucide-react';
import { useTranslation } from '../../i18n/useTranslation';

export function CenterWorkspace() {
  const { t } = useTranslation();
  const pages = usePdfForgeStore((s) => s.pages);
  const selectedPageId = usePdfForgeStore((s) => s.selectedPageId);

  if (pages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-surface-500">
        <div className="rounded-2xl bg-surface-800/50 p-6">
          <FileText className="h-16 w-16 text-surface-600" />
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-surface-300">{t('workspace.empty')}</p>
          <p className="mt-1 text-sm text-surface-500">{t('workspace.emptySub')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-hidden">
      {/* Page gallery strip */}
      <div className="border-b border-surface-800 bg-surface-900/30">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-surface-700 scrollbar-track-transparent">
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
          <p className="text-sm font-medium text-surface-300">{t('workspace.empty')}</p>
        </div>
      )}
    </div>
  );
}

