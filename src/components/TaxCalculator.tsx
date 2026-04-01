import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { TaxInputs } from '../lib/taxEngine';
import { newRegime, oldRegime } from '../lib/taxEngine';
import { useMode } from '../context/ModeContext';
import { useAnimatedCount } from '../hooks/useAnimatedCount';
import { cardShell } from '../lib/uiTokens';

type Props = { inputs: TaxInputs };

function inr(n: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Math.round(n));
}

function IconOld() {
  return (
    <svg className="size-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  );
}

function IconNew() {
  return (
    <svg className="size-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}

function IconTrophy({ className = 'size-5 shrink-0' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2C9.5 2 7.5 4 7.5 6.5V7H6c-1.1 0-2 .9-2 2v1c0 2.2 1.8 4 4 4h.2c.4 1.9 2 3.3 4 3.3s3.6-1.4 4-3.3h.2c2.2 0 4-1.8 4-4V9c0-1.1-.9-2-2-2h-1.5v-.5C17 4 15 2 12 2zm0 2c1.9 0 3.5 1.6 3.5 3.5V7h-7v-.5C8.5 5.6 10.1 4 12 4zM6 9h12v1c0 1.1-.9 2-2 2H8c-1.1 0-2-.9-2-2V9zm6 8c-1.3 0-2.4-.8-2.8-2h5.6c-.4 1.2-1.5 2-2.8 2z" />
    </svg>
  );
}

export function TaxCalculator({ inputs }: Props) {
  const { isGenZ } = useMode();
  const oldR = useMemo(() => oldRegime(inputs), [inputs]);
  const newR = useMemo(() => newRegime(inputs), [inputs]);
  const diff = oldR.totalTax - newR.totalTax;
  const better = diff > 0 ? 'new' : diff < 0 ? 'old' : 'tie';

  const animOld = useAnimatedCount(oldR.totalTax);
  const animNew = useAnimatedCount(newR.totalTax);

  const shell = cardShell(isGenZ);

  const statCard = (highlight: boolean) => {
    const base =
      'relative rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg';
    if (highlight) {
      return isGenZ
        ? `${base} border-fuchsia-400/40 bg-gradient-to-br from-fuchsia-500/20 via-violet-500/15 to-indigo-500/15 shadow-lg shadow-fuchsia-500/15 ring-2 ring-fuchsia-400/30`
        : `${base} border-indigo-400/50 bg-gradient-to-br from-indigo-500/15 via-blue-500/10 to-cyan-500/10 shadow-lg shadow-indigo-500/15 ring-2 ring-indigo-400/40`;
    }
    return isGenZ
      ? `${base} border-white/40 bg-white/50 shadow-md backdrop-blur-sm`
      : `${base} border-white/40 bg-white/55 shadow-md backdrop-blur-sm`;
  };

  const oldHighlight = better === 'old';
  const newHighlight = better === 'new';

  return (
    <motion.section
      className={shell}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <h2
        className={
          isGenZ
            ? 'font-[family-name:var(--font-display)] text-xl font-bold text-slate-900'
            : 'text-xl font-semibold text-slate-800'
        }
      >
        {isGenZ ? '⚔️ Old vs New regime' : 'Regime comparison'}
      </h2>
      <p className={isGenZ ? 'mt-1 text-sm text-violet-900/80' : 'mt-1 text-sm text-slate-600'}>
        {isGenZ
          ? 'Approx numbers — IT Dept se pehle yahan practice match.'
          : 'Illustrative computation using simplified slabs and rebates; verify with official rules.'}
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <motion.div
          className={statCard(oldHighlight)}
          whileHover={{ scale: 1.01 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-600">
            <IconOld />
            {isGenZ ? 'Old regime' : 'Old regime'}
            {oldHighlight && (
              <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-700 ring-1 ring-emerald-500/30">
                <IconTrophy className="size-3.5 shrink-0" />
                {isGenZ ? 'Win' : 'Lower tax'}
              </span>
            )}
          </p>
          <p
            className={
              isGenZ
                ? 'mt-2 font-[family-name:var(--font-display)] text-2xl font-bold tabular-nums text-slate-900'
                : 'mt-2 text-2xl font-bold tabular-nums text-slate-900'
            }
          >
            {inr(animOld)}
          </p>
          <p className={isGenZ ? 'mt-1 text-xs text-violet-800/75' : 'mt-1 text-xs text-slate-500'}>Taxable ~ {inr(oldR.taxable)}</p>
        </motion.div>

        <motion.div
          className={statCard(newHighlight)}
          whileHover={{ scale: 1.01 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-600">
            <IconNew />
            {isGenZ ? 'New regime' : 'New regime'}
            {newHighlight && (
              <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-700 ring-1 ring-emerald-500/30">
                <IconTrophy className="size-3.5 shrink-0" />
                {isGenZ ? 'Win' : 'Lower tax'}
              </span>
            )}
          </p>
          <p
            className={
              isGenZ
                ? 'mt-2 font-[family-name:var(--font-display)] text-2xl font-bold tabular-nums text-slate-900'
                : 'mt-2 text-2xl font-bold tabular-nums text-slate-900'
            }
          >
            {inr(animNew)}
          </p>
          <p className={isGenZ ? 'mt-1 text-xs text-violet-800/75' : 'mt-1 text-xs text-slate-500'}>Taxable ~ {inr(newR.taxable)}</p>
        </motion.div>
      </div>

      <motion.div
        className={
          isGenZ
            ? 'mt-5 rounded-2xl bg-gradient-to-r from-fuchsia-500 via-violet-500 to-indigo-500 px-5 py-4 text-white shadow-xl shadow-violet-500/25'
            : 'mt-5 rounded-2xl bg-gradient-to-r from-indigo-500 to-blue-600 px-5 py-4 text-white shadow-xl shadow-indigo-500/25'
        }
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.08, duration: 0.35 }}
      >
        <p className="text-sm font-medium text-white/90">{isGenZ ? 'Verdict (for this estimate)' : 'Estimated outcome'}</p>
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
      </motion.div>
    </motion.section>
  );
}
