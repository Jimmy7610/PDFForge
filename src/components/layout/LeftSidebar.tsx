/* ───────────────────────────────────────────────────────────────
   PDFForge – Left Sidebar
   ─────────────────────────────────────────────────────────────── */

import { useState } from 'react';
import { Hammer, Trash2, Undo2, Redo2, CircleHelp } from 'lucide-react';
import { usePdfForgeStore } from '../../store/pdfForgeStore';
import { UploadDropzone } from '../pdf/UploadDropzone';
import { FileList } from '../pdf/FileList';
import { ExportPanel } from '../pdf/ExportPanel';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { InfoTooltip } from '../ui/InfoTooltip';

interface LeftSidebarProps {
  onOpenGuide?: () => void;
}

export function LeftSidebar({ onOpenGuide }: LeftSidebarProps) {
  const clearProject = usePdfForgeStore((s) => s.clearProject);
  const undo = usePdfForgeStore((s) => s.undo);
  const redo = usePdfForgeStore((s) => s.redo);
  const canUndo = usePdfForgeStore((s) => s.canUndo);
  const canRedo = usePdfForgeStore((s) => s.canRedo);
  const pages = usePdfForgeStore((s) => s.pages);

  const [showClearConfirm, setShowClearConfirm] = useState(false);

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2.5 border-b border-surface-800 px-4 py-4">
        <InfoTooltip content="PDFForge is your local browser-based PDF workbench." position="bottom">
          <div className="flex items-center gap-2.5 cursor-help">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
              <Hammer className="h-4.5 w-4.5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-surface-50">PDFForge</h1>
              <p className="text-[10px] leading-none text-surface-400">Browser PDF Workbench</p>
            </div>
          </div>
        </InfoTooltip>

        {onOpenGuide && (
          <button 
            onClick={onOpenGuide}
            className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg text-surface-400 transition-colors hover:bg-surface-800 hover:text-surface-200"
            title="Guide / Help"
          >
            <CircleHelp className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto py-3">
        <UploadDropzone />
        <FileList />
        <ExportPanel />
      </div>

      {/* Bottom actions */}
      <div className="border-t border-surface-800 p-3">
        {/* Undo/Redo */}
        <div className="mb-2 flex gap-1.5">
          <InfoTooltip content="Undo the last supported edit." className="flex-1">
            <button
              onClick={undo}
              disabled={!canUndo()}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-surface-700 py-1.5 text-xs font-medium text-surface-300 transition-colors hover:bg-surface-800 disabled:cursor-not-allowed disabled:opacity-30"
              id="undo-btn"
            >
              <Undo2 className="h-3.5 w-3.5" />
              Undo
            </button>
          </InfoTooltip>
          <InfoTooltip content="Redo the last undone edit." className="flex-1">
            <button
              onClick={redo}
              disabled={!canRedo()}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-surface-700 py-1.5 text-xs font-medium text-surface-300 transition-colors hover:bg-surface-800 disabled:cursor-not-allowed disabled:opacity-30"
              id="redo-btn"
            >
              <Redo2 className="h-3.5 w-3.5" />
              Redo
            </button>
          </InfoTooltip>
        </div>

        {/* Clear project */}
        <InfoTooltip content="Remove all loaded files and reset the current workspace." className="w-full block">
          <button
            onClick={() => setShowClearConfirm(true)}
            disabled={pages.length === 0}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-surface-700 py-2 text-xs font-medium text-surface-400 transition-colors hover:border-danger-500/50 hover:bg-danger-500/10 hover:text-danger-500 disabled:cursor-not-allowed disabled:opacity-30"
            id="clear-project-btn"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear Project
          </button>
        </InfoTooltip>
      </div>

      <ConfirmDialog
        open={showClearConfirm}
        title="Clear Project"
        message="This will remove all uploaded files, pages, and edits. This action cannot be undone."
        confirmLabel="Clear Everything"
        onConfirm={() => {
          clearProject();
          setShowClearConfirm(false);
        }}
        onCancel={() => setShowClearConfirm(false)}
        destructive
      />
    </div>
  );
}
