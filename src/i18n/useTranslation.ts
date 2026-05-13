/* ───────────────────────────────────────────────────────────────
   PDFForge – useTranslation hook
   ─────────────────────────────────────────────────────────────── */

import { useLanguageStore } from './languageStore';
import { translations } from './translations';

export function useTranslation() {
  const { language, setLanguage } = useLanguageStore();

  const t = (path: string, params?: Record<string, string | number>) => {
    const keys = path.split('.');
    let current: any = translations[language];

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        // Fallback to English if key missing in Swedish
        let fallback: any = translations['en'];
        for (const fKey of keys) {
          if (fallback && typeof fallback === 'object' && fKey in fallback) {
            fallback = fallback[fKey];
          } else {
            return path; // Return key if not found at all
          }
        }
        current = fallback;
        break;
      }
    }

    if (typeof current !== 'string') return path;

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        current = current.replace(`{${key}}`, String(value));
      });
    }

    return current;
  };

  return { t, language, setLanguage };
}
