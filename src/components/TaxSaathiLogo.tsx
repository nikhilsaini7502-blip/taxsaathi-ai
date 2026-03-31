type Props = {
  className?: string;
  compact?: boolean;
};

export function TaxSaathiLogo({ className = '', compact }: Props) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div
        className={
          compact
            ? 'flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 shadow-md shadow-blue-600/20'
            : 'flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 shadow-lg shadow-blue-600/25'
        }
        aria-hidden
      >
        <svg className="size-[52%] text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 6.5h16M4 12h10M4 17.5h14" />
          <path d="M17.5 8.5L21 12l-3.5 3.5V8.5z" fill="currentColor" stroke="none" />
        </svg>
      </div>
      {!compact && (
        <div className="flex flex-col leading-none">
          <span className="font-[family-name:var(--font-display)] text-base font-bold tracking-tight text-slate-900">TaxSaathi</span>
          <span className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400">AI</span>
        </div>
      )}
      {compact && (
        <span className="font-[family-name:var(--font-display)] text-sm font-bold tracking-tight text-slate-900">TaxSaathi</span>
      )}
    </div>
  );
}
