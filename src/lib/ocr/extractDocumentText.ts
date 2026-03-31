import { createWorker, type Worker as TesseractWorker } from 'tesseract.js';
import type { PDFPageProxy } from 'pdfjs-dist';
import { ensurePdfWorker, pdfjsLib } from './pdfInit';

const MIN_TEXT_FOR_TEXT_ONLY = 450;
const MAX_OCR_PAGES = 2;
const RENDER_SCALE = 2;

async function pageToImageText(page: PDFPageProxy, worker: TesseractWorker): Promise<string> {
  const viewport = page.getViewport({ scale: RENDER_SCALE });
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const task = page.render({ canvas, canvasContext: ctx, viewport });
  await task.promise;
  const {
    data: { text },
  } = await worker.recognize(canvas);
  return text;
}

export type ExtractProgress = (phase: string, ratio: number) => void;

/**
 * PDF: text layer first; if sparse, OCR first pages. Images: OCR only.
 */
export async function extractDocumentText(
  file: File,
  onProgress?: ExtractProgress
): Promise<string> {
  const isPdf =
    file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

  if (!isPdf) {
    onProgress?.('ocr_image', 0.1);
    const worker = await createWorker('eng', undefined, {
      logger: (m) => {
        if (m.status === 'recognizing text') onProgress?.('ocr_image', 0.1 + 0.85 * (m.progress ?? 0));
      },
    });
    try {
      const url = URL.createObjectURL(file);
      const {
        data: { text },
      } = await worker.recognize(url);
      URL.revokeObjectURL(url);
      onProgress?.('ocr_image', 1);
      return text;
    } finally {
      await worker.terminate();
    }
  }

  ensurePdfWorker();
  onProgress?.('pdf_text', 0.05);
  const data = new Uint8Array(await file.arrayBuffer());
  const loadingTask = pdfjsLib.getDocument({ data, stopAtErrors: false });
  const pdf = await loadingTask.promise;

  let textLayer = '';
  const n = pdf.numPages;
  for (let i = 1; i <= n; i++) {
    onProgress?.('pdf_text', 0.05 + 0.35 * (i / n));
    const page = await pdf.getPage(i);
    const tc = await page.getTextContent();
    const line = tc.items.map((it) => ('str' in it ? it.str : '')).join(' ');
    textLayer += line + '\n';
  }

  const trimmed = textLayer.trim();
  const needOcr = trimmed.length < MIN_TEXT_FOR_TEXT_ONLY || !/\d{4,}/.test(trimmed);

  if (!needOcr) {
    onProgress?.('pdf_text', 1);
    return trimmed;
  }

  onProgress?.('ocr_pdf', 0.4);
  const worker = await createWorker('eng', undefined, {
    logger: (m) => {
      if (m.status === 'recognizing text') onProgress?.('ocr_pdf', 0.4 + 0.55 * (m.progress ?? 0));
    },
  });
  try {
    let ocrCombined = '';
    const pagesToScan = Math.min(MAX_OCR_PAGES, n);
    for (let i = 1; i <= pagesToScan; i++) {
      onProgress?.('ocr_pdf', 0.4 + 0.55 * ((i - 1) / pagesToScan));
      const page = await pdf.getPage(i);
      const t = await pageToImageText(page, worker);
      ocrCombined += t + '\n';
    }
    onProgress?.('ocr_pdf', 1);
    const merged = `${trimmed}\n${ocrCombined}`;
    return merged.trim();
  } finally {
    await worker.terminate();
  }
}
