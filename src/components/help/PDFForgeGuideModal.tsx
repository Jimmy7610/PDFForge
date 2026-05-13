import { useEffect, useRef } from 'react';
import { X, BookOpen, LayoutPanelLeft, AppWindow, MousePointer2, Settings2, Download, AlertTriangle, Zap } from 'lucide-react';

interface PDFForgeGuideModalProps {
  open: boolean;
  onClose: () => void;
}

export function PDFForgeGuideModal({ open, onClose }: PDFForgeGuideModalProps) {
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
              <h2 className="text-xl font-bold text-surface-50">PDFForge Guide</h2>
              <p className="text-sm text-surface-400">Everything you need to know about your local PDF workbench.</p>
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
              1. What is PDFForge?
            </h3>
            <div className="space-y-2 text-sm leading-relaxed">
              <p>
                PDFForge is a local browser-based PDF workbench designed for editing, cleaning, organizing, and exporting PDF files without using shady upload websites.
              </p>
              <p>
                Everything happens locally in your browser. No files leave your device, ensuring complete privacy.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section>
            <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-surface-100">
              <LayoutPanelLeft className="h-5 w-5 text-primary-400" />
              2. Left Sidebar
            </h3>
            <ul className="list-inside list-disc space-y-2 text-sm leading-relaxed">
              <li><strong>Upload PDF or DOCX:</strong> Add documents to your project.</li>
              <li><strong>DOCX Conversion:</strong> Works best for simple Word documents.</li>
              <li><strong>Files List:</strong> Manage uploaded documents.</li>
              <li><strong>Flatten form fields:</strong> Convert fillable fields to permanent text.</li>
              <li><strong>Include OCR text layer:</strong> Embeds searchable text after scanning.</li>
              <li><strong>Normal Export:</strong> Fastest standard PDF generation.</li>
              <li><strong>Secure Rasterized Export:</strong> Complete visual flattening for true security.</li>
              <li><strong>Metadata Cleanup:</strong> Automatic scrubbing of sensitive author/title properties.</li>
              <li><strong>Undo / Redo / Clear Project:</strong> Workspace management controls.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section>
            <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-surface-100">
              <MousePointer2 className="h-5 w-5 text-primary-400" />
              3. Center Workspace
            </h3>
            <div className="space-y-2 text-sm leading-relaxed">
              <p><strong>Thumbnail Gallery:</strong> Shows all pages. Drag and drop to reorder. Click the eye icon to exclude a page from export.</p>
              <p><strong>Page Preview:</strong> Select any page to view it large. Use zoom controls to inspect details or precisely place edits.</p>
            </div>
          </section>

          {/* Section 4 */}
          <section>
            <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-surface-100">
              <Settings2 className="h-5 w-5 text-primary-400" />
              4. Smart Inspector
            </h3>
            <ul className="list-inside list-disc space-y-2 text-sm leading-relaxed">
              <li><strong>Page Info:</strong> Source, size, and status details.</li>
              <li><strong>Rotation:</strong> Spin pages 90 degrees.</li>
              <li><strong>Redaction:</strong> Draw black boxes over sensitive content.</li>
              <li><strong>Crop:</strong> Define a specific area to keep.</li>
              <li><strong>Text Stamp:</strong> Add custom text to the page.</li>
              <li><strong>OCR (Optical Character Recognition):</strong> Detect text on scanned pages to make them searchable.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section>
            <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-surface-100">
              <Download className="h-5 w-5 text-primary-400" />
              5. Export Modes
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-surface-700 bg-surface-800 p-4">
                <h4 className="mb-2 font-semibold text-surface-200">Normal Export</h4>
                <ul className="list-inside list-disc text-sm space-y-1">
                  <li>Best for normal PDF editing</li>
                  <li>Keeps PDF structure where possible</li>
                  <li>Applies crop, rotation, stamps, redaction boxes and OCR layer</li>
                </ul>
              </div>
              <div className="rounded-lg border border-primary-500/30 bg-primary-500/10 p-4">
                <h4 className="mb-2 font-semibold text-primary-400">Secure Rasterized Export</h4>
                <ul className="list-inside list-disc text-sm space-y-1">
                  <li>Best for sensitive documents</li>
                  <li>Flattens each page into an image</li>
                  <li>Prevents covered content from remaining hidden under redaction boxes</li>
                  <li>Recommended when redacting sensitive information</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 6 */}
          <section>
            <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-surface-100">
              <AlertTriangle className="h-5 w-5 text-warning-500" />
              6. Important Limitations
            </h3>
            <div className="rounded-lg border border-warning-500/20 bg-warning-500/10 p-4 text-sm leading-relaxed text-warning-200">
              <ul className="list-inside list-disc space-y-2">
                <li>Normal redaction visually covers content, but original PDF content may technically still exist.</li>
                <li>Use Secure Rasterized Export for sensitive files.</li>
                <li>OCR may contain mistakes.</li>
                <li>DOCX conversion works best for simple documents. Complex Word headers, footers, tables and page breaks may not look exactly like Microsoft Word.</li>
                <li>Very large PDFs may be slower due to browser memory limits.</li>
              </ul>
            </div>
          </section>

          {/* Section 7 */}
          <section>
            <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-surface-100">
              <Zap className="h-5 w-5 text-primary-400" />
              7. Quick Start
            </h3>
            <ol className="list-inside list-decimal space-y-2 text-sm font-medium text-surface-200">
              <li>Upload PDF or DOCX</li>
              <li>Select pages</li>
              <li>Reorder or exclude pages</li>
              <li>Use tools in Smart Inspector</li>
              <li>Export using Normal or Secure Rasterized Export</li>
            </ol>
          </section>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-surface-800 bg-surface-950 p-4 rounded-b-xl">
          <button
            onClick={onClose}
            className="rounded-lg bg-primary-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-500"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
