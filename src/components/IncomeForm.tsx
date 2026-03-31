import { motion } from 'framer-motion';
import type { TaxInputs } from '../lib/taxEngine';
import { useMode } from '../context/ModeContext';
import { cardShell } from '../lib/uiTokens';

type Props = {
  inputs: TaxInputs;
  onChange: (patch: Partial<TaxInputs>) => void;
};

function formatInr(n: number): string {
  if (!Number.isFinite(n) || n === 0) return '';
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n);
}

function parseInr(s: string): number {
  const d = s.replace(/,/g, '').replace(/[^\d.]/g, '');
  const n = parseFloat(d);
  return Number.isFinite(n) ? n : 0;
}

export function IncomeForm({ inputs, onChange }: Props) {
  const { isGenZ } = useMode();

  const field = (label: string, hint: string, value: number, key: keyof TaxInputs, proLabel?: string) => (
    <label className="block">
      <span
        className={
          isGenZ
            ? 'mb-1.5 flex items-center gap-2 text-sm font-semibold text-violet-900'
            : 'mb-1.5 block text-sm font-medium text-slate-700'
        }
      >
        {isGenZ ? label : proLabel ?? label}
      </span>
      <input
        type="text"
        inputMode="decimal"
        value={value ? formatInr(value) : ''}
        onChange={(e) => onChange({ [key]: parseInr(e.target.value) } as Partial<TaxInputs>)}
        placeholder="0"
        className={
          isGenZ
            ? 'w-full rounded-2xl border border-white/50 bg-white/90 px-4 py-3 text-slate-900 shadow-sm placeholder:text-violet-300 transition-all duration-200 focus:scale-[1.01] focus:border-fuchsia-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-300/45'
            : 'w-full rounded-2xl border border-white/50 bg-white/90 px-4 py-3 text-slate-900 shadow-sm placeholder:text-slate-400 transition-all duration-200 focus:scale-[1.01] focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/45'
        }
      />
      <span className={isGenZ ? 'mt-1 block text-xs text-violet-800/85' : 'mt-1 block text-xs text-slate-500'}>{hint}</span>
    </label>
  );

  const shell = cardShell(isGenZ);

  return (
    <motion.section
      className={shell}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1], delay: 0.06 }}
    >
      <h2
        className={
          isGenZ
            ? 'font-[family-name:var(--font-display)] text-xl font-bold text-slate-900'
            : 'text-xl font-semibold text-slate-800'
        }
      >
        {isGenZ ? '💸 Income & investments' : 'Income and deductions'}
      </h2>
      <p className={isGenZ ? 'mt-1 text-sm text-violet-900/80' : 'mt-1 text-sm text-slate-600'}>
        {isGenZ
          ? 'Numbers daal, drama kam — HRA ke liye rent optional hai (warna estimate chalega).'
          : 'Enter annual figures in Indian Rupees. Rent improves HRA exemption accuracy.'}
      </p>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        {field(
          'Gross salary (annual)',
          'Salary income including all components before exemptions.',
          inputs.grossSalary,
          'grossSalary',
          'Gross salary (per annum)'
        )}
        {field(
          'HRA received (annual)',
          'As per salary structure / Form 16.',
          inputs.hraReceived,
          'hraReceived',
          'House Rent Allowance received'
        )}
        {field(
          'Rent paid (annual)',
          'For HRA exemption calc — agar chhodo to rough estimate.',
          inputs.rentPaid,
          'rentPaid',
          'Rent paid (per annum)'
        )}
        {field(
          '80C investments',
          'ELSS, PF, PPF, LIC, tuition… max ₹1.5L deduction.',
          inputs.investment80C,
          'investment80C',
          'Section 80C investments'
        )}
      </div>

      <label
        className={
          isGenZ
            ? 'mt-6 flex cursor-pointer items-center gap-3 rounded-2xl border border-amber-200/60 bg-amber-50/80 px-4 py-3 shadow-sm transition-all hover:shadow-md'
            : 'mt-6 flex cursor-pointer items-center gap-3 rounded-2xl border border-white/50 bg-white/60 px-4 py-3 shadow-sm transition-all hover:shadow-md'
        }
      >
        <input
          type="checkbox"
          checked={inputs.metro}
          onChange={(e) => onChange({ metro: e.target.checked })}
          className={isGenZ ? 'size-4 accent-fuchsia-600' : 'size-4 accent-indigo-600'}
        />
        <span className={isGenZ ? 'text-sm font-medium text-amber-950' : 'text-sm text-slate-700'}>
          {isGenZ ? 'Metro city (50% basic rule for HRA)' : 'Residing in a metro city (for HRA limit)'}
        </span>
      </label>
    </motion.section>
  );
}
