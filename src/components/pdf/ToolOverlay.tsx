import { useRef, useState, useCallback, useEffect } from 'react';
import { usePdfForgeStore } from '../../store/pdfForgeStore';
import { canvasRectToPdfRect, canvasToPdf, pdfRectToCanvasRect } from '../../lib/pdfCoordinates';
import { uid } from '../../lib/pdfLoader';
import type { PDFPageState } from '../../types/pdfForgeTypes';

interface ToolOverlayProps {
  page: PDFPageState;
  canvasWidth: number;
  canvasHeight: number;
  zoom: number;
}

export function ToolOverlay({ page, canvasWidth, canvasHeight, zoom }: ToolOverlayProps) {
  const activeTool = usePdfForgeStore((s) => s.activeTool);
  const setActiveTool = usePdfForgeStore((s) => s.setActiveTool);
  const addRedaction = usePdfForgeStore((s) => s.addRedaction);
  const addStamp = usePdfForgeStore((s) => s.addStamp);
  const setCrop = usePdfForgeStore((s) => s.setCrop);
  const stampText = usePdfForgeStore((s) => s.stampText);
  const stampFontSize = usePdfForgeStore((s) => s.stampFontSize);
  const stampColor = usePdfForgeStore((s) => s.stampColor);
  const stampOpacity = usePdfForgeStore((s) => s.stampOpacity);
  const removeRedaction = usePdfForgeStore((s) => s.removeRedaction);

  const overlayRef = useRef<HTMLDivElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 });
  const [hoverPos, setHoverPos] = useState<{ x: number, y: number } | null>(null);

  const getRelativePos = useCallback((e: React.MouseEvent | MouseEvent) => {
    const rect = overlayRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, []);

  // Keyboard cancel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeTool !== 'none') {
        setActiveTool('none');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTool, setActiveTool]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (activeTool === 'none') return;
    if (activeTool === 'stamp') return; // stamps use click, not drag

    const pos = getRelativePos(e);
    setStartPos(pos);
    setCurrentPos(pos);
    setDrawing(true);
  }, [activeTool, getRelativePos]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const pos = getRelativePos(e);
    if (drawing) {
      setCurrentPos(pos);
    }
    if (activeTool === 'stamp') {
      setHoverPos(pos);
    } else {
      setHoverPos(null);
    }
  }, [drawing, getRelativePos, activeTool]);

  const handleMouseLeave = useCallback(() => {
    setHoverPos(null);
  }, []);

  const handleMouseUp = useCallback(() => {
    if (!drawing) return;
    setDrawing(false);

    const w = Math.abs(currentPos.x - startPos.x);
    const h = Math.abs(currentPos.y - startPos.y);
    if (w < 5 || h < 5) return; // Too small, ignore

    const pdfRect = canvasRectToPdfRect(
      startPos.x, startPos.y, currentPos.x, currentPos.y,
      canvasWidth, canvasHeight,
      page.originalWidth, page.originalHeight,
      zoom, page.crop, page.rotation,
    );

    if (activeTool === 'redact') {
      addRedaction(page.id, { id: uid('redact'), ...pdfRect });
    } else if (activeTool === 'crop') {
      setCrop(page.id, pdfRect);
    }
  }, [drawing, startPos, currentPos, canvasWidth, canvasHeight, page, zoom, activeTool, addRedaction, setCrop]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (activeTool !== 'stamp') return;
    if (!stampText.trim()) return;

    const pos = getRelativePos(e);
    const { pdfX, pdfY } = canvasToPdf(
      pos.x, pos.y,
      canvasWidth, canvasHeight,
      page.originalWidth, page.originalHeight,
      zoom, page.crop, page.rotation,
    );

    addStamp(page.id, {
      id: uid('stamp'),
      text: stampText,
      x: pdfX,
      y: pdfY,
      fontSize: stampFontSize,
      color: stampColor,
      opacity: stampOpacity,
    });
  }, [activeTool, stampText, stampFontSize, stampColor, stampOpacity, getRelativePos, canvasWidth, canvasHeight, page, zoom, addStamp]);

  // Render existing overlays
  const redactionRects = page.redactions.map((r) =>
    pdfRectToCanvasRect(r, canvasWidth, canvasHeight, page.originalWidth, page.originalHeight, zoom, page.crop, page.rotation)
  );

  const stampPositions = page.stamps.map((s) => {
    const rect = pdfRectToCanvasRect(
      { x: s.x, y: s.y, width: 0, height: 0 },
      canvasWidth, canvasHeight, page.originalWidth, page.originalHeight,
      zoom, page.crop, page.rotation,
    );
    return { ...rect, stamp: s };
  });

  const cropRect = page.crop
    ? pdfRectToCanvasRect(page.crop, canvasWidth, canvasHeight, page.originalWidth, page.originalHeight, zoom, null, page.rotation)
    : null;

  // Drawing preview rect
  const drawLeft = Math.min(startPos.x, currentPos.x);
  const drawTop = Math.min(startPos.y, currentPos.y);
  const drawW = Math.abs(currentPos.x - startPos.x);
  const drawH = Math.abs(currentPos.y - startPos.y);

  return (
    <div
      ref={overlayRef}
      className={`absolute inset-0 ${
        activeTool !== 'none' ? 'cursor-crosshair' : ''
      }`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {/* Existing redaction rectangles */}
      {page.redactions.map((r, i) => (
        <div
          key={r.id}
          className="absolute bg-black/90 border border-red-500/50 group"
          style={{
            left: redactionRects[i].left,
            top: redactionRects[i].top,
            width: redactionRects[i].width,
            height: redactionRects[i].height,
          }}
        >
          <button
            onClick={(e) => { e.stopPropagation(); removeRedaction(page.id, r.id); }}
            className="absolute -right-1.5 -top-1.5 hidden h-4 w-4 items-center justify-center rounded-full bg-danger-600 text-[8px] font-bold text-white group-hover:flex"
          >
            ×
          </button>
        </div>
      ))}

      {/* Existing stamps */}
      {stampPositions.map((sp) => (
        <div
          key={sp.stamp.id}
          className="absolute pointer-events-none"
          style={{
            left: sp.left,
            top: sp.top,
            color: sp.stamp.color,
            opacity: sp.stamp.opacity,
            fontSize: sp.stamp.fontSize * zoom,
            fontFamily: 'Helvetica, Arial, sans-serif',
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
            textAlign: 'center',
            transform: 'translate(-50%, -50%)',
          }}
        >
          {sp.stamp.text}
        </div>
      ))}

      {/* Crop preview */}
      {cropRect && activeTool !== 'crop' && (
        <div
          className="absolute border-2 border-dashed border-warning-500/70 pointer-events-none"
          style={{
            left: cropRect.left,
            top: cropRect.top,
            width: cropRect.width,
            height: cropRect.height,
          }}
        />
      )}

      {/* Active drawing preview (Redact / Crop) */}
      {drawing && (
        <div
          className={`absolute pointer-events-none ${
            activeTool === 'redact'
              ? 'bg-black/60 border-2 border-red-500'
              : 'border-2 border-dashed border-warning-500 bg-warning-500/10'
          }`}
          style={{ left: drawLeft, top: drawTop, width: drawW, height: drawH }}
        />
      )}

      {/* Ghost stamp preview and target marker */}
      {activeTool === 'stamp' && hoverPos && (
        <div 
          className="pointer-events-none absolute z-50 flex flex-col items-center"
          style={{ left: hoverPos.x, top: hoverPos.y }}
        >
          {/* High-contrast crosshair target */}
          <div className="flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center">
            <div className="absolute h-full w-0.5 bg-primary-500/50 shadow-[0_0_2px_rgba(0,0,0,0.8)]" />
            <div className="absolute h-0.5 w-full bg-primary-500/50 shadow-[0_0_2px_rgba(0,0,0,0.8)]" />
            <div className="h-2 w-2 rounded-full border border-white bg-primary-600 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
          </div>
          
          {/* Live stamp text preview */}
          {stampText.trim() && (
            <div 
              className="absolute whitespace-nowrap font-bold"
              style={{ 
                left: 0, 
                top: 0,
                transform: 'translate(-50%, -50%)',
                color: stampColor,
                opacity: stampOpacity * 0.7,
                fontSize: stampFontSize * zoom,
                fontFamily: 'Helvetica, Arial, sans-serif'
              }}
            >
              {stampText}
            </div>
          )}

          {/* Floating help label */}
          <div className="absolute top-10 left-4 whitespace-nowrap rounded-md bg-slate-950/90 border border-slate-800 px-2 py-1 text-[10px] font-bold text-white shadow-2xl backdrop-blur-sm">
            {stampText.trim() ? 'Click to place' : 'Enter text in sidebar'}
          </div>
        </div>
      )}
    </div>
  );
}

