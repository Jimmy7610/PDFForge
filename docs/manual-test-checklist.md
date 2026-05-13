# PDFForge — Manual Test Checklist

Use this checklist to verify all features work correctly.

---

## 1. Landing Page & Primary Upload
1. Open the application
2. **Expected:** Premium landing page with glassmorphism effects appears (since no files are loaded).
3. Click "Start Forging" or "Upload PDF or DOCX" in the center area.
4. Select a PDF file.
5. **Expected:** Landing page disappears, workbench shell appears. File appears in the file list with page count. Page thumbnails appear in the gallery.

## 2. Upload Multiple PDFs

1. Click "Upload PDFs" and select multiple PDF files, or drag multiple files at once
2. **Expected:** All files appear in the file list. Pages from all files appear in the gallery in upload order.

## 3. Reorder Pages

1. Upload at least 2 PDF files with multiple pages
2. Grab a page thumbnail by the drag handle (left side grip icon)
3. Drag it to a different position in the gallery
4. **Expected:** Page sequence updates. Sequence numbers update. The reordered sequence is reflected in export.

## 4. Exclude Pages

1. Click the eye icon on a page thumbnail
2. **Expected:** Page becomes visually dimmed. Status in the inspector shows "Excluded".
3. Export the PDF
4. **Expected:** Excluded pages are not in the exported file.
5. Click the eye icon again to re-include
6. **Expected:** Page returns to normal appearance.

## 5. Rotate a Page

1. Select a page by clicking its thumbnail
2. Click the rotation buttons (↻ or ↺) in the inspector or on the thumbnail
3. **Expected:** Thumbnail and preview show the page rotated. Rotation is applied in export.

## 6. Add Text Stamp

1. Select a page
2. In the Smart Inspector, find the "Text Stamp" section
3. Enter text (e.g., "CONFIDENTIAL"), set font size, color, opacity
4. Click the "Stamp" button to enter placement mode
5. Click on the preview where you want the stamp
6. **Expected:** Stamp text appears on the preview at the clicked position. Stamp appears in the stamp list. Stamp is rendered in the exported PDF.

## 7. Add & Edit Redactions

1. Select a page
2. In the Smart Inspector, click "Redact" to enter redaction mode
3. **Expected:** Cursor becomes a high-contrast crosshair with a target ring and "Drag to redact" label.
4. Click and drag on the preview to draw a black rectangle
5. **Expected:** Solid black rectangle with a primary color outline appears live while dragging.
6. Click on a placed redaction
7. **Expected:** Redaction shows a selection outline, resize handles at corners, and a "Redaction selected" label.
8. Drag the body of a selected redaction
9. **Expected:** Redaction moves smoothly following the mouse.
10. Drag a corner handle of a selected redaction
11. **Expected:** Redaction resizes accordingly.
12. Press **Delete** or **Backspace** while a redaction is selected, or click "Delete selected redaction" in the sidebar.
13. **Expected:** Redaction is removed.
14. Export Normal and Secure Rasterized PDF
15. **Expected:** Redactions are rendered as solid black in their final updated positions.

## 8. Crop Page

1. Select a page
2. In the Smart Inspector, click "Crop" to enter crop mode
3. Click and drag on the preview to define a crop area
4. **Expected:** Dashed crop boundary appears. Crop info shows dimensions. Export reflects the crop.
5. Click "Reset Crop"
6. **Expected:** Crop is removed. Full page is exported.

## 9. Run OCR

1. Select a page (preferably a scanned document or image-based PDF)
2. In the Smart Inspector, select an OCR language
3. Click "Scan Page"
4. **Expected:** Progress bar shows OCR progress. After completion, word count is displayed.
5. Click "Scan All" to run OCR on all included pages
6. **Expected:** All pages are processed sequentially.

## 10. Fill Form Fields

1. Upload a PDF that contains AcroForm fields (e.g., a fillable tax form)
2. Select a page from that PDF
3. In the Smart Inspector, find the "Form Fields" section
4. **Expected:** Detected fields are listed with their types.
5. Edit text fields, toggle checkboxes, select dropdown values
6. **Expected:** Values update in the UI. Values are applied in the exported PDF.
7. Upload a PDF without form fields
8. **Expected:** Message says "No editable form fields were detected in this PDF."

## 11. Export Normal PDF

1. Upload one or more PDFs, make some edits (stamps, redactions, rotation)
2. Click "Normal Export" in the left sidebar
3. **Expected:** Progress bar shows export progress. A PDF file downloads. Open the downloaded PDF to verify edits are applied.

## 12. Export Secure Rasterized PDF

1. Upload a PDF and add redactions
2. Click "Secure Rasterized Export"
3. **Expected:** Progress bar shows rasterization progress. A PDF file downloads.
4. Open the downloaded PDF
5. **Expected:** Pages are flat images. Text is not selectable (unless OCR layer was included). Redacted areas are permanently black.

## 13. Clear Project

1. Upload some files and make edits
2. Click "Clear Project" at the bottom of the left sidebar
3. **Expected:** Confirmation dialog appears.
4. Click "Clear Everything"
5. **Expected:** All files, pages, and edits are removed. The app returns to its empty state.

## 14. Test DOCX Conversion

