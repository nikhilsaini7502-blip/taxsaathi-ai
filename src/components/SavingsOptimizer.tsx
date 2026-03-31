import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { TaxInputs } from '../lib/taxEngine';
import { CAP_80C, deductionBuckets } from '../lib/taxEngine';
import { useMode } from '../context/ModeContext';
import { cardShell, progressFill, progressTrack } from '../lib/uiTokens';

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

  const shell = cardShell(isGenZ);

  return (
    <motion.section
      className={shell}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
    >
      <h2
        className={
          isGenZ
            ? 'font-[family-name:var(--font-display)] text-xl font-bold text-slate-900'
            : 'text-xl font-semibold text-slate-800'
        }
      >
        {isGenZ ? '📊 Deduction utilization' : 'Deduction utilization'}
      </h2>
      <p className={isGenZ ? 'mt-1 text-sm text-violet-900/80' : 'mt-1 text-sm text-slate-600'}>
        {isGenZ
          ? 'Green bar = use ho gaya; gap = abhi bhi party bachi hai.'
          : 'Progress bars show utilization against indicative caps for this model.'}
      </p>

      <ul className="mt-6 space-y-5">
        {buckets.map((b, i) => {
          const pct = Math.min(100, Math.round((b.used / b.cap) * 100));
          const unused = Math.max(0, b.cap - b.used);
          return (
            <motion.li
              key={b.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.06 * i, duration: 0.35 }}
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className={isGenZ ? 'text-sm font-semibold text-violet-900' : 'text-sm font-medium text-slate-700'}>
                  {b.label}
                </span>
                <span className={isGenZ ? 'text-xs font-medium text-violet-800' : 'text-xs text-slate-500'}>
                  {inr(b.used)} / {inr(b.cap)}
                </span>
              </div>
              <div className={`mt-2 ${progressTrack(isGenZ)}`}>
                <motion.div
                  className={progressFill(isGenZ)}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1], delay: 0.08 + i * 0.04 }}
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
            </motion.li>
          );
        })}
      </ul>

      <motion.div
        className={
          isGenZ
            ? 'mt-6 rounded-2xl border border-amber-300/50 bg-amber-50/80 px-4 py-4 shadow-md backdrop-blur-sm'
            : 'mt-6 rounded-2xl border border-indigo-100/80 bg-indigo-50/50 px-4 py-4 shadow-md backdrop-blur-sm'
        }
        whileHover={{ scale: 1.005 }}
      >
        <p className={isGenZ ? 'text-sm font-bold text-amber-950' : 'text-sm font-semibold text-indigo-900'}>
          {isGenZ ? 'Quick roasts / tips' : 'Additional considerations'}
        </p>
        <ul
          className={
            isGenZ
              ? 'mt-2 list-inside list-disc space-y-1 text-sm text-amber-950/90'
              : 'mt-2 list-inside list-disc space-y-1 text-sm text-slate-600'
          }
        >
          {tips.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>
      </motion.div>
    </motion.section>
  );
}
