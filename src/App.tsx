import { useState } from 'react';
import type { TaxInputs } from './lib/taxEngine';
import { ModeProvider, useMode } from './context/ModeContext';
import { AppShell, type ShellView } from './components/AppShell';
import { ChatPanel } from './components/ChatPanel';
import { IncomeForm } from './components/IncomeForm';
import { TaxCalculator } from './components/TaxCalculator';
import { SavingsOptimizer } from './components/SavingsOptimizer';
import { Form16Upload } from './components/Form16Upload';
import { TaxSavingsOptimizerPage } from './pages/TaxSavingsOptimizerPage';

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

function Shell() {
  const { isGenZ } = useMode();
  const [inputs, setInputs] = useState<TaxInputs>(defaultInputs);
  const [view, setView] = useState<ShellView>('dashboard');

  const patch = (p: Partial<TaxInputs>) => setInputs((prev) => ({ ...prev, ...p }));

  const titleClass = isGenZ
    ? 'font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl'
    : 'text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl';

  const subClass = isGenZ ? 'mt-1 max-w-2xl text-sm text-violet-800/85' : 'mt-1 max-w-2xl text-sm text-slate-500';

  const footerClass = isGenZ
    ? 'rounded-2xl border border-violet-200/60 bg-white/60 px-5 py-4 text-center text-sm text-violet-900/80 backdrop-blur-sm'
    : 'rounded-xl border border-slate-200/80 bg-white px-5 py-4 text-center text-sm text-slate-500 shadow-sm';

  return (
    <AppShell view={view} onViewChange={setView}>
      <div key={view} className="page-fade-in">
        {view === 'dashboard' ? (
          <>
            <header className="mb-8 border-b border-slate-200/60 pb-6">
              <p className={isGenZ ? 'text-xs font-bold uppercase tracking-[0.18em] text-violet-600' : 'text-xs font-semibold uppercase tracking-widest text-blue-600'}>
                India · Income tax companion
              </p>
              <h1 className={`${titleClass} mt-2`}>{isGenZ ? 'Your workspace' : 'Dashboard'}</h1>
              <p className={subClass}>
                {isGenZ
                  ? 'Form 16 demo upload, chat, income inputs, regime compare — sab ek jagah.'
                  : 'Upload documents, ask questions, and review regime comparison with deduction utilization.'}
              </p>
            </header>

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
          </>
        ) : (
          <>
            <header className="mb-8 border-b border-slate-200/60 pb-6">
              <p className={isGenZ ? 'text-xs font-bold uppercase tracking-[0.18em] text-violet-600' : 'text-xs font-semibold uppercase tracking-widest text-blue-600'}>
                Deductions · Old regime
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
      </div>

      <footer className={`${footerClass} mt-12`}>
        {isGenZ
          ? 'Disclaimer: Ye app fun + education ke liye hai — ITR file karte waqt CA / official guidance follow karo.'
          : 'Disclaimer: Illustrative estimates only. Consult a qualified professional for filing decisions and compliance.'}
      </footer>
    </AppShell>
  );
}

export default function App() {
  return (
    <ModeProvider>
      <Shell />
    </ModeProvider>
  );
}
