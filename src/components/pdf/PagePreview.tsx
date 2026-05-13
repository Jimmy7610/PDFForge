import { useEffect, useRef, useState, useCallback } from 'react';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { usePdfForgeStore } from '../../store/pdfForgeStore';
import { renderPageToCanvas } from '../../lib/pdfRenderer';
import { ToolOverlay } from './ToolOverlay';
import { InfoTooltip } from '../ui/InfoTooltip';
import { useTranslation } from '../../i18n/useTranslation';

export function PagePreview() {
  const { t } = useTranslation();
  const selectedPageId = usePdfForgeStore((s) => s.selectedPageId);
  const pages = usePdfForgeStore((s) => s.pages);
  const files = usePdfForgeStore((s) => s.files);

  const page = pages.find((p) => p.id === selectedPageId);
  const file = page ? files.find((f) => f.id === page.sourceFileId) : null;

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(1);
  const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 });
  const [loading, setLoading] = useState(false);

  // Track page edits to trigger re-renders
  const pageKey = page
    ? `${page.id}-${page.rotation}-${page.crop?.x ?? 'nc'}-${page.crop?.y ?? ''}-${page.crop?.width ?? ''}-${page.redactions.length}-${page.stamps.length}`
    : '';

  const renderPreview = useCallback(async () => {
    if (!page || !file || !canvasRef.current) return;

    setLoading(true);
    try {
      const scale = 2; // High quality
      const rendered = await renderPageToCanvas(file.arrayBuffer, page.sourcePageIndex, scale, page.rotation);

      const canvas = canvasRef.current;
      canvas.width = rendered.width;
      canvas.height = rendered.height;

      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(rendered, 0, 0);

      setCanvasSize({ w: rendered.width / scale, h: rendered.height / scale });
    } catch (err) {
      console.error('Failed to render preview:', err);
    }
    setLoading(false);
  }, [page, file]);

  useEffect(() => {
    renderPreview();
  }, [renderPreview, pageKey]);

  const fitToWidth = useCallback(() => {
    if (!containerRef.current || canvasSize.w === 0) return;
    const containerWidth = containerRef.current.clientWidth - 48; // padding
    const newZoom = containerWidth / canvasSize.w;
    setZoom(Math.min(Math.max(newZoom, 0.2), 3));
  }, [canvasSize.w]);

  // Auto fit on first render
  useEffect(() => {
    if (canvasSize.w > 0) fitToWidth();
  }, [canvasSize.w, selectedPageId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!page || !file) {
    return (
      <div className="flex flex-1 items-center justify-center text-surface-500">
        <p className="text-sm">{t('workspace.empty')}</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex flex-1 flex-col min-h-0 overflow-hidden">
      {/* Zoom toolbar */}
      <div className="flex items-center justify-center gap-2 border-b border-surface-800 bg-surface-900/50 px-4 py-2 shrink-0">
        <InfoTooltip content={t('workspace.zoom')} position="bottom">
          <button
            onClick={() => setZoom((z) => Math.max(z - 0.2, 0.2))}
            className="rounded-lg p-1.5 text-surface-400 hover:bg-surface-800 hover:text-surface-200 transition-colors cursor-help"
            id="zoom-out-btn"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
        </InfoTooltip>
        <span className="min-w-[4rem] text-center text-xs font-medium text-surface-300">
          {Math.round(zoom * 100)}%
        </span>
        <InfoTooltip content={t('workspace.zoom')} position="bottom">
          <button
            onClick={() => setZoom((z) => Math.min(z + 0.2, 3))}
            className="rounded-lg p-1.5 text-surface-400 hover:bg-surface-800 hover:text-surface-200 transition-colors cursor-help"
            id="zoom-in-btn"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
        </InfoTooltip>
        <InfoTooltip content={t('workspace.zoom')} position="bottom">
          <button
            onClick={fitToWidth}
            className="rounded-lg p-1.5 text-surface-400 hover:bg-surface-800 hover:text-surface-200 transition-colors cursor-help"
            id="fit-width-btn"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </InfoTooltip>
        <span className="ml-3 text-[10px] text-surface-500">
          {page.originalWidth.toFixed(0)} × {page.originalHeight.toFixed(0)} pt
        </span>
      </div>

      {/* Canvas area with scrollable viewport */}
      <InfoTooltip content={t('guide.workspace.preview')} position="bottom" className="flex-1 min-h-0 w-full flex flex-col">
        <div className="flex-1 overflow-auto bg-surface-950 scrollbar-thin scrollbar-thumb-surface-700 scrollbar-track-transparent">
          <div className="flex min-h-full min-w-full p-8 sm:p-12">
            <div
              className="relative shadow-2xl m-auto"
              style={{
                width: canvasSize.w * zoom,
                height: canvasSize.h * zoom,
              }}
            >
              {loading && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-surface-900/80 rounded-lg">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-400 border-t-transparent" />
                </div>
              )}

              <canvas
                ref={canvasRef}
                className="block rounded-sm"
                style={{
                  width: canvasSize.w * zoom,
                  height: canvasSize.h * zoom,
                }}
              />

              {/* Tool overlay */}
              <ToolOverlay
                page={page}
                canvasWidth={canvasSize.w}
                canvasHeight={canvasSize.h}
                zoom={zoom}
              />
            </div>
          </div>
        </div>
      </InfoTooltip>
    </div>
  );
}


