/** Simplified India individual tax estimates (FY-style slabs + cess). Not legal advice. */

export const CAP_80C = 150_000;
/** Illustrative aggregate ceiling for UI / demo (actual 80D limits vary by age/cover). */
export const CAP_80D_AGGREGATE = 75_000;
export const CAP_80CCD1B = 50_000;
export const CAP_24B = 200_000;
/** Illustrative cap for progress bar & “max out” demo (no statutory cap on 80E interest). */
export const CAP_80E_ILLUSTRATIVE = 300_000;
export const STD_OLD = 50_000;
export const STD_NEW = 75_000;

export type TaxInputs = {
  grossSalary: number;
  hraReceived: number;
  rentPaid: number;
  investment80C: number;
  metro: boolean;
  deduction80D: number;
  deduction80CCD1B: number;
  deduction24b: number;
  deduction80E: number;
};

function progressiveTax(taxableIncome: number, slabs: { upto: number; rate: number }[]): number {
  let ti = Math.max(0, taxableIncome);
  let tax = 0;
  let lower = 0;
  for (const { upto, rate } of slabs) {
    const width = upto - lower;
    if (width <= 0) continue;
    const chunk = Math.min(ti, width);
    tax += chunk * rate;
    ti -= chunk;
    lower = upto;
    if (ti <= 0) break;
  }
  return tax;
}

const SLABS_OLD = [
  { upto: 250_000, rate: 0 },
  { upto: 500_000, rate: 0.05 },
  { upto: 1_000_000, rate: 0.2 },
  { upto: Number.POSITIVE_INFINITY, rate: 0.3 },
];

const SLABS_NEW = [
  { upto: 300_000, rate: 0 },
  { upto: 600_000, rate: 0.05 },
  { upto: 900_000, rate: 0.1 },
  { upto: 1_200_000, rate: 0.15 },
  { upto: 1_500_000, rate: 0.2 },
  { upto: Number.POSITIVE_INFINITY, rate: 0.3 },
];

export function hraExemption(
  basicAnnual: number,
  hraReceived: number,
  rentPaidAnnual: number,
  metro: boolean
): number {
  if (hraReceived <= 0) return 0;
  const rentLess10 = Math.max(0, rentPaidAnnual - 0.1 * basicAnnual);
  const capPct = metro ? 0.5 : 0.4;
  return Math.min(hraReceived, rentLess10, capPct * basicAnnual);
}

/** If rent not given, assume typical rent slightly above HRA for estimation */
export function impliedRent(inputs: TaxInputs): number {
  if (inputs.rentPaid > 0) return inputs.rentPaid;
  const basic = inputs.grossSalary * 0.45;
  return Math.max(inputs.hraReceived * 1.15, basic * 0.2);
}

export function estimatedBasic(gross: number): number {
  return gross * 0.45;
}

function cappedExtraDeductions(inputs: TaxInputs): {
  d80d: number;
  nps: number;
  b24: number;
  e80: number;
} {
  return {
    d80d: Math.min(Math.max(0, inputs.deduction80D), CAP_80D_AGGREGATE),
    nps: Math.min(Math.max(0, inputs.deduction80CCD1B), CAP_80CCD1B),
    b24: Math.min(Math.max(0, inputs.deduction24b), CAP_24B),
    e80: Math.max(0, inputs.deduction80E),
  };
}

export function oldRegime(inputs: TaxInputs): { taxable: number; baseTax: number; totalTax: number } {
  const basic = estimatedBasic(inputs.grossSalary);
  const rent = impliedRent(inputs);
  const hra = hraExemption(basic, inputs.hraReceived, rent, inputs.metro);
  const c80 = Math.min(Math.max(0, inputs.investment80C), CAP_80C);
  const { d80d, nps, b24, e80 } = cappedExtraDeductions(inputs);
  const deductible = c80 + d80d + nps + b24 + e80;
  const taxable = Math.max(0, inputs.grossSalary - STD_OLD - hra - deductible);
  let baseTax = progressiveTax(taxable, SLABS_OLD);
  if (taxable <= 500_000) {
    baseTax = Math.max(0, baseTax - 12_500);
  }
  const totalTax = baseTax * 1.04;
  return { taxable, baseTax, totalTax };
}

export function newRegime(inputs: TaxInputs): { taxable: number; baseTax: number; totalTax: number } {
  const taxable = Math.max(0, inputs.grossSalary - STD_NEW);
  let baseTax = progressiveTax(taxable, SLABS_NEW);
  if (taxable <= 700_000) {
    baseTax = Math.max(0, baseTax - Math.min(baseTax, 25_000));
  }
  const totalTax = baseTax * 1.04;
  return { taxable, baseTax, totalTax };
}

export type DeductionBucket = {
  id: string;
  label: string;
  used: number;
  cap: number;
  unit: string;
};

export function deductionBuckets(inputs: TaxInputs): DeductionBucket[] {
  const basic = estimatedBasic(inputs.grossSalary);
  const rent = impliedRent(inputs);
  const hraUsed = hraExemption(basic, inputs.hraReceived, rent, inputs.metro);
  const hraCap = Math.min(inputs.hraReceived, inputs.metro ? basic * 0.5 : basic * 0.4);

  return [
    {
      id: '80c',
      label: 'Section 80C (ELSS, PF, tuition, etc.)',
      used: Math.min(inputs.investment80C, CAP_80C),
      cap: CAP_80C,
      unit: '₹',
    },
    {
      id: 'hra',
      label: 'HRA exemption (Section 10)',
      used: hraUsed,
      cap: Math.max(hraCap, 1),
      unit: '₹',
    },
    {
      id: 'std',
      label: 'Standard deduction (salary)',
      used: STD_OLD,
      cap: STD_OLD,
      unit: '₹',
    },
  ];
}

export type OptimizerSectionId = '80c' | '80d' | '80ccd' | '24b' | '80e';

export function fullyOptimizedInputs(inputs: TaxInputs): TaxInputs {
  return {
    ...inputs,
    investment80C: CAP_80C,
    deduction80D: CAP_80D_AGGREGATE,
    deduction80CCD1B: CAP_80CCD1B,
    deduction24b: CAP_24B,
    deduction80E: Math.max(inputs.deduction80E, CAP_80E_ILLUSTRATIVE),
  };
}

/** Tax if this section alone were raised to its demo cap (others unchanged). */
export function potentialSectionSave(inputs: TaxInputs, id: OptimizerSectionId): number {
  const base = oldRegime(inputs).totalTax;
  let patched: TaxInputs = inputs;
  switch (id) {
    case '80c':
      patched = { ...inputs, investment80C: CAP_80C };
      break;
    case '80d':
      patched = { ...inputs, deduction80D: CAP_80D_AGGREGATE };
      break;
    case '80ccd':
      patched = { ...inputs, deduction80CCD1B: CAP_80CCD1B };
      break;
    case '24b':
      patched = { ...inputs, deduction24b: CAP_24B };
      break;
    case '80e':
      patched = { ...inputs, deduction80E: CAP_80E_ILLUSTRATIVE };
      break;
  }
  return Math.max(0, base - oldRegime(patched).totalTax);
}
