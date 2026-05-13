import { UploadDropzone } from '../pdf/UploadDropzone';
import { 
  Layers, ShieldAlert, FileImage, ScanSearch, FileText, 
  CheckSquare, Crop, Trash2, Shield, Info, ArrowRight, User
} from 'lucide-react';
import { useTranslation } from '../../i18n/useTranslation';
import { LanguageSwitcher } from '../ui/LanguageSwitcher';

interface LandingPageProps {
  onOpenGuide: () => void;
}

export function LandingPage({ onOpenGuide }: LandingPageProps) {
  const { t } = useTranslation();

  const features = [
    { title: t('inspector.redact.title'), desc: t('landing.features.redact.desc'), icon: ShieldAlert },
    { title: t('sidebar.rasterizedExport'), desc: t('guide.export.raster'), icon: FileImage },
    { title: t('inspector.ocr.title'), desc: t('landing.features.ocr.desc'), icon: ScanSearch },
    { title: 'DOCX', desc: t('landing.features.docx.desc'), icon: FileText },
    { title: t('sidebar.options'), desc: t('landing.features.private.desc'), icon: CheckSquare },
    { title: t('inspector.crop.title'), desc: t('inspector.crop.desc'), icon: Crop },
    { title: 'Metadata', desc: t('sidebar.metadataNote'), icon: Trash2 },
    { title: t('landing.features.private.title'), desc: t('landing.features.private.desc'), icon: Shield },
  ];

  return (
    <div className="relative min-h-screen w-full bg-[#0a0a0a] overflow-x-hidden overflow-y-auto text-surface-50 selection:bg-primary-500/30 scroll-smooth">
      {/* Refined ambient light */}
      <div className="absolute top-[-10%] left-[-10%] h-[600px] w-[600px] rounded-full bg-primary-600/[0.02] blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[600px] w-[600px] rounded-full bg-blue-600/[0.02] blur-[140px] pointer-events-none" />

      <div className="flex min-h-screen flex-col p-6 sm:p-8 lg:p-12 max-w-7xl mx-auto">
        {/* Top Navigation */}
        <header className="flex flex-col sm:flex-row items-center justify-between shrink-0 gap-6 mb-10 lg:mb-16">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-surface-900 border border-surface-800 shadow-2xl">
              <Shield className="h-6 w-6 text-primary-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">PDFForge</h1>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-surface-500">{t('common.credits')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <LanguageSwitcher />
            <button 
              onClick={onOpenGuide}
              className="group flex flex-1 sm:flex-initial items-center gap-2.5 rounded-xl border border-surface-800 bg-surface-900/40 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-surface-400 transition-all hover:bg-surface-800 hover:text-white hover:border-surface-700 justify-center"
            >
              <Info className="h-4 w-4 transition-transform group-hover:rotate-12" />
              {t('landing.howItWorks')}
            </button>
          </div>
        </header>

        {/* Workspace Layout */}
        <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
          
          {/* Left Column: Content & Identity */}
          <div className="col-span-1 lg:col-span-6 flex flex-col justify-center gap-10">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary-500/5 border border-primary-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary-400">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
                </span>
                {t('landing.tagline')}
              </div>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight text-white">
                {t('landing.heroTitle').split('.')[0]}.<br />
                <span className="text-surface-500">{t('landing.heroTitle').split('.')[1] || ''}</span>
              </h2>
              <p className="text-base sm:text-lg text-surface-400 leading-relaxed max-w-xl">
                {t('landing.heroSubtitle')}
              </p>
              <div className="flex items-center gap-3 text-xs font-medium text-surface-500 italic">
                <User className="h-3.5 w-3.5" />
                {t('common.builtBy')}
              </div>
            </div>

            {/* Privacy Guardian Block */}
            <div className="rounded-3xl border border-surface-800/50 bg-surface-900/20 p-6 sm:p-8 backdrop-blur-md relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-[0.02] transition-transform duration-700 group-hover:scale-110">
                <Shield className="h-40 w-40" />
              </div>
              <div className="relative z-10 space-y-6">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary-500">{t('guide.sections.limitations.title')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-surface-200">{t('landing.features.private.title')}</h4>
                    <p className="text-xs text-surface-500 leading-relaxed">{t('landing.features.private.desc')}</p>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-surface-200">{t('sidebar.rasterizedExport')}</h4>
                    <p className="text-xs text-surface-500 leading-relaxed">{t('guide.sections.export.raster.title')}</p>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-surface-200">{t('sidebar.metadataNote')}</h4>
                    <p className="text-xs text-surface-500 leading-relaxed">{t('sidebar.metadataNote')}</p>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-surface-200">{t('landing.features.docx.title')}</h4>
                    <p className="text-xs text-surface-500 leading-relaxed">{t('landing.features.docx.desc')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Micro Workflow */}
            <div className="flex flex-wrap items-center gap-6 sm:gap-10">
              {[
                { s: '01', t: t('landing.steps.step1') },
                { s: '02', t: t('landing.steps.step2') },
                { s: '03', t: t('landing.steps.step3') },
                { s: '04', t: t('common.done') },
              ].map((item, i) => (
                <div key={item.s} className="flex items-center gap-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-surface-700 uppercase tracking-widest leading-none mb-1">{item.s}</span>
                    <span className="text-xs font-bold text-surface-400">{item.t}</span>
                  </div>
                  {i < 3 && <ArrowRight className="h-3 w-3 text-surface-800 hidden sm:block" />}
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Interaction & Features */}
          <div className="col-span-1 lg:col-span-6 flex flex-col gap-12 lg:gap-16">
            {/* Refined Upload Panel */}
            <div className="flex flex-col items-center justify-center">
              <div className="w-full max-w-lg rounded-3xl border border-surface-800/50 bg-surface-900/30 p-2 shadow-2xl backdrop-blur-xl group">
                 <div className="h-full w-full rounded-2xl border-2 border-dashed border-surface-800 bg-surface-950/40 transition-all group-hover:border-primary-500/30 group-hover:bg-surface-900/40">
                    <UploadDropzone />
                 </div>
              </div>
              <p className="mt-4 text-[10px] text-surface-600 font-medium uppercase tracking-[0.1em]">{t('upload.docxWarning')}</p>
            </div>

            {/* Feature Mosaic */}
            <div className="w-full">
              <div className="flex items-center gap-4 mb-6">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-surface-600">{t('sidebar.options')}</h3>
                <div className="h-px flex-1 bg-surface-800/50" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {features.map((f) => {
                  const Icon = f.icon;
                  return (
                    <div key={f.title} className="group flex flex-row lg:flex-col gap-4 rounded-2xl border border-surface-800/60 bg-surface-900/30 p-4 transition-all hover:border-surface-600 hover:bg-surface-800/50">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-800 text-surface-400 group-hover:bg-primary-500 group-hover:text-white transition-colors">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-[11px] font-bold text-surface-200">{f.title}</h4>
                        <p className="text-[10px] text-surface-500 leading-tight group-hover:text-surface-400 transition-colors">{f.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </main>

        {/* Refined Footer Meta */}
        <footer className="mt-12 lg:mt-20 pt-8 border-t border-surface-900 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-6 text-[9px] font-bold uppercase tracking-[0.2em] text-surface-600 pb-8">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <span className="text-surface-400 text-center">PDFForge v1.0.4 Premium</span>
            <span className="h-3 w-px bg-surface-800 hidden sm:block" />
            <span className="hover:text-surface-400 transition-colors cursor-default text-center">{t('common.builtBy')}</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
            <span className="hover:text-surface-400 transition-colors cursor-default">Client-Side Engine</span>
            <span className="hover:text-surface-400 transition-colors cursor-default">AES-256 Metadata Scrub</span>
            <span className="hover:text-surface-400 transition-colors cursor-default">Tesseract.js OCR</span>
          </div>
        </footer>
      </div>
    </div>
  );
}


