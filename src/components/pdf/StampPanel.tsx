/* ───────────────────────────────────────────────────────────────
   PDFForge – StampPanel
   ─────────────────────────────────────────────────────────────── */

import { Type, Trash2 } from 'lucide-react';
import { usePdfForgeStore } from '../../store/pdfForgeStore';
import { InfoTooltip } from '../ui/InfoTooltip';

export function StampPanel() {
  const activeTool = usePdfForgeStore((s) => s.activeTool);
  const setActiveTool = usePdfForgeStore((s) => s.setActiveTool);
  const selectedPageId = usePdfForgeStore((s) => s.selectedPageId);
  const pages = usePdfForgeStore((s) => s.pages);
  const stampText = usePdfForgeStore((s) => s.stampText);
  const stampFontSize = usePdfForgeStore((s) => s.stampFontSize);
  const stampColor = usePdfForgeStore((s) => s.stampColor);
  const stampOpacity = usePdfForgeStore((s) => s.stampOpacity);
  const setStampConfig = usePdfForgeStore((s) => s.setStampConfig);
  const removeStamp = usePdfForgeStore((s) => s.removeStamp);

  const page = pages.find((p) => p.id === selectedPageId);
  const isActive = activeTool === 'stamp';

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <InfoTooltip content="Add custom text directly onto the selected page." position="bottom">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-surface-400 cursor-help w-fit">Text Stamp</h4>
        </InfoTooltip>
        <button
          onClick={() => {
            if (!stampText.trim()) return;
            setActiveTool(isActive ? 'none' : 'stamp');
          }}
          disabled={!selectedPageId || (!isActive && !stampText.trim())}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
            isActive
              ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20'
              : 'bg-surface-700 text-surface-300 hover:bg-surface-600'
          } disabled:cursor-not-allowed disabled:opacity-30`}
          id="toggle-stamp-btn"
        >
          <Type className="h-3 w-3" />
          {isActive ? 'Done Placing' : 'Place Stamp'}
        </button>
      </div>

      {/* Stamp config */}
      <div className="space-y-2">
        <div>
          <InfoTooltip content="Write the text that will be placed on the page." position="bottom" className="mb-1">
            <label className="block text-[11px] text-surface-400 cursor-help w-fit">Text</label>
          </InfoTooltip>
          <input
            type="text"
            value={stampText}
            onChange={(e) => setStampConfig({ stampText: e.target.value })}
            className="w-full rounded-lg border border-surface-600 bg-surface-800 px-2.5 py-1.5 text-xs text-surface-100 placeholder-surface-500 focus:border-primary-500 focus:outline-none transition-colors"
            placeholder="e.g. DRAFT, CONFIDENTIAL"
            id="stamp-text-input"
          />
        </div>

        <div className="flex gap-2">
          <div className="flex-1">
            <InfoTooltip content="Controls the stamp text size." position="bottom" className="mb-1">
              <label className="block text-[11px] text-surface-400 cursor-help w-fit">Size</label>
            </InfoTooltip>
            <input
              type="number"
              value={stampFontSize}
              onChange={(e) => setStampConfig({ stampFontSize: Math.max(6, parseInt(e.target.value) || 12) })}
              min={6}
              max={200}
              className="w-full rounded-lg border border-surface-600 bg-surface-800 px-2.5 py-1.5 text-xs text-surface-100 focus:border-primary-500 focus:outline-none"
              id="stamp-size-input"
            />
          </div>
          <div className="flex-1">
            <InfoTooltip content="Controls the stamp text color." position="bottom" className="mb-1">
              <label className="block text-[11px] text-surface-400 cursor-help w-fit">Color</label>
            </InfoTooltip>
            <input
              type="color"
              value={stampColor}
              onChange={(e) => setStampConfig({ stampColor: e.target.value })}
              className="h-[30px] w-full cursor-pointer rounded-lg border border-surface-600 bg-surface-800"
              id="stamp-color-input"
            />
          </div>
        </div>

        <div>
          <InfoTooltip content="Controls how transparent the stamp text is." position="bottom" className="mb-1">
            <label className="block text-[11px] text-surface-400 cursor-help w-fit">Opacity: {Math.round(stampOpacity * 100)}%</label>
          </InfoTooltip>
          <input
            type="range"
            min={0.1}
            max={1}
            step={0.05}
            value={stampOpacity}
            onChange={(e) => setStampConfig({ stampOpacity: parseFloat(e.target.value) })}
            className="w-full accent-primary-500"
            id="stamp-opacity-input"
          />
        </div>
      </div>

      {isActive && (
        <div className="rounded-lg bg-primary-500/10 p-2.5 space-y-1">
          <p className="text-[11px] font-medium text-primary-300">
            Placement Active
          </p>
          <p className="text-[10px] leading-relaxed text-primary-400/80">
            Click on the page to place stamps. Press <span className="font-bold text-primary-300">Esc</span> to cancel.
          </p>
        </div>
      )}

      {/* Existing stamps */}
      {page && page.stamps.length > 0 && (
        <div className="space-y-1">
          <p className="text-[11px] text-surface-400">{page.stamps.length} stamp{page.stamps.length !== 1 ? 's' : ''}</p>
          {page.stamps.map((s, i) => (
            <div key={s.id} className="flex items-center justify-between rounded-lg bg-surface-800/60 px-2.5 py-1.5">
              <span className="truncate text-[11px] text-surface-300">
                {i + 1}. "{s.text}" ({s.fontSize}pt)
              </span>
              <button
                onClick={() => removeStamp(page.id, s.id)}
                className="rounded p-0.5 text-surface-500 hover:text-danger-500 transition-colors"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
