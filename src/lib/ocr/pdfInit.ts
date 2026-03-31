import * as pdfjsLib from 'pdfjs-dist';

let workerConfigured = false;

/** Call once before getDocument (browser). */
export function ensurePdfWorker(): void {
  if (workerConfigured) return;
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
  ).toString();
  workerConfigured = true;
}

export { pdfjsLib };
