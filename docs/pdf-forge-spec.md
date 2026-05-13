# PDFForge — Project Specification

> **"Build, clean and secure PDF files directly in the browser."**

---

## What is PDFForge?

PDFForge is a private, browser-based PDF workbench that allows users to merge, reorder, clean, edit, redact, OCR-scan, crop, rotate, fill forms, convert DOCX files, and export PDF files locally in the browser without uploading documents to any external server.

## Why does PDFForge exist?

Most PDF tools require uploading sensitive documents to third-party servers. PDFForge exists to provide a fully client-side alternative — no files leave the user's machine, no external APIs are called for PDF processing, and no data is transmitted over the network.

---

## Privacy Model

- **All PDF processing happens locally in the browser.** No files are uploaded to any server.
- No external API is called for PDF manipulation, OCR, or export.
- The only network requests are for loading the application itself (HTML, JS, CSS) and the pdfjs-dist worker script.
- Metadata is scrubbed from exported PDFs to prevent leaking original filenames, author information, or creation dates.
- For maximum privacy, users should use Secure Rasterized Export, which flattens pages into images and removes all original PDF objects.

---

## Technical Stack

| Layer | Library | Purpose |
|---|---|---|
| Frontend framework | React 18 + TypeScript | UI components and application logic |
| Bundler | Vite | Development server and production builds |
| Styling | Tailwind CSS 4 | Utility-first CSS framework |
| Icons | lucide-react | Icon library |
| PDF manipulation | pdf-lib | Create, modify, copy PDF pages, draw text/shapes, manage forms |
| PDF rendering | pdfjs-dist | Render PDF pages to canvas for preview and OCR input |
| DOCX conversion | mammoth + html2canvas | Convert DOCX to HTML, then capture to canvas for PDF conversion |
| OCR | tesseract.js | Client-side optical character recognition |
| State management | Zustand | Lightweight reactive state management |
| Drag and drop | @hello-pangea/dnd | Page reordering via drag-and-drop |
| File upload | react-dropzone | File upload via drag-and-drop or file picker |
| Download | Blob URL (native) | Trigger browser download of exported PDFs |

---

## Features

### 1. Multi-File PDF & DOCX Upload
Upload multiple PDF or DOCX files via drag-and-drop or file picker. PDFs are loaded directly. DOCX files are converted locally in the browser to PDFs before being added to the sequence. Pages from all files are added to a global sequence.

### 2. Page Gallery
All pages from all uploaded PDFs are displayed as thumbnail cards in a horizontal gallery. Each card shows the thumbnail, source filename, page number, sequence position, and edit indicators.

### 3. Drag-and-Drop Reordering
Pages can be freely reordered via drag-and-drop using @hello-pangea/dnd. All page-specific edits (stamps, redactions, crops, OCR data) stay attached to the correct page.

### 4. Page Exclusion
Each page can be toggled between included and excluded. Excluded pages remain visible in the gallery (dimmed) but are not included in exports.

### 5. Page Preview
Clicking a page shows it in a large preview area with zoom controls (in, out, fit-to-width). The preview supports tool overlays for redaction, crop, and stamp placement.

### 6. Rotation
Individual pages can be rotated in 90° increments (0°, 90°, 180°, 270°). Rotation is stored per page and applied during export.

### 7. Text Stamps
Users can add text stamps to pages. The stamp tool includes controls for text, font size, color, and opacity. Clicking on the preview places the stamp at that position. Coordinate conversion maps browser pixels to PDF points correctly.

### 8. Redaction
Users can draw black redaction rectangles over sensitive content. Redactions are rendered as solid black rectangles in the preview and applied during export.

**Important:** Normal redaction by drawing black boxes is visual redaction only. The underlying original PDF content may still technically exist in the file. For truly sensitive documents, use Secure Rasterized Export.

### 9. Crop
Users can draw a crop rectangle on a page. During normal export, the crop is applied via setCropBox/setMediaBox. During rasterized export, only the cropped area is rendered.

### 10. OCR (Optical Character Recognition)
Tesseract.js is used to run OCR on page images. Users can scan individual pages or all included pages. Detected text items are stored with PDF-point bounding boxes and can be added as an invisible text layer during export for searchability.

Supported languages: English, Swedish, French, German, Spanish, and combinations.

**Warning:** OCR is automatic and may contain mistakes. Always review important documents.

### 11. AcroForm Detection and Editing
On upload, PDFs are scanned for existing AcroForm fields. Detected fields (text, checkbox, radio, dropdown, option list) are shown in the Smart Inspector. Users can edit values, which are applied during export. Forms can optionally be flattened into permanent page content.

