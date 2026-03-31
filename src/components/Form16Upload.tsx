import { useCallback, useRef, useState } from 'react';
import { useMode } from '../context/ModeContext';
import type { TaxInputs } from '../lib/taxEngine';

type FieldStatus = 'verified' | 'warning' | 'error';

export type ExtractedField = {
  id: string;
  label: string;
  value: string;
  status: FieldStatus;
  hint?: string;
};

const CONFIDENCE_PCT = 72;

/** Demo extraction — not real OCR */
function mockExtractedFields(): ExtractedField[] {
  return [
    {
      id: 'gross',
      label: 'Gross salary (Part B)',
      value: '₹18,47,230',
      status: 'verified',
      hint: 'Matched Part B totals',
    },
    {
      id: 'tds',
      label: 'TDS deducted (total)',
      value: '₹2,14,800',
      status: 'verified',
      hint: 'Aligned with Form 16 summary',
    },
    {
      id: 'hra',
      label: 'House Rent Allowance (exempt)',
      value: '₹1,86,400',
      status: 'warning',
      hint: 'Table layout fuzzy — please confirm',
    },
    {
      id: 'pan',
      label: 'Employee PAN',
      value: 'ABCDE1234F',
      status: 'verified',
    },
    {
      id: 'employer',
      label: 'Employer name & TAN',
      value: 'Acme India Pvt Ltd · DELH12345A',
      status: 'warning',
      hint: 'TAN OCR confidence medium',
    },
    {
      id: '80c',
      label: 'Chapter VI-A (80C declared)',
      value: '₹1,50,000',
      status: 'error',
      hint: 'Annexure crop cut off — manual check',
    },
  ];
}

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

export function Form16Upload({ onApplyToForm }: Props) {
  const { isGenZ } = useMode();
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fields, setFields] = useState<ExtractedField[] | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const runFakeExtract = useCallback((name: string) => {
    setFileName(name);
    setFields(mockExtractedFields());
  }, []);

  const onPick = useCallback(
    (files: FileList | null) => {
      const f = files?.[0];
      if (!f) return;
      runFakeExtract(f.name);
    },
    [runFakeExtract]
  );

  const shell = isGenZ
    ? 'rounded-3xl border-2 border-white/50 bg-white/75 shadow-xl shadow-fuchsia-500/10 backdrop-blur-xl'
    : 'rounded-2xl border border-slate-200/80 bg-white shadow-lg shadow-slate-200/40';

  const dropZone = isGenZ
    ? `rounded-2xl border-2 border-dashed px-5 py-10 text-center transition ${
        isDragging
          ? 'border-fuchsia-500 bg-fuchsia-500/10'
          : 'border-violet-300 bg-violet-500/5 hover:border-fuchsia-400 hover:bg-fuchsia-500/5'
      }`
    : `rounded-xl border-2 border-dashed px-5 py-10 text-center transition ${
        isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-slate-50/50 hover:border-blue-400 hover:bg-blue-50/30'
      }`;

  const applyDemo = () => {
    if (!onApplyToForm) return;
    onApplyToForm({
      grossSalary: 18_47_230,
      hraReceived: 2_40_000,
      investment80C: 1_50_000,
    });
  };

  return (
    <section className={shell}>
      <h2
        className={
          isGenZ
            ? 'font-[family-name:var(--font-display)] text-xl font-bold text-violet-950'
            : 'text-xl font-semibold text-slate-800'
        }
      >
        {isGenZ ? 'Form 16 upload (demo OCR)' : 'Form 16 document upload'}
      </h2>
      <p className={isGenZ ? 'mt-1 text-sm text-violet-800/85' : 'mt-1 text-sm text-slate-500'}>
        {isGenZ
          ? 'PDF daalo, hum pretend-parse karenge — real world mein encrypted PDFs alag game hain.'
          : 'Upload a PDF or image for demonstration. Parsing is simulated; no file leaves your browser.'}
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
        <p className={isGenZ ? 'text-sm font-semibold text-violet-900' : 'text-sm font-medium text-slate-700'}>
          {isGenZ ? 'Drag & drop Form 16 ya click karo' : 'Drag and drop Form 16 here, or click to browse'}
        </p>
        <p className={isGenZ ? 'mt-2 text-xs text-violet-700' : 'mt-2 text-xs text-slate-500'}>PDF, PNG, JPG · demo only</p>
      </div>

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
                {CONFIDENCE_PCT}%
              </span>
            </div>
            <p className={isGenZ ? 'mt-1 text-xs text-amber-900/80' : 'mt-1 text-xs text-slate-600'}>
              {isGenZ
                ? `${CONFIDENCE_PCT}% data verified — baaki fields pe human eye test, boss.`
                : `${CONFIDENCE_PCT}% data verified against layout heuristics (simulated cross-check).`}
            </p>
            <div className={isGenZ ? 'mt-3 h-3 overflow-hidden rounded-full bg-violet-200/70' : 'mt-3 h-2.5 overflow-hidden rounded-full bg-slate-200'}>
              <div
                className={
                  isGenZ
                    ? 'h-full rounded-full bg-gradient-to-r from-emerald-500 via-amber-400 to-amber-500 transition-[width] duration-700'
                    : 'h-full rounded-full bg-gradient-to-r from-blue-600 to-blue-400 transition-[width] duration-700'
                }
                style={{ width: `${CONFIDENCE_PCT}%` }}
              />
            </div>
          </div>

          <div>
            <p className={isGenZ ? 'mb-3 text-sm font-bold text-violet-900' : 'mb-3 text-sm font-medium text-slate-700'}>
              {isGenZ ? 'Extracted preview (fake but fancy)' : 'Extracted data preview'}
            </p>
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

          {onApplyToForm && (
            <button
              type="button"
              onClick={applyDemo}
              className={
                isGenZ
                  ? 'w-full rounded-2xl bg-gradient-to-r from-fuchsia-500 to-violet-600 py-3 text-sm font-bold text-white shadow-lg shadow-fuchsia-500/25 transition hover:brightness-110'
                  : 'w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700'
              }
            >
              {isGenZ ? 'Form mein demo numbers bhar do' : 'Apply demo values to income form'}
            </button>
          )}
        </div>
      )}
    </section>
  );
}
