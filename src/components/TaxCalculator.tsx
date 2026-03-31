import { useMemo } from 'react';
import type { TaxInputs } from '../lib/taxEngine';
import { newRegime, oldRegime } from '../lib/taxEngine';
import { useMode } from '../context/ModeContext';

type Props = { inputs: TaxInputs };

function inr(n: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Math.round(n));
}

export function TaxCalculator({ inputs }: Props) {
  const { isGenZ } = useMode();
  const oldR = useMemo(() => oldRegime(inputs), [inputs]);
  const newR = useMemo(() => newRegime(inputs), [inputs]);
  const diff = oldR.totalTax - newR.totalTax;
  const better = diff > 0 ? 'new' : diff < 0 ? 'old' : 'tie';

  const shell = isGenZ
    ? 'rounded-3xl border-2 border-white/50 bg-white/75 p-6 shadow-xl shadow-amber-400/15 backdrop-blur-xl'
    : 'rounded-2xl border border-slate-200/80 bg-white p-6 shadow-lg shadow-slate-200/40';

  return (
    <section className={shell}>
      <h2
        className={
          isGenZ
            ? 'font-[family-name:var(--font-display)] text-xl font-bold text-violet-950'
            : 'text-xl font-semibold text-slate-800'
        }
      >
        {isGenZ ? 'Old vs New regime — battle royale' : 'Regime comparison'}
      </h2>
      <p className={isGenZ ? 'mt-1 text-sm text-violet-800/85' : 'mt-1 text-sm text-slate-500'}>
        {isGenZ
          ? 'Approx numbers — IT Dept se pehle yahan practice match.'
          : 'Illustrative computation using simplified slabs and rebates; verify with official rules.'}
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div
          className={
            isGenZ
              ? 'rounded-2xl border-2 border-violet-200 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 p-5'
              : 'rounded-xl border border-slate-200 bg-slate-50/80 p-5'
          }
        >
          <p className={isGenZ ? 'text-xs font-bold uppercase tracking-wider text-violet-700' : 'text-xs font-medium uppercase tracking-wide text-slate-500'}>
            Old regime
          </p>
          <p className={isGenZ ? 'mt-2 font-[family-name:var(--font-display)] text-2xl font-bold text-violet-950' : 'mt-2 text-2xl font-bold text-slate-900'}>
            {inr(oldR.totalTax)}
          </p>
          <p className={isGenZ ? 'mt-1 text-xs text-violet-800/75' : 'mt-1 text-xs text-slate-500'}>
            Taxable ~ {inr(oldR.taxable)}
          </p>
        </div>
        <div
          className={
            isGenZ
              ? 'rounded-2xl border-2 border-amber-300 bg-gradient-to-br from-amber-300/20 to-orange-300/20 p-5'
              : 'rounded-xl border border-blue-100 bg-blue-50/60 p-5'
          }
        >
          <p className={isGenZ ? 'text-xs font-bold uppercase tracking-wider text-amber-900' : 'text-xs font-medium uppercase tracking-wide text-blue-700'}>
            New regime
          </p>
          <p className={isGenZ ? 'mt-2 font-[family-name:var(--font-display)] text-2xl font-bold text-amber-950' : 'mt-2 text-2xl font-bold text-blue-900'}>
            {inr(newR.totalTax)}
          </p>
          <p className={isGenZ ? 'mt-1 text-xs text-amber-900/75' : 'mt-1 text-xs text-slate-500'}>
            Taxable ~ {inr(newR.taxable)}
          </p>
        </div>
      </div>

      <div
        className={
          isGenZ
            ? 'mt-5 rounded-2xl bg-gradient-to-r from-fuchsia-600 to-violet-600 px-5 py-4 text-white shadow-lg shadow-fuchsia-500/25'
            : 'mt-5 rounded-xl bg-blue-700 px-5 py-4 text-white'
        }
      >
        <p className="text-sm font-medium opacity-90">
          {isGenZ ? 'Verdict (for this estimate)' : 'Estimated outcome'}
        </p>
        <p className="mt-1 text-lg font-semibold">
          {better === 'tie' && (isGenZ ? 'Dono almost same — flip a coin (or use CA coin).' : 'Both regimes are close for these inputs.')}
          {better === 'new' &&
            (isGenZ
              ? `New regime jeeta by ~${inr(Math.abs(diff))} — old wale deductions ka flex kam pada.`
              : `The new regime is lower by approximately ${inr(Math.abs(diff))}.`)}
          {better === 'old' &&
            (isGenZ
              ? `Old regime OP — ~${inr(Math.abs(diff))} bach rahe ho vs new. Deduction gigachad.`
              : `The old regime is lower by approximately ${inr(Math.abs(diff))}.`)}
        </p>
      </div>
    </section>
  );
}
