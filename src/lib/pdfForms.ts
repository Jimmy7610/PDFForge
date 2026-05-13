/* ───────────────────────────────────────────────────────────────
   PDFForge – AcroForm detection & editing (pdf-lib)
   ─────────────────────────────────────────────────────────────── */

import { PDFDocument, PDFTextField, PDFCheckBox, PDFRadioGroup, PDFDropdown, PDFOptionList } from 'pdf-lib';
import type { FormFieldState } from '../types/pdfForgeTypes';

/**
 * Detect AcroForm fields from a pdf-lib PDFDocument.
 */
export function detectFormFields(pdfDoc: PDFDocument): FormFieldState[] {
  const fields: FormFieldState[] = [];
  try {
    const form = pdfDoc.getForm();
    const rawFields = form.getFields();

    for (const field of rawFields) {
      const name = field.getName();

      if (field instanceof PDFTextField) {
        fields.push({ name, type: 'text', value: field.getText() ?? '' });
      } else if (field instanceof PDFCheckBox) {
        fields.push({ name, type: 'checkbox', value: field.isChecked() });
      } else if (field instanceof PDFRadioGroup) {
        const options = field.getOptions();
        const selected = field.getSelected();
        fields.push({ name, type: 'radio', value: selected ?? '', options });
      } else if (field instanceof PDFDropdown) {
        const options = field.getOptions();
        const selected = field.getSelected();
        fields.push({
          name,
          type: 'dropdown',
          value: selected.length > 0 ? selected[0] : '',
          options,
        });
      } else if (field instanceof PDFOptionList) {
        const options = field.getOptions();
        const selected = field.getSelected();
        fields.push({
          name,
          type: 'optionList',
          value: selected.length > 0 ? selected[0] : '',
          options,
        });
      }
    }
  } catch {
    // PDF has no form or form is malformed — return empty
  }
  return fields;
}

/**
 * Apply form field values from state to a pdf-lib PDFDocument.
 */
export function applyFormFields(
  pdfDoc: PDFDocument,
  fieldStates: FormFieldState[],
  flatten: boolean,
): void {
  try {
    const form = pdfDoc.getForm();

    for (const fs of fieldStates) {
      try {
        const field = form.getField(fs.name);

        if (field instanceof PDFTextField && typeof fs.value === 'string') {
          field.setText(fs.value);
        } else if (field instanceof PDFCheckBox && typeof fs.value === 'boolean') {
          if (fs.value) field.check();
          else field.uncheck();
        } else if (field instanceof PDFRadioGroup && typeof fs.value === 'string') {
          if (fs.value) field.select(fs.value);
        } else if (field instanceof PDFDropdown && typeof fs.value === 'string') {
          if (fs.value) field.select(fs.value);
        } else if (field instanceof PDFOptionList && typeof fs.value === 'string') {
          if (fs.value) field.select(fs.value);
        }
      } catch {
        console.warn(`Could not apply form field: ${fs.name}`);
      }
    }

    if (flatten) {
      form.flatten();
    }
  } catch {
    // No form to apply
  }
}
