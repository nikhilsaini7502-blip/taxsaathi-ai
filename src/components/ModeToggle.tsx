import { motion } from 'framer-motion';
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
            ? 'inline-flex rounded-full border border-white/50 bg-white/60 p-0.5 shadow-md backdrop-blur-md'
            : 'inline-flex rounded-full border border-white/50 bg-white/60 p-0.5 shadow-md backdrop-blur-md'
          : isGenZ
            ? 'inline-flex rounded-2xl border border-white/40 bg-white/30 p-1 shadow-lg backdrop-blur-md'
            : 'inline-flex rounded-2xl border border-white/40 bg-white/40 p-1 shadow-inner backdrop-blur-sm'
      }
      role="group"
      aria-label="Theme mode"
    >
      <motion.button
        type="button"
        onClick={() => setMode('genz')}
        whileTap={{ scale: 0.95 }}
        className={
          mode === 'genz'
            ? header
              ? 'rounded-full bg-gradient-to-r from-fuchsia-500 via-violet-500 to-indigo-500 px-3 py-1.5 text-xs font-bold text-white shadow-md'
              : 'rounded-full bg-gradient-to-r from-fuchsia-500 via-violet-500 to-indigo-500 px-5 py-2 text-sm font-bold text-white shadow-md'
            : header
              ? 'rounded-full px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:text-slate-900'
              : 'rounded-full px-5 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900'
        }
      >
        {header ? 'GenZ' : 'GenZ Mode'}
      </motion.button>
      <motion.button
        type="button"
        onClick={() => setMode('professional')}
        whileTap={{ scale: 0.95 }}
        className={
          mode === 'professional'
            ? header
              ? 'rounded-full bg-gradient-to-r from-indigo-500 to-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-md'
              : 'rounded-full bg-gradient-to-r from-indigo-500 to-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-md'
            : header
              ? 'rounded-full px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:text-slate-900'
              : 'rounded-full px-5 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900'
        }
      >
        {header ? 'Pro' : 'Professional'}
      </motion.button>
    </div>
  );
}
