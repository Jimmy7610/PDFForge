/* ───────────────────────────────────────────────────────────────
   PDFForge – LanguageSwitcher
   ─────────────────────────────────────────────────────────────── */

import { Globe } from 'lucide-react';
import { useTranslation } from '../../i18n/useTranslation';

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useTranslation();

  return (
    <div className="flex items-center gap-1 overflow-hidden rounded-full border border-surface-700 bg-surface-900/50 p-0.5 backdrop-blur-sm shadow-sm transition-all hover:border-surface-600">
      <div className="flex h-6 w-6 items-center justify-center text-surface-400 pl-1.5 pr-0.5">
        <Globe className="h-3.5 w-3.5" />
      </div>
      <div className="flex items-center">
        <button
          onClick={() => setLanguage('en')}
          className={`px-2 py-1 text-[10px] font-bold transition-all ${
            language === 'en'
              ? 'rounded-full bg-primary-600 text-white shadow-md'
              : 'text-surface-400 hover:text-surface-200'
          }`}
          title={t('common.en')}
        >
          EN
        </button>
        <button
          onClick={() => setLanguage('sv')}
          className={`px-2 py-1 text-[10px] font-bold transition-all ${
            language === 'sv'
              ? 'rounded-full bg-primary-600 text-white shadow-md'
              : 'text-surface-400 hover:text-surface-200'
          }`}
          title={t('common.sv')}
        >
          SV
        </button>
      </div>
    </div>
  );
}
