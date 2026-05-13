# PDFForge

PDFForge is a browser-based PDF workbench where users can upload PDF and DOCX files, edit/reorder/clean/OCR/redact/crop/stamp them and export as normal PDF or secure rasterized PDF.

## Live Demo
[https://jimmy7610.github.io/PDFForge/](https://jimmy7610.github.io/PDFForge/)

## Key Features
- **File Support**: Upload PDF and DOCX files locally (privacy-first).
- **Page Management**: Reorder, exclude, and rotate pages with a drag-and-drop gallery.
- **Editing Tools**:
  - **Redact**: Draw visual redaction boxes over sensitive content.
  - **Crop**: Define custom page boundaries.
  - **Text Stamp**: Place custom text stamps with high-precision WYSIWYG placement.
- **OCR**: Scan pages for text locally using Tesseract.js.
- **Secure Export**: Export as a standard PDF or a "Secure Rasterized" PDF where all pages are flattened into images to permanently bake in redactions.

## Tech Stack
- **React 19** + **TypeScript**
- **Vite** (Build Tool)
- **Tailwind CSS 4** (Styling)
- **pdf-lib** & **pdf.js** (PDF processing)
- **Zustand** (State management)
- **Tesseract.js** (OCR)

## Development

### Install
```bash
npm install
```

### Run dev server
```bash
npm run dev
```

### Build for production
```bash
npm run build
```

## Deployment
PDFForge is automatically deployed to GitHub Pages via GitHub Actions on every push to the `main` branch. See [docs/deployment.md](./docs/deployment.md) for more details.

## License
MIT
