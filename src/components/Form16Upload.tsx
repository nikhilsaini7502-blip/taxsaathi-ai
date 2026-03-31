import { useCallback, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useMode } from '../context/ModeContext';
import { type ExtractedField } from '../lib/form16DemoExtract';
import type { TaxInputs } from '../lib/taxEngine';
import { cardShell, primaryGradientButton, progressFill, progressTrack } from '../lib/uiTokens';

export type { ExtractedField };

type FieldStatus = 'verified' | 'warning' | 'error';

function BadgeIcon({ status }: { status: FieldStatus }) {
  if (status === 'verified') {
    return (
      <svg className="size-3.5 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
          clipRule="evenodd"
        />
      </svg>
    );
  }
  if (status === 'warning') {
    return (
      <svg className="size-3.5 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
        <path
          fillRule="evenodd"
          d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 13a.75.75 0 01-.75-.75v-2.5a.75.75 0 011.5 0v2.5A.75.75 0 0110 13zm0-6a1 1 0 100 2 1 1 0 000-2z"
          clipRule="evenodd"
        />
      </svg>
    );
  }
  return (
    <svg className="size-3.5 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function StatusBadge({ status }: { status: FieldStatus }) {
  const styles: Record<FieldStatus, string> = {
    verified: 'bg-emerald-100 text-emerald-800 ring-emerald-200/80',
    warning: 'bg-amber-100 text-amber-900 ring-amber-200/80',
    error: 'bg-red-100 text-red-800 ring-red-200/80',
  };
  const labels: Record<FieldStatus, string> = {
    verified: 'Verified',
    warning: 'Review',
    error: 'Issue',
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 ${styles[status]}`}
    >
      <BadgeIcon status={status} />
      {labels[status]}
    </span>
  );
}

type Props = {
  onApplyToForm?: (patch: Partial<TaxInputs>) => void;
};

function UploadCloudIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
      />
    </svg>
  );
}

export function Form16Upload({ onApplyToForm }: Props) {
  const { isGenZ } = useMode();
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fields, setFields] = useState<ExtractedField[] | null>(null);
  const [confidencePct, setConfidencePct] = useState(72);
  const [applyPatch, setApplyPatch] = useState<Partial<TaxInputs> | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressPct, setProgressPct] = useState(0);
  const [progressLabel, setProgressLabel] = useState('');
  const [ocrNote, setOcrNote] = useState<string | null>(null);
  const [extractSource, setExtractSource] = useState<'ocr' | 'demo' | 'hybrid' | null>(null);

  const runExtract = useCallback(async (file: File) => {
    setFileName(file.name);
    setFields(null);
    setApplyPatch(null);
    setOcrNote(null);
    setExtractSource(null);
    setIsProcessing(true);
    setProgressPct(0);
    setProgressLabel('Starting…');

    const labelFor = (phase: string) => {
      if (phase === 'pdf_text') return 'Extracting PDF text…';
      if (phase === 'ocr_image') return 'Running OCR on image…';
      if (phase === 'ocr_pdf') return 'OCR on scanned PDF pages…';
      return 'Reading document…';
    };

    try {
      const { runForm16Ocr } = await import('../lib/form16Ocr');
      const result = await runForm16Ocr(file, (phase, ratio) => {
        setProgressLabel(labelFor(phase));
        setProgressPct(Math.round(ratio * 100));
      });
      setFields(result.fields);
      setApplyPatch(result.patch);
      setConfidencePct(result.confidencePct);
      setOcrNote(result.note ?? null);
      setExtractSource(result.source);
    } catch (e) {
      setFields(null);
      setApplyPatch(null);
      setOcrNote(
        e instanceof Error ? `Extraction failed: ${e.message}` : 'Extraction failed.'
      );
      setExtractSource('demo');
    } finally {
      setIsProcessing(false);
      setProgressPct(100);
    }
  }, []);

  const onPick = useCallback(
    (files: FileList | null) => {
      const f = files?.[0];
      if (!f) return;
      void runExtract(f);
    },
    [runExtract]
  );

  const shell = cardShell(isGenZ);

  const dropZone = isGenZ
    ? `rounded-2xl border-2 border-dashed px-5 py-10 text-center transition-all duration-300 ${
        isDragging
          ? 'border-fuchsia-500 bg-fuchsia-500/15 shadow-[0_0_24px_rgba(217,70,239,0.35)] scale-[1.01]'
          : 'border-violet-300/80 bg-violet-500/5 hover:border-fuchsia-400 hover:bg-fuchsia-500/10 hover:shadow-[0_0_20px_rgba(139,92,246,0.25)]'
      }`
    : `rounded-2xl border-2 border-dashed px-5 py-10 text-center transition-all duration-300 ${
        isDragging
          ? 'border-indigo-500 bg-indigo-50/80 shadow-[0_0_24px_rgba(99,102,241,0.35)] scale-[1.01]'
          : 'border-slate-300/80 bg-white/40 hover:border-indigo-400 hover:bg-indigo-50/50 hover:shadow-[0_0_20px_rgba(99,102,241,0.2)]'
      }`;

  const applyDemo = () => {
    if (!onApplyToForm || !applyPatch) return;
    onApplyToForm(applyPatch);
  };

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
            ? 'font-[family-name:var(--font-display)] text-xl font-bold text-violet-950'
            : 'text-xl font-semibold text-slate-800'
        }
      >
        {isGenZ ? '📄 Form 16 upload (OCR)' : 'Form 16 document upload'}
      </h2>
      <p className={isGenZ ? 'mt-1 text-sm text-violet-800/85' : 'mt-1 text-sm text-slate-500'}>
        {isGenZ
          ? 'PDF ya image — browser mein hi OCR + PDF text. Encrypted / poor scans = incomplete data.'
          : 'Upload a Form 16 PDF or image. We extract text in your browser (PDF.js + Tesseract OCR for scans), then parse common labels. Encrypted PDFs or bad scans may need manual checks.'}
      </p>

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,image/*"
        className="sr-only"
        onChange={(e) => {
          onPick(e.target.files);
          e.target.value = '';
        }}
      />

      <div
        className={`mt-5 ${dropZone}`}
        role="button"
        tabIndex={0}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          onPick(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
      >
        <motion.div
          className={
            isGenZ
              ? 'mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-500/20 to-violet-500/15 text-fuchsia-700 ring-1 ring-fuchsia-400/30'
              : 'mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/15 to-blue-500/15 text-indigo-600 ring-1 ring-indigo-500/20'
          }
          animate={isDragging ? { scale: [1, 1.08, 1], rotate: [0, -4, 4, 0] } : { y: [0, -3, 0] }}
          transition={isDragging ? { duration: 0.45 } : { duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <UploadCloudIcon className="size-8" />
        </motion.div>
        <p className={isGenZ ? 'text-sm font-semibold text-violet-900' : 'text-sm font-medium text-slate-700'}>
          {isGenZ ? 'Drag & drop Form 16 ya click karo' : 'Drag and drop Form 16 here, or click to browse'}
        </p>
        <p className={isGenZ ? 'mt-2 text-xs text-violet-700' : 'mt-2 text-xs text-slate-500'}>
          PDF, PNG, JPG · processed locally in your browser
        </p>
      </div>

      {isProcessing && (
        <div
          className={
            isGenZ
              ? 'mt-5 rounded-2xl border border-violet-200 bg-violet-50/80 px-4 py-3'
              : 'mt-5 rounded-xl border border-blue-100 bg-blue-50/70 px-4 py-3'
          }
        >
          <p className={isGenZ ? 'text-sm font-semibold text-violet-900' : 'text-sm font-medium text-blue-900'}>
            {progressLabel || 'Working…'}
          </p>
          <div className={progressTrack(isGenZ)}>
            <motion.div
              className={progressFill(isGenZ)}
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            />
          </div>
        </div>
      )}

      {fileName && !fields && !isProcessing && ocrNote && (
        <div
          className={
            isGenZ
              ? 'mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900'
              : 'mt-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800'
          }
        >
          <p>{ocrNote}</p>
          <button
            type="button"
            className={
              isGenZ
                ? 'mt-3 rounded-full border border-red-300 bg-white px-3 py-1.5 text-xs font-bold text-red-800'
                : 'mt-3 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-800'
            }
            onClick={() => {
              setFileName(null);
              setOcrNote(null);
            }}
          >
            {isGenZ ? 'Dismiss' : 'Dismiss'}
          </button>
        </div>
      )}

      {fileName && fields && (
        <div className="mt-6 space-y-5">
          <div
            className={
              isGenZ
                ? 'flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-violet-200 bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 px-4 py-3'
                : 'flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3'
            }
          >
            <div>
              <p className={isGenZ ? 'text-xs font-bold uppercase tracking-wide text-violet-700' : 'text-xs font-medium uppercase tracking-wide text-slate-500'}>
                {isGenZ ? 'File' : 'Uploaded file'}
              </p>
              <p className={isGenZ ? 'mt-0.5 text-sm font-semibold text-violet-950' : 'mt-0.5 text-sm font-medium text-slate-800'}>{fileName}</p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setFileName(null);
                setFields(null);
                setApplyPatch(null);
                setOcrNote(null);
                setExtractSource(null);
              }}
              className={
                isGenZ
                  ? 'rounded-full border border-violet-300 bg-white/80 px-3 py-1.5 text-xs font-bold text-violet-800 hover:bg-white'
                  : 'rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50'
              }
            >
              {isGenZ ? 'Clear' : 'Remove'}
            </button>
          </div>

          <div
            className={
              isGenZ
                ? 'rounded-2xl border border-amber-200/80 bg-amber-50/80 p-4'
                : 'rounded-xl border border-blue-100 bg-blue-50/60 p-4'
            }
          >
            <div className="flex items-center justify-between gap-3">
              <p className={isGenZ ? 'text-sm font-bold text-amber-950' : 'text-sm font-semibold text-blue-900'}>
                {isGenZ ? 'Data verified confidence' : 'Extraction confidence'}
              </p>
              <span className={isGenZ ? 'font-[family-name:var(--font-display)] text-lg font-extrabold text-violet-900' : 'text-lg font-bold text-blue-800'}>
                {confidencePct}%
              </span>
            </div>
            <p className={isGenZ ? 'mt-1 text-xs text-amber-900/80' : 'mt-1 text-xs text-slate-600'}>
              {isGenZ
                ? `${confidencePct}% confidence — ${extractSource === 'ocr' ? 'OCR + parse' : extractSource === 'hybrid' ? 'mixed OCR + fallback' : 'fallback mode'}.`
                : `${confidencePct}% estimated match quality${
                    extractSource === 'ocr'
                      ? ' (parsed from document text)'
                      : extractSource === 'hybrid'
                        ? ' (some fields from OCR, some estimated)'
                        : ' (limited text matched)'
                  }.`}
            </p>
            <div className={progressTrack(isGenZ)}>
              <motion.div
                className={progressFill(isGenZ)}
                initial={{ width: 0 }}
                animate={{ width: `${confidencePct}%` }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </div>

          <div>
            <p className={isGenZ ? 'mb-3 text-sm font-bold text-violet-900' : 'mb-3 text-sm font-medium text-slate-700'}>
              {isGenZ ? 'Extracted preview' : 'Extracted data preview'}
            </p>
            {ocrNote && (
              <p
                className={
                  isGenZ ? 'mb-3 rounded-xl border border-amber-200 bg-amber-50/90 px-3 py-2 text-xs text-amber-950' : 'mb-3 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-xs text-amber-900'
                }
              >
                {ocrNote}
              </p>
            )}
            <ul className="space-y-3">
              {fields.map((f) => (
                <li
                  key={f.id}
                  className={
                    isGenZ
                      ? 'flex flex-col gap-2 rounded-2xl border border-white/60 bg-white/60 px-4 py-3 sm:flex-row sm:items-start sm:justify-between'
                      : 'flex flex-col gap-2 rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3 sm:flex-row sm:items-start sm:justify-between'
                  }
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={isGenZ ? 'text-sm font-semibold text-violet-950' : 'text-sm font-medium text-slate-800'}>{f.label}</span>
                      <StatusBadge status={f.status} />
                    </div>
                    <p className={isGenZ ? 'mt-1 font-mono text-sm text-slate-800' : 'mt-1 font-mono text-sm text-slate-700'}>{f.value}</p>
                    {f.hint && (
                      <p className={isGenZ ? 'mt-1 text-xs text-violet-700/85' : 'mt-1 text-xs text-slate-500'}>{f.hint}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {onApplyToForm && applyPatch && (
            <motion.button
              type="button"
              onClick={applyDemo}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              className={`w-full ${primaryGradientButton(isGenZ)} py-3 text-center`}
            >
              {isGenZ ? 'Form mein ye values bhar do' : 'Apply extracted values to income form'}
            </motion.button>
          )}
        </div>
      )}
    </motion.section>
  );
}
