import { useEffect, useState } from 'react';
import { AnimatePresence, motion, MotionConfig } from 'framer-motion';
import type { TaxInputs } from './lib/taxEngine';
import { ModeProvider, useMode } from './context/ModeContext';
import { AppShell, type ShellView } from './components/AppShell';
import { ChatPanel } from './components/ChatPanel';
import { IncomeForm } from './components/IncomeForm';
import { TaxCalculator } from './components/TaxCalculator';
import { SavingsOptimizer } from './components/SavingsOptimizer';
import { Form16Upload } from './components/Form16Upload';
import { TaxSavingsOptimizerPage } from './pages/TaxSavingsOptimizerPage';
import { DashboardSkeleton } from './components/ui/DashboardSkeleton';

const defaultInputs: TaxInputs = {
  grossSalary: 18_00_000,
  hraReceived: 2_40_000,
  rentPaid: 3_00_000,
  investment80C: 1_00_000,
  metro: true,
  deduction80D: 18_000,
  deduction80CCD1B: 10_000,
  deduction24b: 95_000,
  deduction80E: 45_000,
};

const pageTransition = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] as const },
};

function Shell() {
  const { isGenZ } = useMode();
  const [inputs, setInputs] = useState<TaxInputs>(defaultInputs);
  const [view, setView] = useState<ShellView>('dashboard');
  const [dashboardReady, setDashboardReady] = useState(false);

  useEffect(() => {
    if (view !== 'dashboard') {
      setDashboardReady(false);
      return;
    }
    setDashboardReady(false);
    const t = window.setTimeout(() => setDashboardReady(true), 240);
    return () => window.clearTimeout(t);
  }, [view]);

  const patch = (p: Partial<TaxInputs>) => setInputs((prev) => ({ ...prev, ...p }));

  const titleClass = isGenZ
    ? 'font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl'
    : 'text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl';

  const subClass = isGenZ ? 'mt-1 max-w-2xl text-sm text-violet-900/85' : 'mt-1 max-w-2xl text-sm text-slate-600';

  const footerClass = isGenZ
    ? 'rounded-2xl border border-white/40 bg-white/60 px-5 py-4 text-center text-sm text-violet-900/85 shadow-lg shadow-fuchsia-500/5 backdrop-blur-md'
    : 'rounded-2xl border border-white/40 bg-white/60 px-5 py-4 text-center text-sm text-slate-600 shadow-md backdrop-blur-md';

  return (
    <MotionConfig reducedMotion="user">
      <AppShell view={view} onViewChange={setView}>
        <AnimatePresence mode="wait">
          <motion.div key={view} {...pageTransition}>
            {view === 'dashboard' ? (
              <>
                <header className="mb-8 border-b border-slate-200/50 pb-6">
                  <p
                    className={
                      isGenZ
                        ? 'text-xs font-bold uppercase tracking-[0.18em] text-violet-600'
                        : 'text-xs font-semibold uppercase tracking-widest text-indigo-600'
                    }
                  >
                    {isGenZ ? '✨ India · Income tax companion' : 'India · Income tax companion'}
                  </p>
                  <h1 className={`${titleClass} mt-2`}>{isGenZ ? 'Your workspace' : 'Dashboard'}</h1>
                  <p className={subClass}>
                    {isGenZ
                      ? 'Form 16 OCR upload, chat, income inputs, regime compare — sab ek jagah.'
                      : 'Upload documents, ask questions, and review regime comparison with deduction utilization.'}
                  </p>
                </header>

                {!dashboardReady ? (
                  <DashboardSkeleton />
                ) : (
                  <div className="grid gap-8 lg:grid-cols-2">
                    <div className="flex flex-col gap-8">
                      <Form16Upload onApplyToForm={patch} />
                      <ChatPanel />
                      <IncomeForm inputs={inputs} onChange={patch} />
                    </div>
                    <div className="flex flex-col gap-8">
                      <TaxCalculator inputs={inputs} />
                      <SavingsOptimizer inputs={inputs} />
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <header className="mb-8 border-b border-slate-200/50 pb-6">
                  <p
                    className={
                      isGenZ
                        ? 'text-xs font-bold uppercase tracking-[0.18em] text-violet-600'
                        : 'text-xs font-semibold uppercase tracking-widest text-indigo-600'
                    }
                  >
                    {isGenZ ? '🎯 Deductions · Old regime' : 'Deductions · Old regime'}
                  </p>
                  <h1 className={`${titleClass} mt-2`}>{isGenZ ? 'Tax savings optimizer' : 'Tax savings optimizer'}</h1>
                  <p className={subClass}>
                    {isGenZ
                      ? 'Sections 80C, 80D, 80CCD, 24(b), 80E — usage bars + AI step cards.'
                      : 'Model Section 80C, 80D, 80CCD(1B), 24(b), and 80E with illustrative caps and savings estimates.'}
                  </p>
                </header>
                <TaxSavingsOptimizerPage inputs={inputs} onChange={patch} />
              </>
            )}
          </motion.div>
        </AnimatePresence>

        <motion.footer className={`${footerClass} mt-12`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.12 }}>
          {isGenZ
            ? 'Disclaimer: Ye app fun + education ke liye hai — ITR file karte waqt CA / official guidance follow karo.'
            : 'Disclaimer: Illustrative estimates only. Consult a qualified professional for filing decisions and compliance.'}
        </motion.footer>
      </AppShell>
    </MotionConfig>
  );
}

export default function App() {
  return (
    <ModeProvider>
      <Shell />
    </ModeProvider>
  );
}
