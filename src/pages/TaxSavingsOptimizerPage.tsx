import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useMode } from '../context/ModeContext';
import type { TaxInputs } from '../lib/taxEngine';
import {
  CAP_24B,
  CAP_80C,
  CAP_80CCD1B,
  CAP_80D_AGGREGATE,
  CAP_80E_ILLUSTRATIVE,
  fullyOptimizedInputs,
  oldRegime,
  potentialSectionSave,
  type OptimizerSectionId,
} from '../lib/taxEngine';
import { cardShell, progressFill, progressTrack } from '../lib/uiTokens';

type Props = {
  inputs: TaxInputs;
  onChange: (patch: Partial<TaxInputs>) => void;
};

function inr(n: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Math.round(n));
}

type SectionDef = {
  id: OptimizerSectionId;
  title: string;
  subtitle: string;
  cap: number;
  used: number;
  usedKey: keyof TaxInputs;
};

function parseNum(s: string): number {
  const n = parseFloat(s.replace(/,/g, ''));
  return Number.isFinite(n) ? Math.max(0, n) : 0;
}

export function TaxSavingsOptimizerPage({ inputs, onChange }: Props) {
  const { isGenZ } = useMode();

  const sections: SectionDef[] = useMemo(
    () => [
      {
        id: '80c',
        title: 'Section 80C',
        subtitle: 'ELSS, PPF, EPF, LIC, tuition fees, etc.',
        cap: CAP_80C,
        used: Math.min(inputs.investment80C, CAP_80C),
        usedKey: 'investment80C',
      },
      {
        id: '80d',
        title: 'Section 80D',
        subtitle: 'Health insurance premiums (self, family, parents)',
        cap: CAP_80D_AGGREGATE,
        used: Math.min(inputs.deduction80D, CAP_80D_AGGREGATE),
        usedKey: 'deduction80D',
      },
      {
        id: '80ccd',
        title: 'Section 80CCD(1B)',
        subtitle: 'Additional NPS contribution (over 80C)',
        cap: CAP_80CCD1B,
        used: Math.min(inputs.deduction80CCD1B, CAP_80CCD1B),
        usedKey: 'deduction80CCD1B',
      },
      {
        id: '24b',
        title: 'Section 24(b)',
        subtitle: 'Home loan interest (self-occupied, illustrative cap)',
        cap: CAP_24B,
        used: Math.min(inputs.deduction24b, CAP_24B),
        usedKey: 'deduction24b',
      },
      {
        id: '80e',
        title: 'Section 80E',
        subtitle: 'Education loan interest (illustrative planning cap for chart)',
        cap: CAP_80E_ILLUSTRATIVE,
        used: Math.min(inputs.deduction80E, CAP_80E_ILLUSTRATIVE),
        usedKey: 'deduction80E',
      },
    ],
    [inputs]
  );

  const taxBefore = oldRegime(inputs).totalTax;
  const taxAfter = oldRegime(fullyOptimizedInputs(inputs)).totalTax;
  const totalSave = Math.max(0, taxBefore - taxAfter);

  const shell = cardShell(isGenZ);

  const recs = isGenZ
    ? [
        {
          step: '01',
          title: '80C ko max out, bro',
          body: 'ELSS SIP + mandatory PF + tuition mix karke ₹1.5L tak bharo — last week March mein panic ELSS se better year-round SIP.',
        },
        {
          step: '02',
          title: 'Parents ki health = 80D W',
          body: 'Senior parents ke liye top-up policy check karo; aggregate limits ke andar premium push karke taxable ghatao (eligibility rules apply).',
        },
        {
          step: '03',
          title: 'NPS Tier-1 + home loan chess',
          body: '₹50k extra 80CCD(1B) + 24(b) interest proof tight rakho — dono parallel play old regime mein tax ko soft kar dete hain.',
        },
      ]
    : [
        {
          step: '01',
          title: 'Utilise Section 80C fully',
          body: 'Align ELSS, voluntary PF/PPF, and eligible tuition payments to approach the ₹1.5 lakh ceiling systematically across the year.',
        },
        {
          step: '02',
          title: 'Review Section 80D coverage',
          body: 'Model premiums for self, family, and parents within applicable sub-limits; retain policy documents and payment proofs for audit readiness.',
        },
        {
          step: '03',
          title: 'Layer NPS and housing interest',
          body: 'Consider the additional ₹50,000 under 80CCD(1B) alongside home loan interest documentation under Section 24(b), where applicable.',
        },
      ];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={
          isGenZ
            ? 'grid gap-4 rounded-2xl border border-white/20 bg-gradient-to-br from-violet-600/95 via-fuchsia-600/90 to-indigo-600/90 p-6 text-white shadow-xl shadow-violet-500/25 backdrop-blur-sm sm:grid-cols-3'
            : 'grid gap-4 rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900 via-indigo-900 to-blue-800 p-6 text-white shadow-xl shadow-indigo-500/20 backdrop-blur-sm sm:grid-cols-3'
        }
      >
        <div>
          <p className={isGenZ ? 'text-xs font-bold uppercase tracking-wider text-white/80' : 'text-xs font-semibold uppercase tracking-wider text-blue-200'}>
            {isGenZ ? 'Tax (before optimizer)' : 'Total tax — current plan'}
          </p>
          <p className="mt-2 font-[family-name:var(--font-display)] text-3xl font-extrabold tabular-nums">{inr(taxBefore)}</p>
          <p className={isGenZ ? 'mt-1 text-xs text-white/75' : 'mt-1 text-xs text-blue-100/90'}>
            {isGenZ ? 'Old regime estimate, tumhari numbers se.' : 'Old regime estimate using your inputs.'}
          </p>
        </div>
        <div>
          <p className={isGenZ ? 'text-xs font-bold uppercase tracking-wider text-white/80' : 'text-xs font-semibold uppercase tracking-wider text-blue-200'}>
            {isGenZ ? 'Tax (after optimizer)' : 'Total tax — optimized'}
          </p>
          <p className="mt-2 font-[family-name:var(--font-display)] text-3xl font-extrabold tabular-nums text-emerald-300">{inr(taxAfter)}</p>
          <p className={isGenZ ? 'mt-1 text-xs text-white/75' : 'mt-1 text-xs text-blue-100/90'}>
            {isGenZ ? 'Sab sections caps pe — theoretical best case.' : 'Assumes statutory/demo caps fully utilised (illustrative).'}
          </p>
        </div>
        <div>
          <p className={isGenZ ? 'text-xs font-bold uppercase tracking-wider text-white/80' : 'text-xs font-semibold uppercase tracking-wider text-blue-200'}>
            {isGenZ ? 'Potential flex' : 'Potential savings'}
          </p>
          <p className="mt-2 font-[family-name:var(--font-display)] text-3xl font-extrabold tabular-nums text-amber-200">{inr(totalSave)}</p>
          <p className={isGenZ ? 'mt-1 text-xs text-white/75' : 'mt-1 text-xs text-blue-100/90'}>
            {isGenZ ? 'Before − after, approx — IT Dept ko final word.' : 'Difference between current and fully optimised demo scenario.'}
          </p>
        </div>
      </motion.div>

      <div className="space-y-5">
        {sections.map((s) => {
          const unused = Math.max(0, s.cap - s.used);
          const pct = s.cap > 0 ? Math.min(100, Math.round((s.used / s.cap) * 100)) : 0;
          const save = potentialSectionSave(inputs, s.id);
          return (
            <motion.section
              key={s.id}
              className={shell + ' p-5 sm:p-6'}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              whileHover={{ y: -2 }}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className={isGenZ ? 'font-[family-name:var(--font-display)] text-lg font-bold text-violet-950' : 'text-lg font-semibold text-slate-800'}>
                    {s.title}
                  </h3>
                  <p className={isGenZ ? 'mt-1 text-sm text-violet-800/85' : 'mt-1 text-sm text-slate-500'}>{s.subtitle}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-800 ring-1 ring-red-200/80">
                    Unused {inr(unused)}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-900 ring-1 ring-emerald-200/80">
                    {isGenZ ? 'Save ~ ' : 'Potential tax saving ~ '}
                    {inr(save)}
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <div className="mb-1.5 flex justify-between text-xs">
                  <span className={isGenZ ? 'font-medium text-violet-800' : 'font-medium text-slate-600'}>
                    {isGenZ ? 'Current usage' : 'Current utilisation'}
                  </span>
                  <span className={isGenZ ? 'tabular-nums text-violet-700' : 'tabular-nums text-slate-500'}>
                    {inr(s.used)} / {inr(s.cap)} ({pct}%)
                  </span>
                </div>
                <div className={progressTrack(isGenZ)}>
                  <motion.div
                    className={progressFill(isGenZ)}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
              </div>

              <label className={isGenZ ? 'mt-4 block text-sm font-semibold text-violet-900' : 'mt-4 block text-sm font-medium text-slate-700'}>
                {isGenZ ? 'Adjust amount (annual)' : 'Adjust annual amount'}
                <input
                  type="text"
                  inputMode="numeric"
                  value={String(Math.round((inputs[s.usedKey] as number) || 0))}
                  onChange={(e) => onChange({ [s.usedKey]: parseNum(e.target.value) } as Partial<TaxInputs>)}
                  className={
                    isGenZ
                      ? 'mt-2 w-full rounded-2xl border border-white/50 bg-white/90 px-4 py-2.5 font-mono text-sm shadow-sm transition-all focus:scale-[1.01] focus:border-fuchsia-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-300/45'
                      : 'mt-2 w-full rounded-2xl border border-white/50 bg-white/90 px-4 py-2.5 font-mono text-sm shadow-sm transition-all focus:scale-[1.01] focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/40'
                  }
                />
              </label>
            </motion.section>
          );
        })}
      </div>

      <div>
        <h2 className={isGenZ ? 'font-[family-name:var(--font-display)] text-xl font-bold text-violet-950' : 'text-xl font-semibold text-slate-800'}>
          {isGenZ ? '🤖 AI playbook — 3 step cards' : 'AI recommendations'}
        </h2>
        <p className={isGenZ ? 'mt-1 text-sm text-violet-800/85' : 'mt-1 text-sm text-slate-500'}>
          {isGenZ ? 'Generic game plan — CA se fact-check zaroori.' : 'General guidance only; validate with a qualified advisor.'}
        </p>
        <ol className="mt-6 grid gap-4 md:grid-cols-3">
          {recs.map((r) => (
            <motion.li
              key={r.step}
              className={
                isGenZ
                  ? 'flex flex-col rounded-2xl border border-amber-200/60 bg-gradient-to-b from-amber-50/95 to-white/90 p-5 shadow-md backdrop-blur-sm transition-all hover:-translate-y-1 hover:shadow-xl'
                  : 'flex flex-col rounded-2xl border border-white/40 bg-white/70 p-5 shadow-md backdrop-blur-md transition-all hover:-translate-y-1 hover:shadow-xl'
              }
              whileHover={{ scale: 1.01 }}
            >
              <span
                className={
                  isGenZ
                    ? 'inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-500 to-violet-600 text-sm font-extrabold text-white shadow-md'
                    : 'inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-sm font-bold text-white shadow-md'
                }
              >
                {r.step}
              </span>
              <h3 className={isGenZ ? 'mt-4 font-[family-name:var(--font-display)] text-base font-bold text-violet-950' : 'mt-4 text-base font-semibold text-slate-800'}>
                {r.title}
              </h3>
              <p className={isGenZ ? 'mt-2 flex-1 text-sm leading-relaxed text-violet-900/90' : 'mt-2 flex-1 text-sm leading-relaxed text-slate-600'}>
                {r.body}
              </p>
              <p className={isGenZ ? 'mt-4 text-[10px] font-bold uppercase tracking-wider text-fuchsia-600' : 'mt-4 text-[10px] font-semibold uppercase tracking-wider text-blue-600'}>
                TaxSaathi AI
              </p>
            </motion.li>
          ))}
        </ol>
      </div>
    </div>
  );
}
