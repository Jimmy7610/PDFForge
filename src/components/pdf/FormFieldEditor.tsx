/* ───────────────────────────────────────────────────────────────
   PDFForge – FormFieldEditor
   ─────────────────────────────────────────────────────────────── */

import { FileInput, Info } from 'lucide-react';
import { usePdfForgeStore } from '../../store/pdfForgeStore';

export function FormFieldEditor() {
  const selectedPageId = usePdfForgeStore((s) => s.selectedPageId);
  const pages = usePdfForgeStore((s) => s.pages);
  const files = usePdfForgeStore((s) => s.files);
  const setFormFieldValue = usePdfForgeStore((s) => s.setFormFieldValue);

  const page = pages.find((p) => p.id === selectedPageId);
  const file = page ? files.find((f) => f.id === page.sourceFileId) : null;
  const fields = file?.detectedFormFields ?? [];

  if (!file) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <FileInput className="h-3.5 w-3.5 text-surface-400" />
        <h4 className="text-xs font-semibold uppercase tracking-wider text-surface-400">Form Fields</h4>
      </div>

      {fields.length === 0 ? (
        <div className="flex items-start gap-2 rounded-lg bg-surface-800/80 p-2 text-[11px] text-surface-400">
          <Info className="mt-0.5 h-3 w-3 shrink-0" />
          <span>No editable form fields were detected in this PDF.</span>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-[11px] text-surface-400">{fields.length} field{fields.length !== 1 ? 's' : ''} detected</p>

          {fields.map((field) => (
            <div key={field.name} className="rounded-lg bg-surface-800/60 px-2.5 py-2">
              <label className="mb-1 block text-[11px] font-medium text-surface-300">
                {field.name}
                <span className="ml-1.5 rounded bg-surface-700 px-1 py-0.5 text-[9px] font-semibold uppercase text-surface-500">
                  {field.type}
                </span>
              </label>

              {field.type === 'text' && (
                <input
                  type="text"
                  value={typeof field.value === 'string' ? field.value : ''}
                  onChange={(e) => setFormFieldValue(file.id, field.name, e.target.value)}
                  className="w-full rounded border border-surface-600 bg-surface-900 px-2 py-1 text-xs text-surface-100 placeholder-surface-500 focus:border-primary-500 focus:outline-none"
                  placeholder="Enter value…"
                />
              )}

              {field.type === 'checkbox' && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={typeof field.value === 'boolean' ? field.value : false}
                    onChange={(e) => setFormFieldValue(file.id, field.name, e.target.checked)}
                    className="rounded border-surface-600 bg-surface-900 text-primary-500"
                  />
                  <span className="text-[11px] text-surface-300">{field.value ? 'Checked' : 'Unchecked'}</span>
                </label>
              )}

              {(field.type === 'radio' || field.type === 'dropdown' || field.type === 'optionList') && field.options && (
                <select
                  value={typeof field.value === 'string' ? field.value : ''}
                  onChange={(e) => setFormFieldValue(file.id, field.name, e.target.value)}
                  className="w-full rounded border border-surface-600 bg-surface-900 px-2 py-1 text-xs text-surface-100 focus:border-primary-500 focus:outline-none"
                >
                  <option value="">Select…</option>
                  {field.options.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
