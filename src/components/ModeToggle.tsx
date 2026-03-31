import { useMode } from '../context/ModeContext';

type Props = {
  /** Compact style for top app bar */
  variant?: 'default' | 'header';
};

export function ModeToggle({ variant = 'default' }: Props) {
  const { mode, setMode, isGenZ } = useMode();
  const header = variant === 'header';

  return (
    <div
      className={
        header
          ? isGenZ
            ? 'inline-flex rounded-full border border-violet-200/80 bg-violet-50/80 p-0.5 shadow-sm'
            : 'inline-flex rounded-full border border-slate-200 bg-slate-50 p-0.5 shadow-sm'
          : isGenZ
            ? 'inline-flex rounded-full border-2 border-white/40 bg-white/20 p-1 shadow-lg backdrop-blur-md'
            : 'inline-flex rounded-lg border border-slate-200 bg-slate-100 p-1 shadow-inner'
      }
      role="group"
      aria-label="Theme mode"
    >
      <button
        type="button"
        onClick={() => setMode('genz')}
        className={
          mode === 'genz'
            ? header
              ? isGenZ
                ? 'rounded-full bg-gradient-to-r from-fuchsia-500 via-violet-500 to-amber-400 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-all duration-200'
                : 'rounded-full bg-gradient-to-r from-fuchsia-500 via-violet-500 to-violet-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-all duration-200'
              : 'rounded-full bg-gradient-to-r from-fuchsia-500 via-violet-500 to-amber-400 px-5 py-2 text-sm font-bold text-white shadow-md transition-all duration-200'
            : header
              ? 'rounded-full px-3 py-1.5 text-xs font-medium text-slate-500 transition-all duration-200 hover:text-slate-800'
              : 'rounded-full px-5 py-2 text-sm font-medium text-slate-600 transition-all duration-200 hover:text-slate-900'
        }
      >
        {header ? 'GenZ' : 'GenZ Mode'}
      </button>
      <button
        type="button"
        onClick={() => setMode('professional')}
        className={
          mode === 'professional'
            ? header
              ? isGenZ
                ? 'rounded-full bg-white px-3 py-1.5 text-xs font-bold text-violet-800 shadow-sm ring-1 ring-violet-200 transition-all duration-200'
                : 'rounded-full bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all duration-200'
              : isGenZ
                ? 'rounded-full bg-white/90 px-5 py-2 text-sm font-bold text-violet-800 shadow transition-all duration-200'
                : 'rounded-md bg-white px-5 py-2 text-sm font-semibold text-blue-700 shadow-sm ring-1 ring-blue-100 transition-all duration-200'
            : header
              ? 'rounded-full px-3 py-1.5 text-xs font-medium text-slate-500 transition-all duration-200 hover:text-slate-800'
              : 'rounded-full px-5 py-2 text-sm font-medium text-slate-600 transition-all duration-200 hover:text-slate-900'
        }
      >
        {header ? 'Pro' : 'Professional'}
      </button>
    </div>
  );
}
