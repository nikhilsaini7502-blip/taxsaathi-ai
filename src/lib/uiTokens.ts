import type { AppMode } from '../context/ModeContext';

/** Shared SaaS-style surfaces — Tailwind-only, mode-aware */
export function cardShell(isGenZ: boolean): string {
  if (isGenZ) {
    return [
      'rounded-2xl border border-white/30 bg-white/70 p-6 shadow-md backdrop-blur-md',
      'transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-fuchsia-500/10',
      'hover:border-fuchsia-300/50',
    ].join(' ');
  }
  return [
    'rounded-2xl border border-white/30 bg-white/70 p-6 shadow-md backdrop-blur-md',
    'transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10',
    'hover:border-indigo-200/60',
  ].join(' ');
}

export function primaryGradientButton(isGenZ: boolean): string {
  if (isGenZ) {
    return [
      'rounded-2xl bg-gradient-to-r from-fuchsia-500 via-violet-500 to-indigo-500',
      'px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25',
      'transition-all duration-200 hover:scale-105 active:scale-95',
      'hover:shadow-xl hover:shadow-violet-500/30',
    ].join(' ');
  }
  return [
    'rounded-2xl bg-gradient-to-r from-indigo-500 to-blue-600',
    'px-5 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-500/20',
    'transition-all duration-200 hover:scale-105 active:scale-95',
    'hover:shadow-xl hover:shadow-indigo-500/30',
  ].join(' ');
}

export function mainPageGradient(mode: AppMode): string {
  if (mode === 'genz') {
    return 'bg-gradient-to-br from-fuchsia-100/80 via-violet-50/90 to-cyan-50/70 genz-noise';
  }
  return 'bg-gradient-to-br from-slate-50 via-slate-100/95 to-indigo-50/40';
}

export function progressTrack(isGenZ: boolean): string {
  return isGenZ
    ? 'h-3 overflow-hidden rounded-full bg-violet-200/60 shadow-inner'
    : 'h-3 overflow-hidden rounded-full bg-slate-200/90 shadow-inner';
}

export function progressFill(isGenZ: boolean): string {
  if (isGenZ) {
    return [
      'h-full rounded-full bg-gradient-to-r from-fuchsia-500 via-violet-500 to-cyan-400',
      'shadow-[0_0_12px_rgba(168,85,247,0.45)]',
      'transition-[width] duration-700 ease-out',
    ].join(' ');
  }
  return [
    'h-full rounded-full bg-gradient-to-r from-indigo-500 to-blue-500',
    'shadow-[0_0_10px_rgba(99,102,241,0.5)]',
    'transition-[width] duration-700 ease-out',
  ].join(' ');
}
