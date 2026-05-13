/* ───────────────────────────────────────────────────────────────
   PDFForge – ConfirmDialog
   ─────────────────────────────────────────────────────────────── */

import { useEffect, useRef } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  destructive = false,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      dialogRef.current?.focus();
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="mx-4 w-full max-w-md rounded-xl border border-surface-700 bg-surface-900 p-6 shadow-2xl outline-none"
        onKeyDown={(e) => {
          if (e.key === 'Escape') onCancel();
        }}
      >
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`rounded-lg p-2 ${destructive ? 'bg-danger-500/20' : 'bg-warning-500/20'}`}>
              <AlertTriangle className={`h-5 w-5 ${destructive ? 'text-danger-500' : 'text-warning-500'}`} />
            </div>
            <h3 className="text-lg font-semibold text-surface-50">{title}</h3>
          </div>
          <button onClick={onCancel} className="rounded-lg p-1 text-surface-400 hover:bg-surface-800 hover:text-surface-200 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mb-6 text-sm leading-relaxed text-surface-300">{message}</p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-lg border border-surface-600 px-4 py-2 text-sm font-medium text-surface-200 hover:bg-surface-800 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors ${
              destructive
                ? 'bg-danger-600 hover:bg-danger-500'
                : 'bg-primary-600 hover:bg-primary-500'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
