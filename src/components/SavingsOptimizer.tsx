import { useMemo } from 'react';
import type { TaxInputs } from '../lib/taxEngine';
import { CAP_80C, deductionBuckets } from '../lib/taxEngine';
import { useMode } from '../context/ModeContext';

type Props = { inputs: TaxInputs };

function inr(n: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Math.round(n));
}

export function SavingsOptimizer({ inputs }: Props) {
  const { isGenZ } = useMode();
  const buckets = useMemo(() => deductionBuckets(inputs), [inputs]);

  const unused80c = Math.max(0, CAP_80C - Math.min(inputs.investment80C, CAP_80C));

  const tips: string[] = [];
  if (isGenZ) {
    if (unused80c > 0) tips.push(`80C mein ${inr(unused80c)} ka headroom — khali chhodna = charity to exchequer.`);
    if (inputs.hraReceived > 0 && inputs.rentPaid <= 0) {
      tips.push('Rent amount add kar — HRA exemption zyada legit banega.');
    }
    tips.push('80D (health), NPS 80CCD(1B) — agar eligible ho to spreadsheet mein add karo.');
  } else {
    if (unused80c > 0) tips.push(`Remaining Section 80C headroom: approximately ${inr(unused80c)}.`);
    if (inputs.hraReceived > 0 && inputs.rentPaid <= 0) {
      tips.push('Providing annual rent paid improves the HRA exemption estimate.');
    }
    tips.push('Consider Section 80D and NPS (80CCD(1B)) if applicable to your profile.');
  }

  const shell = isGenZ
    ? 'rounded-3xl border-2 border-white/50 bg-white/75 p-6 shadow-xl shadow-violet-500/10 backdrop-blur-xl'
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
        {isGenZ ? 'Savings optimizer — FOMO for deductions' : 'Deduction utilization'}
      </h2>
      <p className={isGenZ ? 'mt-1 text-sm text-violet-800/85' : 'mt-1 text-sm text-slate-500'}>
        {isGenZ
          ? 'Green bar = use ho gaya; gap = abhi bhi party bachi hai.'
          : 'Progress bars show utilization against indicative caps for this model.'}
      </p>

      <ul className="mt-6 space-y-5">
        {buckets.map((b) => {
          const pct = Math.min(100, Math.round((b.used / b.cap) * 100));
          const unused = Math.max(0, b.cap - b.used);
          return (
            <li key={b.id}>
              <div className="flex items-baseline justify-between gap-2">
                <span className={isGenZ ? 'text-sm font-semibold text-violet-900' : 'text-sm font-medium text-slate-700'}>
                  {b.label}
                </span>
                <span className={isGenZ ? 'text-xs font-medium text-violet-700' : 'text-xs text-slate-500'}>
                  {inr(b.used)} / {inr(b.cap)}
                </span>
              </div>
              <div
                className={
                  isGenZ
                    ? 'mt-2 h-3 overflow-hidden rounded-full bg-violet-200/60'
                    : 'mt-2 h-2.5 overflow-hidden rounded-full bg-slate-200'
                }
              >
                <div
                  className={
                    isGenZ
                      ? 'h-full rounded-full bg-gradient-to-r from-fuchsia-500 via-violet-500 to-amber-400 transition-[width] duration-500'
                      : 'h-full rounded-full bg-blue-600 transition-[width] duration-500'
                  }
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className={isGenZ ? 'mt-1.5 text-xs text-violet-800/80' : 'mt-1.5 text-xs text-slate-500'}>
                {unused <= 0
                  ? isGenZ
                    ? 'Cap touch — main character energy.'
                    : 'Limit reached for this bucket.'
                  : isGenZ
                    ? `Unused ~ ${inr(unused)} — abhi optimize ho sakta hai.`
                    : `Unused headroom ~ ${inr(unused)}.`}
              </p>
            </li>
          );
        })}
      </ul>

      <div
        className={
          isGenZ
            ? 'mt-6 rounded-2xl border border-amber-300/60 bg-amber-50/90 px-4 py-4'
            : 'mt-6 rounded-xl border border-blue-100 bg-blue-50/50 px-4 py-4'
        }
      >
        <p className={isGenZ ? 'text-sm font-bold text-amber-950' : 'text-sm font-semibold text-blue-900'}>
          {isGenZ ? 'Quick roasts / tips' : 'Additional considerations'}
        </p>
        <ul className={isGenZ ? 'mt-2 list-inside list-disc space-y-1 text-sm text-amber-950/90' : 'mt-2 list-inside list-disc space-y-1 text-sm text-slate-600'}>
          {tips.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
