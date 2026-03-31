/**
 * Run: npx tsx scripts/inspect-samples.mjs
 * Uses the real parseForm16Text from src.
 */
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { pathToFileURL } from 'url';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { createWorker } from 'tesseract.js';
import { parseForm16Text } from '../src/lib/ocr/parseForm16Text.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

pdfjsLib.GlobalWorkerOptions.workerSrc = pathToFileURL(
  join(root, 'node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs')
).href;

async function pdfText(path) {
  const data = new Uint8Array(readFileSync(path));
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  let out = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const tc = await page.getTextContent();
    out += tc.items.map((it) => ('str' in it ? it.str : '')).join(' ') + '\n';
  }
  return out.trim();
}

async function ocrImage(path) {
  const worker = await createWorker('eng');
  try {
    const {
      data: { text },
    } = await worker.recognize(path);
    return text;
  } finally {
    await worker.terminate();
  }
}

async function main() {
  const pdfPath = join(root, 'sample 2.pdf');
  const jpegPath = join(root, 'sample 1.jpeg');

  console.log('=== sample 2.pdf ===\n');
  const t2 = await pdfText(pdfPath);
  const p2 = parseForm16Text(t2);
  console.log('parse:', p2);
  console.log('\nExpected (from document): Gross 600000, TDS 20000, HRA 120000, 80C 150000, Employee PAN ABCDE1234F, Employer ABC Technologies');

  console.log('\n\n=== sample 1.jpeg (OCR quality varies) ===\n');
  const t1 = await ocrImage(jpegPath);
  const p1 = parseForm16Text(t1);
  console.log('parse:', p1);
}

main().catch(console.error);
