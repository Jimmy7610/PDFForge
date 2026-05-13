import { useRef, useState, useCallback, useEffect } from 'react';
import { usePdfForgeStore } from '../../store/pdfForgeStore';
import { canvasRectToPdfRect, canvasToPdf, pdfRectToCanvasRect } from '../../lib/pdfCoordinates';
import { uid } from '../../lib/pdfLoader';
import type { PDFPageState, Redaction } from '../../types/pdfForgeTypes';
import { useTranslation } from '../../i18n/useTranslation';

interface ToolOverlayProps {
  page: PDFPageState;
  canvasWidth: number;
  canvasHeight: number;
  zoom: number;
}

type DragMode = 'none' | 'draw' | 'move' | 'resize';
type HandleType = 'tl' | 'tr' | 'bl' | 'br';

export function ToolOverlay({ page, canvasWidth, canvasHeight, zoom }: ToolOverlayProps) {
  const { t } = useTranslation();
  const activeTool = usePdfForgeStore((s) => s.activeTool);
  const setActiveTool = usePdfForgeStore((s) => s.setActiveTool);
  const addRedaction = usePdfForgeStore((s) => s.addRedaction);
  const updateRedaction = usePdfForgeStore((s) => s.updateRedaction);
  const removeRedaction = usePdfForgeStore((s) => s.removeRedaction);
  const addStamp = usePdfForgeStore((s) => s.addStamp);
  const setCrop = usePdfForgeStore((s) => s.setCrop);
  const stampText = usePdfForgeStore((s) => s.stampText);
  const stampFontSize = usePdfForgeStore((s) => s.stampFontSize);
  const stampColor = usePdfForgeStore((s) => s.stampColor);
  const stampOpacity = usePdfForgeStore((s) => s.stampOpacity);

  const overlayRef = useRef<HTMLDivElement>(null);
  const selectedRedactionId = usePdfForgeStore((s) => s.selectedRedactionId);
  const setSelectedRedactionId = usePdfForgeStore((s) => s.setSelectedRedactionId);
  
  const [dragMode, setDragMode] = useState<DragMode>('none');
  const [resizeHandle, setResizeHandle] = useState<HandleType | null>(null);
  
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 });
  const [hoverPos, setHoverPos] = useState<{ x: number, y: number } | null>(null);

  // For live move/resize before committing to Zustand
  const [localRedaction, setLocalRedaction] = useState<Redaction | null>(null);

  const getRelativePos = useCallback((e: React.MouseEvent | MouseEvent) => {
    const rect = overlayRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, []);

  // Keyboard listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedRedactionId) setSelectedRedactionId(null);
        else if (activeTool !== 'none') setActiveTool('none');
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && selectedRedactionId) {
        // Only delete if not typing in an input (though we don't have inputs here)
        if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
          removeRedaction(page.id, selectedRedactionId);
          setSelectedRedactionId(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTool, setActiveTool, selectedRedactionId, setSelectedRedactionId, removeRedaction, page.id]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const pos = getRelativePos(e);
    setStartPos(pos);
    setCurrentPos(pos);

    // 1. Check handles if a redaction is selected
    if (selectedRedactionId) {
      const r = page.redactions.find(red => red.id === selectedRedactionId);
      if (r) {
        const rect = pdfRectToCanvasRect(r, canvasWidth, canvasHeight, page.originalWidth, page.originalHeight, zoom, page.crop, page.rotation);
        const hSize = 10; // Handle hit area
        
        const handles: Record<HandleType, { x: number, y: number }> = {
          tl: { x: rect.left, y: rect.top },
          tr: { x: rect.left + rect.width, y: rect.top },
          bl: { x: rect.left, y: rect.top + rect.height },
          br: { x: rect.left + rect.width, y: rect.top + rect.height },
        };

        for (const [type, hPos] of Object.entries(handles)) {
          if (Math.abs(pos.x - hPos.x) < hSize && Math.abs(pos.y - hPos.y) < hSize) {
            setDragMode('resize');
            setResizeHandle(type as HandleType);
            setLocalRedaction({ ...r });
            return;
          }
        }

        // 2. Check body of selected redaction for moving
        if (pos.x >= rect.left && pos.x <= rect.left + rect.width && pos.y >= rect.top && pos.y <= rect.top + rect.height) {
          setDragMode('move');
          setLocalRedaction({ ...r });
          return;
        }
      }
    }

    // 3. Check other redactions for selection
    const hitRedaction = page.redactions.find(r => {
      const rect = pdfRectToCanvasRect(r, canvasWidth, canvasHeight, page.originalWidth, page.originalHeight, zoom, page.crop, page.rotation);
      return pos.x >= rect.left && pos.x <= rect.left + rect.width && pos.y >= rect.top && pos.y <= rect.top + rect.height;
    });

    if (hitRedaction) {
      setSelectedRedactionId(hitRedaction.id);
      setDragMode('move');
      setLocalRedaction({ ...hitRedaction });
      return;
    }

    // 4. If nothing hit and tool active, start drawing
    if (activeTool === 'redact' || activeTool === 'crop') {
      setSelectedRedactionId(null);
      setDragMode('draw');
    } else {
      setSelectedRedactionId(null);
    }
  }, [selectedRedactionId, setSelectedRedactionId, page.redactions, page.originalWidth, page.originalHeight, page.crop, page.rotation, canvasWidth, canvasHeight, zoom, getRelativePos, activeTool]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const pos = getRelativePos(e);
    setCurrentPos(pos);
    setHoverPos(pos);

    if (dragMode === 'draw') {
      // Handled by render
    } else if (dragMode === 'move' && localRedaction) {
      const startPdf = canvasToPdf(startPos.x, startPos.y, canvasWidth, canvasHeight, page.originalWidth, page.originalHeight, zoom, page.crop, page.rotation);
      const currPdf = canvasToPdf(pos.x, pos.y, canvasWidth, canvasHeight, page.originalWidth, page.originalHeight, zoom, page.crop, page.rotation);
      
      const pdfDx = currPdf.pdfX - startPdf.pdfX;
      const pdfDy = currPdf.pdfY - startPdf.pdfY;

      setLocalRedaction(prev => prev ? {
        ...prev,
        x: prev.x + pdfDx,
        y: prev.y + pdfDy
      } : null);
      
      setStartPos(pos);

    } else if (dragMode === 'resize' && localRedaction && resizeHandle) {
      const r = localRedaction;
      const rCanvas = pdfRectToCanvasRect(r, canvasWidth, canvasHeight, page.originalWidth, page.originalHeight, zoom, page.crop, page.rotation);
      let x1 = rCanvas.left;
      let y1 = rCanvas.top;
      let x2 = rCanvas.left + rCanvas.width;
      let y2 = rCanvas.top + rCanvas.height;

      if (resizeHandle === 'tl') { x1 = pos.x; y1 = pos.y; }
      else if (resizeHandle === 'tr') { x2 = pos.x; y1 = pos.y; }
      else if (resizeHandle === 'bl') { x1 = pos.x; y2 = pos.y; }
      else if (resizeHandle === 'br') { x2 = pos.x; y2 = pos.y; }

      const newPdfRect = canvasRectToPdfRect(x1, y1, x2, y2, canvasWidth, canvasHeight, page.originalWidth, page.originalHeight, zoom, page.crop, page.rotation);
      setLocalRedaction({ ...r, ...newPdfRect });
    }
  }, [dragMode, getRelativePos, localRedaction, startPos, zoom, canvasWidth, canvasHeight, page, resizeHandle]);

  const handleMouseUp = useCallback(() => {
    if (dragMode === 'none') return;

    if (dragMode === 'draw') {
      const w = Math.abs(currentPos.x - startPos.x);
      const h = Math.abs(currentPos.y - startPos.y);
      if (w > 5 && h > 5) {
        const pdfRect = canvasRectToPdfRect(
          startPos.x, startPos.y, currentPos.x, currentPos.y,
          canvasWidth, canvasHeight,
          page.originalWidth, page.originalHeight,
          zoom, page.crop, page.rotation,
        );
        if (activeTool === 'redact') {
          const newId = uid('redact');
          addRedaction(page.id, { id: newId, ...pdfRect });
          setSelectedRedactionId(newId);
        } else if (activeTool === 'crop') {
          setCrop(page.id, pdfRect);
        }
      }
    } else if ((dragMode === 'move' || dragMode === 'resize') && localRedaction && selectedRedactionId) {
      updateRedaction(page.id, selectedRedactionId, {
        x: localRedaction.x,
        y: localRedaction.y,
        width: localRedaction.width,
        height: localRedaction.height
      });
    }

    setDragMode('none');
    setResizeHandle(null);
    setLocalRedaction(null);
  }, [dragMode, currentPos, startPos, canvasWidth, canvasHeight, page, zoom, activeTool, addRedaction, setCrop, updateRedaction, localRedaction, selectedRedactionId, setSelectedRedactionId]);

  const handleMouseLeave = useCallback(() => {
    setHoverPos(null);
    if (dragMode !== 'none') handleMouseUp();
  }, [dragMode, handleMouseUp]);

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
  const redactionRects = page.redactions.map((r) => {
    const data = (selectedRedactionId === r.id && localRedaction) ? localRedaction : r;
    return {
      ...pdfRectToCanvasRect(data, canvasWidth, canvasHeight, page.originalWidth, page.originalHeight, zoom, page.crop, page.rotation),
      id: r.id
    };
  });

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

  const isRedacting = activeTool === 'redact';

  return (
    <div
      ref={overlayRef}
      className={`absolute inset-0 select-none ${
        activeTool !== 'none' ? 'cursor-none' : 'cursor-default'
      }`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {/* Existing redaction rectangles */}
      {redactionRects.map((r) => {
        const isSelected = selectedRedactionId === r.id;
        return (
          <div
            key={r.id}
            className={`absolute bg-black transition-shadow ${
              isSelected ? 'ring-2 ring-primary-500 z-30 shadow-2xl' : 'z-20'
            }`}
            style={{
              left: r.left,
              top: r.top,
              width: r.width,
              height: r.height,
              cursor: isSelected ? 'move' : 'pointer'
            }}
          >
            {isSelected && (
              <>
                {/* Resize handles */}
                <div className="absolute -left-1.5 -top-1.5 h-3 w-3 rounded-full border-2 border-white bg-primary-500 cursor-nwse-resize shadow-sm" onMouseDown={(e) => { e.stopPropagation(); setResizeHandle('tl'); setDragMode('resize'); setLocalRedaction(page.redactions.find(red => red.id === r.id) || null); }} />
                <div className="absolute -right-1.5 -top-1.5 h-3 w-3 rounded-full border-2 border-white bg-primary-500 cursor-nesw-resize shadow-sm" onMouseDown={(e) => { e.stopPropagation(); setResizeHandle('tr'); setDragMode('resize'); setLocalRedaction(page.redactions.find(red => red.id === r.id) || null); }} />
                <div className="absolute -left-1.5 -bottom-1.5 h-3 w-3 rounded-full border-2 border-white bg-primary-500 cursor-nesw-resize shadow-sm" onMouseDown={(e) => { e.stopPropagation(); setResizeHandle('bl'); setDragMode('resize'); setLocalRedaction(page.redactions.find(red => red.id === r.id) || null); }} />
                <div className="absolute -right-1.5 -bottom-1.5 h-3 w-3 rounded-full border-2 border-white bg-primary-500 cursor-nwse-resize shadow-sm" onMouseDown={(e) => { e.stopPropagation(); setResizeHandle('br'); setDragMode('resize'); setLocalRedaction(page.redactions.find(red => red.id === r.id) || null); }} />
                
                {/* Label */}
                <div className="absolute -top-6 left-0 whitespace-nowrap rounded bg-primary-600 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-lg">
                  {t('inspector.redact.selected')}
                </div>
              </>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); removeRedaction(page.id, r.id); setSelectedRedactionId(null); }}
              className="absolute -right-2 -top-2 hidden h-4 w-4 items-center justify-center rounded-full bg-danger-600 text-[8px] font-bold text-white group-hover:flex hover:scale-110 transition-transform z-40"
              style={{ display: isSelected ? 'flex' : undefined }}
            >
              ×
            </button>
          </div>
        );
      })}

      {/* Existing stamps */}
      {stampPositions.map((sp) => (
        <div
          key={sp.stamp.id}
          className="absolute pointer-events-none z-20"
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
          className="absolute border-2 border-dashed border-warning-500/70 pointer-events-none z-10"
          style={{
            left: cropRect.left,
            top: cropRect.top,
            width: cropRect.width,
            height: cropRect.height,
          }}
        />
      )}

      {/* Active drawing preview (Redact / Crop) */}
      {dragMode === 'draw' && (
        <div
          className={`absolute pointer-events-none z-50 ${
            activeTool === 'redact'
              ? 'bg-black border-2 border-primary-500 shadow-2xl'
              : 'border-2 border-dashed border-warning-500 bg-warning-500/10'
          }`}
          style={{ left: drawLeft, top: drawTop, width: drawW, height: drawH }}
        />
      )}

      {/* High-contrast Crosshair & Target Helper */}
      {(isRedacting || activeTool === 'crop' || activeTool === 'stamp') && hoverPos && (
        <div 
          className="pointer-events-none absolute z-[100] flex flex-col items-center"
          style={{ left: hoverPos.x, top: hoverPos.y }}
        >
          {/* Target marker */}
          <div className="flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center">
            {/* Crosshair lines */}
            <div className="absolute h-full w-[1px] bg-white shadow-sm opacity-50" />
            <div className="absolute h-[1px] w-full bg-white shadow-sm opacity-50" />
            <div className="absolute h-6 w-[2px] bg-primary-500 shadow-[0_0_4px_rgba(0,0,0,0.5)]" />
            <div className="absolute h-[2px] w-6 bg-primary-500 shadow-[0_0_4px_rgba(0,0,0,0.5)]" />
            
            {/* Center dot */}
            <div className="h-2 w-2 rounded-full border border-white bg-primary-600 shadow-xl" />
            
            {/* Outer ring */}
            <div className="absolute h-8 w-8 rounded-full border-2 border-primary-500/30 animate-pulse" />
          </div>

          {/* Label */}
          <div className="absolute top-8 left-4 whitespace-nowrap rounded-lg bg-slate-950/90 border border-slate-800 px-3 py-1.5 text-[10px] font-bold text-white shadow-2xl backdrop-blur-md">
            {activeTool === 'redact' && t('inspector.redact.helper')}
            {activeTool === 'crop' && t('inspector.crop.btn')}
            {activeTool === 'stamp' && (stampText.trim() ? t('inspector.stamp.placing') : t('inspector.stamp.emptyWarning'))}
          </div>
          
          {/* Ghost stamp text preview */}
          {activeTool === 'stamp' && stampText.trim() && (
            <div 
              className="absolute whitespace-nowrap font-bold opacity-50"
              style={{ 
                left: 0, 
                top: -20,
                transform: 'translate(-50%, -50%)',
                color: stampColor,
                fontSize: stampFontSize * zoom,
                fontFamily: 'Helvetica, Arial, sans-serif'
              }}
            >
              {stampText}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

