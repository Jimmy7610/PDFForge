/* ───────────────────────────────────────────────────────────────
   PDFForge – Upload Dropzone (react-dropzone)
   ─────────────────────────────────────────────────────────────── */

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, AlertCircle, Loader2, Info } from 'lucide-react';
import { loadPdfFile } from '../../lib/pdfLoader';
import { usePdfForgeStore } from '../../store/pdfForgeStore';
import { convertDocxToPdf, isDocxFile, isPdfFile } from '../../lib/docxImporter';
import { InfoTooltip } from '../ui/InfoTooltip';
import { useTranslation } from '../../i18n/useTranslation';

export function UploadDropzone() {
  const { t } = useTranslation();
  const addFile = usePdfForgeStore((s) => s.addFile);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setError(null);
      setLoading(true);

      for (const file of acceptedFiles) {
        if (!isPdfFile(file) && !isDocxFile(file)) {
          setError(`"${file.name}" ${t('upload.errorInvalid')}`);
          continue;
        }

        // Warn for very large files
        if (file.size > 100 * 1024 * 1024) {
          setError(t('upload.errorTooLarge', { name: file.name, size: (file.size / 1024 / 1024).toFixed(0) }));
        }

        try {
          if (isDocxFile(file)) {
            setLoadingMessage(t('upload.processing'));
            const result = await convertDocxToPdf(file, (msg) => setLoadingMessage(msg));
            
            // Create a new File from the generated PDF array buffer
            const convertedFile = new File([result.pdfArrayBuffer], result.convertedName, {
              type: 'application/pdf',
            });
            
            setLoadingMessage(t('upload.processing'));
            const { fileState, pageStates } = await loadPdfFile(convertedFile);
            addFile(fileState, pageStates);

            if (result.warnings.length > 0) {
              console.warn('DOCX Conversion Warnings:', result.warnings);
            }
          } else {
            setLoadingMessage(t('upload.processing'));
            const { fileState, pageStates } = await loadPdfFile(file);
            addFile(fileState, pageStates);
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : t('common.error');
          setError(msg);
        }
      }

      setLoading(false);
      setLoadingMessage('');
    },
    [addFile, t],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    multiple: true,
  });

  return (
    <div className="px-3 pb-3">
      <InfoTooltip content={t('upload.dragDrop')} position="bottom" className="w-full">
        <div
          {...getRootProps()}
          className={`group/drop relative cursor-pointer w-full rounded-xl border-2 border-dashed p-4 text-center transition-all duration-200 ${
            isDragActive
              ? 'border-primary-400 bg-primary-500/10'
              : 'border-surface-600 bg-surface-800/50 hover:border-primary-500 hover:bg-surface-800'
          }`}
        >
          <input {...getInputProps()} id="pdf-upload-input" />

          {loading ? (
            <div className="flex flex-col items-center gap-2 py-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary-400" />
              <p className="text-sm text-surface-300">{loadingMessage || t('common.loading')}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-2">
              <Upload className={`h-8 w-8 transition-colors ${isDragActive ? 'text-primary-400' : 'text-surface-400 group-hover/drop:text-primary-400'}`} />
              <p className="text-sm font-medium text-surface-200">
                {isDragActive ? t('upload.dragDrop') : t('upload.title')}
              </p>
              <p className="text-xs text-surface-400">{t('upload.browse')}</p>
            </div>
          )}
        </div>
      </InfoTooltip>

      <InfoTooltip content={t('upload.docxWarning')} position="bottom" className="mt-2 w-full">
        <div className="flex items-start gap-2 rounded-lg bg-surface-800/80 p-2 text-[11px] text-surface-400 cursor-help">
          <Info className="mt-0.5 h-3 w-3 shrink-0" />
          <span>{t('upload.docxWarning')}</span>
        </div>
      </InfoTooltip>

      {error && (
        <div className="mt-2 flex items-start gap-2 rounded-lg bg-danger-500/10 p-2.5 text-xs text-danger-500">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