1. Try to upload a .docx file
2. **Expected:** UI shows progress feedback (Reading DOCX file, Rendering document, etc.). The file is converted and appears in the file list as `[filename]-converted.pdf`. Pages appear in the gallery.
3. Test that you can select, preview, stamp, and redact the converted DOCX pages just like a normal PDF.

## 15. Test Invalid File

1. Try to upload a non-PDF/non-DOCX file (e.g., a .jpg or .txt file)
2. **Expected:** Error message: "filename is not a supported file type (PDF or DOCX)."
3. Try to upload a password-protected PDF
4. **Expected:** Error message about the file being password-protected.

## 16. Test Large File Warning

1. Upload a very large PDF (100+ MB or 200+ pages)
2. **Expected:** A warning message appears about potential performance impact. The app should still attempt to load it.
3. If the browser runs out of memory, the error should be caught and shown to the user rather than crashing silently.

## 17. In-App Guide Modal
1. Click the "?" (Help/Guide) button in the left sidebar header (or on the Landing Page).
2. **Expected:** "PDFForge Guide" modal opens.
3. Navigate through the tabs/sections (Layout, Features, Export).
4. **Expected:** Information is clear and professional. Close the modal by clicking "Got it" or the backdrop.

## 18. Contextual Tooltips
1. Hover over the "Normal Export" button in the left sidebar.
2. **Expected:** A tooltip appears explaining what it does.
3. Hover over the "Secure Rasterized Export" button.
4. **Expected:** A tooltip appears explaining the privacy benefits.
5. Repeat for at least 3 other buttons (e.g., Undo, Redact, Scan Page).
6. **Expected:** Tooltips consistently appear and are positioned correctly.

## 19. Text Stamp Placement UX
1. Enter text in the Stamp panel (e.g., "DRAFT").
2. Click "Place Stamp".
3. **Expected:** Button shows "Done Placing". Helper text shows "Placement Active".
4. Move mouse over the PDF preview.
5. **Expected:** High-contrast target marker follows the cursor. A ghost preview of "DRAFT" follows the cursor.
6. Click to place.
7. **Expected:** Stamp is placed exactly where the target was. Mode remains active for multiple placements.
8. Press **Esc**.
9. **Expected:** Placement mode cancels, cursor returns to normal.

## 20. Stamp WYSIWYG Alignment
1. Activate stamp placement mode.
2. **Expected:** Ghost preview text is centered exactly on the target crosshair.
3. Click to place.
4. **Expected:** No visual jump. The placed stamp appears in the exact same spot as the preview.
5. Export a normal PDF.
6. **Expected:** In the exported PDF, the stamp is centered on the same coordinate as shown on screen.

## 21. Landing Page Empty States
1. Clear everything (Test 13).
2. **Expected:** App returns to the Premium Landing Page, not the empty workbench.

---

## Additional Checks

- [ ] Undo/Redo buttons work for redaction, stamp, crop, rotation, and exclusion changes
- [ ] Removing a file removes all its pages from the gallery
- [ ] Metadata is scrubbed in both export modes (check with a PDF metadata viewer)
- [ ] No console errors during normal operation
- [ ] UI is responsive on laptop-sized screens (1366px+)

---

## 20. Responsive Layout Tests

1. **Landing Page (Desktop 1920x1080):**
   - [ ] No horizontal scrollbars
   - [ ] All 8 capability cards fully visible
   - [ ] Footer visible at the bottom

2. **Landing Page (Laptop 1366x768):**
   - [ ] No horizontal scrollbars
   - [ ] No clipped capability cards (should scroll vertically if needed)
   - [ ] Layout remains elegant and readable

3. **Landing Page (Tablet/Mobile Width):**
   - [ ] Sections stack vertically (Hero above Upload)
   - [ ] Capability cards adapt to 1 or 2 columns
   - [ ] No horizontal overflow

4. **Workbench (Mobile/Tablet Stack):**
   - [ ] Left sidebar is at the top (h-[220px]+)
   - [ ] Center workspace is in the middle (min-h-[300px])
   - [ ] Right inspector is at the bottom (h-[280px]+)
   - [ ] Preview scales down to fit the narrow width without overflow
   - [ ] Gallery thumbnails remain draggable/usable

5. **General Responsiveness:**
   - [ ] Verify that no panel completely breaks the layout at 360px width
   - [ ] Verify that all primary CTAs (Upload, Export, Clear) are reachable on small screens

---

## 21. PDF Preview Scrolling & Viewport

1. **Scroll Capability:**
   - [ ] Upload a tall PDF page.
   - [ ] Zoom in (e.g., 150% or 200%).
   - [ ] **Expected:** Center preview area shows vertical and horizontal scrollbars.
   - [ ] **Expected:** You can scroll to the very bottom and very edges of the page.

2. **Tool Alignment After Scroll:**
   - [ ] Scroll down to the bottom of a zoomed-in page.
   - [ ] Place a text stamp or draw a redaction.
   - [ ] **Expected:** Overlay tools align perfectly with the cursor.
   - [ ] **Expected:** Exported PDF shows the edits in the correct locations.

3. **Centering:**
   - [ ] Zoom out until the page is smaller than the viewport.
   - [ ] **Expected:** Page remains centered in the preview area.