### 12. Metadata Cleaning
During export, common metadata fields are scrubbed: Title, Author, Subject, Keywords, Creator, Producer, Creation Date, Modification Date. The exported PDF will not leak the original filename as metadata.

### 13. Undo/Redo
A snapshot-based history stack supports undo/redo for page-level edits including redactions, stamps, crops, rotation, exclusion, and reordering. Maximum 50 history entries.

### 14. Project Reset
Clear All removes all files, pages, and edits with a confirmation dialog. Individual files can be removed, which also removes all their pages from the sequence.

### 15. Premium Landing Experience
When no files are loaded, the workbench is replaced by a high-end, glassmorphism-themed landing page. This page introduces the product's privacy-first value proposition, explains key features, and provides a prominent primary upload area to quickly enter the workbench.

### 16. In-App Help System (PDFForge Guide)
A comprehensive, interactive guide modal is accessible at any time via the "?" button. It explains the workbench layout (Left Sidebar, Workspace, Smart Inspector), detailing all major features, export modes, and technical limitations (e.g., DOCX conversion nuances).

### 17. Contextual Info Tooltips
Every major button, input, and feature in the workbench includes an accessible info tooltip. These tooltips provide immediate, contextual guidance on how to use specific tools (e.g., "Secure Rasterized Export" vs "Normal Export") and explain terminology for new users.

---

## Export Pipeline

### Normal PDF Export

1. Create a new PDFDocument using pdf-lib
2. Loop through all pages in the current display order
3. Skip excluded pages
4. Load the source PDF document
5. Apply form field values to the source document
6. Copy the page into the new document
7. Apply rotation (setRotation)
8. Apply crop (setCropBox/setMediaBox)
9. Draw text stamps (drawText with Helvetica font)
10. Draw redaction rectangles (drawRectangle, solid black)
11. Draw OCR invisible text layer (drawText with 1% opacity) if enabled
12. Scrub metadata
13. Save and trigger browser download

### Secure Rasterized Export

1. Loop through all included pages in current display order
2. For each page, render it to a high-resolution canvas (200 DPI) using pdfjs-dist
3. Apply visual edits to the canvas: crop, rotation, stamps, redaction rectangles
4. Convert the canvas to JPEG image
5. Embed the image as a new page in a fresh PDFDocument
6. Optionally add OCR invisible text layer on top
7. Scrub metadata
8. Save and trigger browser download

### Difference Between Normal and Secure Rasterized Export

| Aspect | Normal Export | Secure Rasterized Export |
|---|---|---|
| File size | Smaller, original quality | Larger (images) |
| Text selectability | Original text preserved | Only if OCR layer added |
| Redaction security | Visual only (content may exist underneath) | Complete (original content destroyed) |
| Recommended for | General editing, merging, reordering | Sensitive documents requiring true redaction |

---

## Security Notes

- Normal redaction is visual redaction only. Black rectangles are drawn over content, but the underlying PDF objects are not removed. A determined adversary could extract the original content.
- Secure Rasterized Export converts each page to a flat image, destroying all original PDF objects. This is the only way to guarantee redacted content is truly removed.
- Metadata scrubbing removes common fields but does not guarantee removal of every possible hidden PDF object (e.g., embedded files, JavaScript, custom metadata).
- For maximum security, always use Secure Rasterized Export for sensitive documents.

---

## Known Browser Limitations

### Very Large PDFs
- PDFs with more than 200 pages or larger than 100 MB may cause browser memory issues.
- The application shows warnings for very large files.
- Browser tabs may become unresponsive during heavy operations on very large documents.

### DOCX Conversion
- DOCX conversion is done entirely client-side using `mammoth` and `html2canvas`.
- This approach works best for simple documents. Complex layouts, headers, footers, tables, and page breaks from Microsoft Word may not render perfectly.
- Resulting pages are generated as A4-sized images inside the PDF.

### Password-Protected PDFs
- pdf-lib cannot open password-protected (encrypted) PDFs. An error message is shown.

### Complex Form Fields
- Some exotic or custom PDF form field types may not be detected or editable.
- The application handles common field types: text, checkbox, radio, dropdown, option list.

### OCR Accuracy
- OCR accuracy depends on scan quality, font clarity, and language.
- Complex layouts, handwriting, and unusual fonts may produce poor results.
- The invisible text layer positioning may not align perfectly with original text.

### Font Limitations
- Text stamps use pdf-lib's built-in Helvetica font. Custom fonts are not supported.
- OCR invisible text also uses Helvetica, which may cause minor alignment differences.

### Secure Rasterized Export File Size
- Because pages are converted to images, the output file is typically larger than normal export.
- JPEG quality is set to 92% for a balance of quality and size.

---

## Testing Checklist

See `/docs/manual-test-checklist.md` for step-by-step manual testing instructions covering all 15 test scenarios.
