/** Heuristic extraction of Form 16–style figures from raw OCR/PDF text. Not legal advice. */

export type ParsedForm16 = {
  gross?: number;
  tds?: number;
  hraExempt?: number;
  hraReceived?: number;
  c80?: number;
  pan?: string;
  employerLine?: string;
  /** How many key signals we extracted (0–6). */
  signalCount: number;
};

function normalizeForParse(text: string): string {
  return text.replace(/\r/g, '\n').replace(/[ \t]+/g, ' ');
}

export function parseLooseInr(s: string): number {
  const cleaned = s.replace(/,/g, '').replace(/\s/g, '').trim();
  const n = Number.parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function firstCapture(re: RegExp, text: string): string | undefined {
  const m = re.exec(text);
  return m?.[1];
}

/**
 * Amount on same line as a label, e.g. "Gross Salary   600000".
 * Supports Indian commas or plain digit runs (avoids taking "600" from "600000").
 */
function parseAnchoredAmount(text: string, labelRe: RegExp): number | undefined {
  labelRe.lastIndex = 0;
  const m = labelRe.exec(text);
  if (!m) return undefined;
  const rest = text.slice(m.index + m[0].length, m.index + m[0].length + 100);
  const raw =
    firstCapture(/^\s*[:\-]?\s*((?:\d{1,3}(?:,\d{2})*(?:,\d{3})+)|(?:\d{4,12}))(?:\.\d{1,2})?/, rest) ??
    firstCapture(/^\s*[:\-]?\s*(\d[\d,]*)/, rest);
  if (!raw) return undefined;
  const v = parseLooseInr(raw);
  return v >= 1_000 && v <= 99_999_999 ? v : undefined;
}

/** Prefer plain long numbers in window, then Indian-style, so "600000" is not read as "600". */
function findMoneyNear(text: string, windowRe: RegExp): number | undefined {
  windowRe.lastIndex = 0;
  const wm = windowRe.exec(text);
  if (!wm) return undefined;
  const start = Math.max(0, wm.index - 20);
  const end = Math.min(text.length, wm.index + wm[0].length + 140);
  const slice = text.slice(start, end);

  const plain = slice.match(/\b(\d{4,12})\b/g);
  if (plain) {
    for (const p of plain) {
      const v = parseLooseInr(p);
      if (v >= 1_000 && v <= 99_999_999) return v;
    }
  }
  const ind = firstCapture(/(\d{1,3}(?:,\d{2})*(?:,\d{3})+(?:\.\d{1,2})?)/, slice);
  if (ind) {
    const v = parseLooseInr(ind);
    if (v >= 1_000 && v <= 99_999_999) return v;
  }
  const fallback = firstCapture(/\b(\d{4,12})\b/, slice);
  if (fallback) {
    const v = parseLooseInr(fallback);
    if (v >= 1_000 && v <= 99_999_999) return v;
  }
  return undefined;
}

/** Employee PAN — avoid employer PAN when both exist. */
function findEmployeePan(text: string): string | undefined {
  const u = text.toUpperCase().replace(/\s+/g, ' ');
  const direct = u.match(/EMPLOYEE\s+PAN\s*[:\s]+([A-Z]{5}[0-9]{4}[A-Z])/);
  if (direct) return direct[1];
  const alt = u.match(/PAN\s+OF\s+(?:THE\s+)?EMPLOYEE\s*[:\s]+([A-Z]{5}[0-9]{4}[A-Z])/);
  if (alt) return alt[1];

  const empBlock = u.split(/EMPLOYEE\s+PAN/i)[1];
  if (empBlock) {
    const m = empBlock.match(/([A-Z]{5}[0-9]{4}[A-Z])/);
    if (m) return m[1];
  }
  return undefined;
}

function findEmployerLine(text: string): string | undefined {
  const t = text.replace(/\s+/g, ' ');
  const name =
    t.match(/Employer\s+Name\s+(.+?)\s+Employer\s+Address/i) ??
    t.match(/Employer\s+Name\s+([^\n]+?)(?:\s{2,}Employer|\s+Employer\s+Address|$)/i);
  if (name) return name[1].trim().slice(0, 120);
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (/name\s+and\s+address\s+of\s+the\s+employer/i.test(l) || /^employer\s+name\b/i.test(l)) {
      const next = lines[i + 1];
      if (next && next.length > 3 && next.length < 120) return next;
    }
  }
  return undefined;
}

export function parseForm16Text(raw: string): ParsedForm16 {
  const text = normalizeForParse(raw);
  const out: ParsedForm16 = { signalCount: 0 };

  // Label-anchored (works for sample PDFs and clean OCR)
  const gross =
    parseAnchoredAmount(text, /Gross\s+Salary/i) ??
    parseAnchoredAmount(text, /(?:Total\s+)?Gross\s+Salary/i) ??
    findMoneyNear(text, /(?:gross\s+salary|amount\s+of\s+salary|total\s+amount\s+of\s+salary)/i) ??
    findMoneyNear(
      text,
      /income\s+chargeable\s+under\s+the\s+head\s+['"]?\s*SALARIES['"]?/i
    );
  if (gross) {
    out.gross = gross;
    out.signalCount += 1;
  }

  const tds =
    parseAnchoredAmount(text, /TDS\s+Deducted/i) ??
    parseAnchoredAmount(text, /Total\s+Tax\s+Deducted/i) ??
    parseAnchoredAmount(text, /Tax\s+Deducted\s+at\s+Source/i) ??
    findMoneyNear(text, /(?:total\s+)?amount\s+of\s+tax\s+deducted/i) ??
    findMoneyNear(text, /total\s+tax\s+(?:deducted|payable)/i);
  if (tds) {
    out.tds = tds;
    out.signalCount += 1;
  }

  const hraR =
    parseAnchoredAmount(text, /House\s+Rent\s+Allowance/i) ??
    findMoneyNear(text, /(?:house\s+rent\s+allowance|HRA)(?!\s+exempt)/i);
  const hraE = findMoneyNear(
    text,
    /(?:amount\s+of\s+)?(?:exempt|exemption)[^\n]{0,40}HRA|HRA[^\d]{0,40}(?:exempt|exemption)/i
  );
  if (hraE) {
    out.hraExempt = hraE;
    out.signalCount += 1;
  }
  if (hraR) {
    out.hraReceived = hraR;
    out.signalCount += 1;
  }

  const c80 =
    parseAnchoredAmount(text, /Section\s+80\s*C\s+Deduction/i) ??
    parseAnchoredAmount(text, /80\s*C\s*\(?Deduction\)?/i) ??
    findMoneyNear(text, /80\s*C|SECTION\s*80\s*\(?\s*C\s*\)?/i);
  if (c80 && c80 <= 200_000) {
    out.c80 = Math.min(150_000, c80);
    out.signalCount += 1;
  }

  const pan = findEmployeePan(text);
  if (pan) {
    out.pan = pan;
    out.signalCount += 1;
  }

  const emp = findEmployerLine(text);
  if (emp) {
    out.employerLine = emp.slice(0, 100);
    out.signalCount += 1;
  }

  return out;
}

export function confidenceFromParsed(p: ParsedForm16, textLen: number): number {
  let base = 25 + Math.min(20, Math.floor(textLen / 800));
  base += p.signalCount * 12;
  return Math.min(95, Math.max(35, base));
}
