import type { TaxInputs } from './taxEngine';

export type ExtractedField = {
  id: string;
  label: string;
  value: string;
  status: 'verified' | 'warning' | 'error';
  hint?: string;
};

/** FNV-1a over file bytes + metadata — distinguishes different uploads without OCR. */
export async function fingerprintFile(file: File): Promise<number> {
  const n = Math.min(65536, file.size);
  const slice = n > 0 ? file.slice(0, n) : file.slice(0, 0);
  const buf = await slice.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let h = 2166136261;
  for (let i = 0; i < bytes.length; i++) {
    h ^= bytes[i];
    h = Math.imul(h, 16777619);
  }
  const meta = `${file.name}\0${file.size}\0${file.lastModified}`;
  for (let i = 0; i < meta.length; i++) {
    h ^= meta.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function roundTo1000(n: number): number {
  return Math.round(n / 1000) * 1000;
}

function formatInr(n: number): string {
  return `₹${n.toLocaleString('en-IN')}`;
}

const PAN_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function fakePan(rand: () => number): string {
  let s = '';
  for (let i = 0; i < 5; i++) s += PAN_LETTERS[Math.floor(rand() * 26)];
  for (let i = 0; i < 4; i++) s += String(Math.floor(rand() * 10));
  s += PAN_LETTERS[Math.floor(rand() * 26)];
  return s;
}

const EMPLOYERS = [
  'Acme India Pvt Ltd',
  'TechNest Solutions LLP',
  'Global Retail India Ltd',
  'FinServe Advisory Pvt Ltd',
  'BluePeak IT Services Ltd',
];

const TAN_SUFFIX = 'DELH12345A';

export type DemoExtractResult = {
  fields: ExtractedField[];
  patch: Partial<TaxInputs>;
  confidencePct: number;
};

export type DemoNumbers = {
  gross: number;
  tds: number;
  hraExempt: number;
  hraReceived: number;
  c80: number;
  confidencePct: number;
  pan: string;
  employer: string;
};

/** Deterministic placeholder figures from file fingerprint (when OCR misses fields). */
export function demoNumbersFromSeed(seed: number): DemoNumbers {
  const rand = mulberry32(seed);
  const gross = roundTo1000(6_00_000 + rand() * 32_00_000);
  const tds = roundTo1000(gross * (0.08 + rand() * 0.12));
  const hraExempt = roundTo1000(Math.min(gross * 0.15, 80_000 + rand() * 2_00_000));
  const hraReceived = roundTo1000(1_80_000 + rand() * 1_20_000);
  const c80 = Math.min(150_000, roundTo1000(rand() * 1_65_000));
  const confidencePct = 55 + Math.floor(rand() * 34);
  const pan = fakePan(rand);
  const employer = `${EMPLOYERS[Math.floor(rand() * EMPLOYERS.length)]} · ${TAN_SUFFIX}`;
  return { gross, tds, hraExempt, hraReceived, c80, confidencePct, pan, employer };
}

/**
 * Deterministic “extraction” from a fingerprint — not real OCR.
 * Different files (name/size/content) → different numbers; same file → same numbers.
 */
export function demoExtractFromSeed(seed: number): DemoExtractResult {
  const { gross, tds, hraExempt, hraReceived, c80, confidencePct, pan, employer } = demoNumbersFromSeed(seed);

  const fields: ExtractedField[] = [
    {
      id: 'gross',
      label: 'Gross salary (Part B)',
      value: formatInr(gross),
      status: 'verified',
      hint: 'Matched Part B totals (demo heuristic from file fingerprint)',
    },
    {
      id: 'tds',
      label: 'TDS deducted (total)',
      value: formatInr(tds),
      status: 'verified',
      hint: 'Aligned with Form 16 summary (estimated from fingerprint)',
    },
    {
      id: 'hra',
      label: 'House Rent Allowance (exempt)',
      value: formatInr(hraExempt),
      status: 'warning',
      hint: 'Table layout fuzzy — please confirm',
    },
    {
      id: 'pan',
      label: 'Employee PAN',
      value: pan,
      status: 'verified',
    },
    {
      id: 'employer',
      label: 'Employer name & TAN',
      value: employer,
      status: 'warning',
      hint: 'TAN OCR confidence medium (demo)',
    },
    {
      id: '80c',
      label: 'Chapter VI-A (80C declared)',
      value: formatInr(c80),
      status: c80 >= 145_000 ? 'warning' : 'error',
      hint: c80 >= 145_000 ? 'Near ceiling — verify declarations' : 'Annexure crop cut off — manual check',
    },
  ];

  const patch: Partial<TaxInputs> = {
    grossSalary: gross,
    hraReceived,
    investment80C: c80,
  };

  return { fields, patch, confidencePct };
}
