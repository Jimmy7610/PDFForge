/* ───────────────────────────────────────────────────────────────
   PDFForge – AppShell (three-pane layout)
   ─────────────────────────────────────────────────────────────── */

import { useState } from 'react';
import { LeftSidebar } from './LeftSidebar';
import { CenterWorkspace } from './CenterWorkspace';
import { RightInspector } from './RightInspector';
import { usePdfForgeStore } from '../../store/pdfForgeStore';
import { LandingPage } from '../landing/LandingPage';
import { PDFForgeGuideModal } from '../help/PDFForgeGuideModal';

export function AppShell() {
  const files = usePdfForgeStore((s) => s.files);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  return (
    <>
      {files.length === 0 ? (
        <LandingPage onOpenGuide={() => setIsGuideOpen(true)} />
      ) : (
        <div className="flex flex-col lg:flex-row h-screen w-screen overflow-hidden bg-surface-950">
          {/* Left Sidebar - Stacked on mobile, fixed width on desktop */}
          <aside className="flex w-full lg:w-72 shrink-0 flex-col border-b lg:border-b-0 lg:border-r border-surface-800 bg-surface-900 h-[220px] sm:h-[280px] lg:h-full">
            <LeftSidebar onOpenGuide={() => setIsGuideOpen(true)} />
          </aside>

          {/* Center Workspace - Main area, flexes to fill space */}
          <main className="flex flex-1 flex-col min-h-0 overflow-hidden border-b lg:border-b-0 border-surface-800">
            <CenterWorkspace />
          </main>

          {/* Right Inspector - Stacked on mobile, fixed width on desktop */}
          <aside className="flex w-full lg:w-80 shrink-0 flex-col border-t lg:border-t-0 lg:border-l border-surface-800 bg-surface-900 h-[280px] sm:h-[350px] lg:h-full">
            <RightInspector />
          </aside>
        </div>
      )}

      <PDFForgeGuideModal open={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </>
  );
}


