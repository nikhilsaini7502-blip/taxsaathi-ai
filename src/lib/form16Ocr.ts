import {
  demoExtractFromSeed,
  demoNumbersFromSeed,
  fingerprintFile,
  type ExtractedField,
} from './form16DemoExtract';
import type { TaxInputs } from './taxEngine';
import { extractDocumentText, type ExtractProgress } from './ocr/extractDocumentText';
import { confidenceFromParsed, parseForm16Text } from './ocr/parseForm16Text';

function formatInr(n: number): string {
  return `₹${n.toLocaleString('en-IN')}`;
}

export type Form16OcrResult = {
  fields: ExtractedField[];
  patch: Partial<TaxInputs>;
  confidencePct: number;
  /** ocr = mostly parsed; hybrid = mix; demo = fingerprint / read failure */
  source: 'ocr' | 'demo' | 'hybrid';
  note?: string;
};

export async function runForm16Ocr(
  file: File,
  onProgress?: ExtractProgress
): Promise<Form16OcrResult> {
  const seed = await fingerprintFile(file);
  const demo = demoNumbersFromSeed(seed);

  let text: string;
  try {
    text = await extractDocumentText(file, onProgress);
  } catch (e) {
    const d = demoExtractFromSeed(seed);
    return {
      fields: d.fields,
      patch: d.patch,
      confidencePct: d.confidencePct,
      source: 'demo',
      note: `Could not read file (${e instanceof Error ? e.message : 'error'}). Placeholder values from file fingerprint.`,
    };
  }

  if (!text.trim()) {
    const d = demoExtractFromSeed(seed);
    return {
      fields: d.fields,
      patch: d.patch,
      confidencePct: d.confidencePct,
      source: 'demo',
      note: 'No text extracted. Placeholder values from file fingerprint.',
    };
  }

  const parsed = parseForm16Text(text);
  const ocrConf = confidenceFromParsed(parsed, text.length);

  const gross = parsed.gross ?? demo.gross;
  const tds = parsed.tds ?? demo.tds;
  const hraExempt = parsed.hraExempt ?? demo.hraExempt;
  const hraReceived = parsed.hraReceived ?? demo.hraReceived;
  const c80 = parsed.c80 ?? demo.c80;
  const pan = parsed.pan ?? demo.pan;
  const employer = parsed.employerLine ?? demo.employer;

  let source: Form16OcrResult['source'] = 'demo';
  if (parsed.signalCount >= 4) source = 'ocr';
  else if (parsed.signalCount >= 1) source = 'hybrid';

  const confidencePct =
    parsed.signalCount >= 2 ? ocrConf : Math.min(demo.confidencePct, ocrConf);

  const fields: ExtractedField[] = [
    {
      id: 'gross',
      label: 'Gross salary (Part B)',
      value: formatInr(gross),
      status: parsed.gross ? 'verified' : 'warning',
      hint: parsed.gross ? 'Parsed from document text' : 'Not found — fingerprint estimate',
    },
    {
      id: 'tds',
      label: 'TDS deducted (total)',
      value: formatInr(tds),
      status: parsed.tds ? 'verified' : 'warning',
      hint: parsed.tds ? 'Parsed from document text' : 'Not found — fingerprint estimate',
    },
    {
      id: 'hra',
      label: 'House Rent Allowance (exempt)',
      value: formatInr(hraExempt),
      status: parsed.hraExempt ? 'verified' : 'warning',
      hint: parsed.hraExempt ? 'Parsed from document text' : 'Not found — fingerprint estimate',
    },
    {
      id: 'pan',
      label: 'Employee PAN',
      value: pan,
      status: parsed.pan ? 'verified' : 'warning',
      hint: parsed.pan ? 'Parsed from document text' : 'Not found — placeholder PAN',
    },
    {
      id: 'employer',
      label: 'Employer name & TAN',
      value: employer,
      status: parsed.employerLine ? 'verified' : 'warning',
      hint: parsed.employerLine ? 'Parsed from document text' : 'Not found — demo employer line',
    },
    {
      id: '80c',
      label: 'Chapter VI-A (80C declared)',
      value: formatInr(c80),
      status: parsed.c80 ? (c80 >= 145_000 ? 'warning' : 'verified') : 'error',
      hint: parsed.c80
        ? c80 >= 145_000
          ? 'Near ceiling — verify'
          : 'Parsed from document text'
        : 'Not found — fingerprint estimate',
    },
  ];

  const patch: Partial<TaxInputs> = {
    grossSalary: gross,
    hraReceived,
    investment80C: c80,
  };

  const note =
    source === 'ocr'
      ? undefined
      : source === 'hybrid'
        ? 'Some fields use fingerprint fallbacks — verify against your Form 16.'
        : 'Little matched in OCR text — values mostly from file fingerprint. Try a clearer scan or text-based PDF.';

  return { fields, patch, confidencePct, source, note };
}

export type { ExtractProgress };
