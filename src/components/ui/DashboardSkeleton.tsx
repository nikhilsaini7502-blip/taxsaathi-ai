import { useMode } from '../../context/ModeContext';

/** Lightweight placeholder while dashboard panels hydrate */
export function DashboardSkeleton() {
  const { isGenZ } = useMode();
  const bar = isGenZ
    ? 'rounded-2xl border border-white/30 bg-white/40 p-6 shadow-md backdrop-blur-sm'
    : 'rounded-2xl border border-white/30 bg-white/50 p-6 shadow-md backdrop-blur-sm';
  const pulse = 'animate-pulse bg-gradient-to-r from-slate-200/80 via-slate-100/80 to-slate-200/80';

  return (
    <div className="grid gap-8 lg:grid-cols-2" aria-busy="true" aria-label="Loading dashboard">
      <div className="flex flex-col gap-8">
        <div className={bar}>
          <div className={`h-6 w-1/3 rounded-lg ${pulse}`} />
          <div className={`mt-4 h-28 w-full rounded-xl ${pulse}`} />
        </div>
        <div className={bar}>
          <div className={`h-6 w-2/5 rounded-lg ${pulse}`} />
          <div className={`mt-4 h-40 w-full rounded-xl ${pulse}`} />
        </div>
        <div className={bar}>
          <div className={`h-6 w-1/2 rounded-lg ${pulse}`} />
          <div className={`mt-4 grid grid-cols-2 gap-3`}>
            <div className={`h-12 rounded-xl ${pulse}`} />
            <div className={`h-12 rounded-xl ${pulse}`} />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-8">
        <div className={bar}>
          <div className={`h-6 w-2/5 rounded-lg ${pulse}`} />
          <div className={`mt-4 h-32 w-full rounded-xl ${pulse}`} />
        </div>
        <div className={bar}>
          <div className={`h-6 w-1/3 rounded-lg ${pulse}`} />
          <div className={`mt-4 space-y-3`}>
            <div className={`h-10 w-full rounded-xl ${pulse}`} />
            <div className={`h-10 w-full rounded-xl ${pulse}`} />
            <div className={`h-10 w-full rounded-xl ${pulse}`} />
          </div>
        </div>
      </div>
    </div>
  );
}
