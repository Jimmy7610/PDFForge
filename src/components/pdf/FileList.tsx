/* ───────────────────────────────────────────────────────────────
   PDFForge – FileList (uploaded files list)
   ─────────────────────────────────────────────────────────────── */

import { useState } from 'react';
import { FileText, Trash2 } from 'lucide-react';
import { usePdfForgeStore } from '../../store/pdfForgeStore';
import { ConfirmDialog } from '../ui/ConfirmDialog';

export function FileList() {
  const files = usePdfForgeStore((s) => s.files);
  const removeFile = usePdfForgeStore((s) => s.removeFile);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);

  if (files.length === 0) return null;

  const fileToRemove = files.find((f) => f.id === confirmRemoveId);

  return (
    <div className="px-3 pb-3">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-surface-400">
        Files ({files.length})
      </h3>

      <div className="space-y-1.5">
        {files.map((file) => (
          <div
            key={file.id}
            className="group flex items-center gap-2.5 rounded-lg bg-surface-800/60 p-2.5 transition-colors hover:bg-surface-800"
          >
            <FileText className="h-4 w-4 shrink-0 text-primary-400" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-surface-200">{file.originalName}</p>
              <p className="text-xs text-surface-400">{file.pageCount} page{file.pageCount !== 1 ? 's' : ''}</p>
            </div>
            <button
              onClick={() => setConfirmRemoveId(file.id)}
              className="rounded p-1 text-surface-500 opacity-0 transition-all hover:bg-danger-500/20 hover:text-danger-500 group-hover:opacity-100"
              title="Remove file"
              id={`remove-file-${file.id}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={!!confirmRemoveId}
        title="Remove File"
        message={`Remove "${fileToRemove?.originalName ?? ''}" and all its pages from the project? This cannot be undone.`}
        confirmLabel="Remove"
        onConfirm={() => {
          if (confirmRemoveId) removeFile(confirmRemoveId);
          setConfirmRemoveId(null);
        }}
        onCancel={() => setConfirmRemoveId(null)}
        destructive
      />
    </div>
  );
}
