import { useEffect, useRef } from 'react';
import { X, BookOpen, LayoutPanelLeft, AppWindow, MousePointer2, Settings2, Download, AlertTriangle, Zap } from 'lucide-react';
import { useTranslation } from '../../i18n/useTranslation';

interface PDFForgeGuideModalProps {
  open: boolean;
  onClose: () => void;
}

export function PDFForgeGuideModal({ open, onClose }: PDFForgeGuideModalProps) {
  const { t } = useTranslation();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      dialogRef.current?.focus();
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="flex w-full max-w-4xl max-h-[85vh] flex-col rounded-xl border border-surface-700 bg-surface-900 shadow-2xl outline-none"
        onKeyDown={(e) => {
          if (e.key === 'Escape') onClose();
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-surface-800 p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary-500/20 p-2">
              <BookOpen className="h-6 w-6 text-primary-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-surface-50">{t('guide.title')}</h2>
              <p className="text-sm text-surface-400">{t('guide.subtitle')}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-surface-400 transition-colors hover:bg-surface-800 hover:text-surface-200">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 text-surface-300">
          
          {/* Section 1 */}
          <section>
            <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-surface-100">
              <AppWindow className="h-5 w-5 text-primary-400" />
              {t('guide.sections.whatIs.title')}
            </h3>
            <div className="space-y-2 text-sm leading-relaxed">
              <p>{t('guide.sections.whatIs.p1')}</p>
              <p>{t('guide.sections.whatIs.p2')}</p>
            </div>
          </section>

          {/* Section 2 */}
          <section>
            <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-surface-100">
              <LayoutPanelLeft className="h-5 w-5 text-primary-400" />
              {t('guide.sections.sidebar.title')}
            </h3>
            <ul className="list-inside list-disc space-y-2 text-sm leading-relaxed">
              <li>{t('guide.sections.sidebar.upload')}</li>
              <li>{t('guide.sections.sidebar.docx')}</li>
              <li>{t('guide.sections.sidebar.files')}</li>
              <li>{t('guide.sections.sidebar.flatten')}</li>
              <li>{t('guide.sections.sidebar.ocr')}</li>
              <li>{t('guide.sections.sidebar.normal')}</li>
              <li>{t('guide.sections.sidebar.raster')}</li>
              <li>{t('guide.sections.sidebar.metadata')}</li>
              <li>{t('guide.sections.sidebar.controls')}</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section>
            <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-surface-100">
              <MousePointer2 className="h-5 w-5 text-primary-400" />
              {t('guide.sections.workspace.title')}
            </h3>
            <div className="space-y-2 text-sm leading-relaxed">
              <p>{t('guide.sections.workspace.gallery')}</p>
              <p>{t('guide.sections.workspace.preview')}</p>
            </div>
          </section>

          {/* Section 4 */}
          <section>
            <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-surface-100">
              <Settings2 className="h-5 w-5 text-primary-400" />
              {t('guide.sections.inspector.title')}
            </h3>
            <ul className="list-inside list-disc space-y-2 text-sm leading-relaxed">
              <li>{t('guide.sections.inspector.info')}</li>
              <li>{t('guide.sections.inspector.rotation')}</li>
              <li>{t('guide.sections.inspector.redact')}</li>
              <li>{t('guide.sections.inspector.crop')}</li>
              <li>{t('guide.sections.inspector.stamp')}</li>
              <li>{t('guide.sections.inspector.ocr')}</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section>
            <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-surface-100">
              <Download className="h-5 w-5 text-primary-400" />
              {t('guide.sections.export.title')}
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-surface-700 bg-surface-800 p-4">
                <h4 className="mb-2 font-semibold text-surface-200">{t('guide.sections.export.normal.title')}</h4>
                <ul className="list-inside list-disc text-sm space-y-1">
                  <li>{t('guide.sections.export.normal.l1')}</li>
                  <li>{t('guide.sections.export.normal.l2')}</li>
                  <li>{t('guide.sections.export.normal.l3')}</li>
                </ul>
              </div>
              <div className="rounded-lg border border-primary-500/30 bg-primary-500/10 p-4">
                <h4 className="mb-2 font-semibold text-primary-400">{t('guide.sections.export.raster.title')}</h4>
                <ul className="list-inside list-disc text-sm space-y-1">
                  <li>{t('guide.sections.export.raster.l1')}</li>
                  <li>{t('guide.sections.export.raster.l2')}</li>
                  <li>{t('guide.sections.export.raster.l3')}</li>
                  <li>{t('guide.sections.export.raster.l4')}</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 6 */}
          <section>
            <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-surface-100">
              <AlertTriangle className="h-5 w-5 text-warning-500" />
              {t('guide.sections.limitations.title')}
            </h3>
            <div className="rounded-lg border border-warning-500/20 bg-warning-500/10 p-4 text-sm leading-relaxed text-warning-200">
              <ul className="list-inside list-disc space-y-2">
                <li>{t('guide.sections.limitations.l1')}</li>
                <li>{t('guide.sections.limitations.l2')}</li>
                <li>{t('guide.sections.limitations.l3')}</li>
                <li>{t('guide.sections.limitations.l4')}</li>
                <li>{t('guide.sections.limitations.l5')}</li>
              </ul>
            </div>
          </section>

          {/* Section 7 */}
          <section>
            <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-surface-100">
              <Zap className="h-5 w-5 text-primary-400" />
              {t('guide.sections.quickStart.title')}
            </h3>
            <ol className="list-inside list-decimal space-y-2 text-sm font-medium text-surface-200">
              <li>{t('guide.sections.quickStart.s1')}</li>
              <li>{t('guide.sections.quickStart.s2')}</li>
              <li>{t('guide.sections.quickStart.s3')}</li>
              <li>{t('guide.sections.quickStart.s4')}</li>
              <li>{t('guide.sections.quickStart.s5')}</li>
            </ol>
          </section>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-surface-800 bg-surface-950 p-4 rounded-b-xl">
          <button
            onClick={onClose}
            className="rounded-lg bg-primary-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-500"
          >
            {t('guide.gotIt')}
          </button>
        </div>
      </div>
    </div>
  );
}

