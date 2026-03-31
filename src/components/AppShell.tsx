import { useEffect, useState, type ReactNode } from 'react';
import { useMode } from '../context/ModeContext';
import { ModeToggle } from './ModeToggle';
import { TaxSaathiLogo } from './TaxSaathiLogo';
import { IconClose, IconDashboard, IconMenu, IconOptimizer } from './navIcons';

export type ShellView = 'dashboard' | 'optimizer';

type NavItem = {
  id: ShellView;
  label: string;
  labelGenZ: string;
  icon: typeof IconDashboard;
};

const NAV: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', labelGenZ: 'Workspace', icon: IconDashboard },
  { id: 'optimizer', label: 'Tax optimizer', labelGenZ: 'Savings optimizer', icon: IconOptimizer },
];

type Props = {
  view: ShellView;
  onViewChange: (v: ShellView) => void;
  children: ReactNode;
};

export function AppShell({ view, onViewChange, children }: Props) {
  const { isGenZ } = useMode();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = mobileNavOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileNavOpen]);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const close = () => setMobileNavOpen(false);
    mq.addEventListener('change', close);
    return () => mq.removeEventListener('change', close);
  }, []);

  const navigate = (v: ShellView) => {
    onViewChange(v);
    setMobileNavOpen(false);
  };

  const sidebarBase =
    'flex w-[min(17.5rem,85vw)] shrink-0 flex-col border-r transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] lg:translate-x-0';

  const sidebarPro = 'border-slate-200/80 bg-white lg:bg-slate-950 lg:border-slate-800/80';
  const sidebarGenZ =
    'border-violet-200/40 bg-white/95 backdrop-blur-xl lg:bg-gradient-to-b lg:from-slate-950 lg:via-violet-950 lg:to-slate-950 lg:border-violet-500/20';

  const sidebarClass = `${sidebarBase} ${isGenZ ? sidebarGenZ : sidebarPro} fixed left-0 top-14 bottom-0 z-50 lg:static lg:top-auto lg:bottom-auto lg:min-h-[calc(100dvh-3.5rem)] ${
    mobileNavOpen ? 'translate-x-0 shadow-2xl shadow-slate-900/10' : '-translate-x-full lg:translate-x-0'
  }`;

  const navInactive = isGenZ
    ? 'text-slate-600 hover:bg-violet-50 hover:text-violet-950 lg:text-violet-200/80 lg:hover:bg-white/10 lg:hover:text-white'
    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 lg:text-slate-400 lg:hover:bg-white/5 lg:hover:text-slate-100';

  const navActiveBg = isGenZ ? 'bg-gradient-to-r from-fuchsia-600 to-violet-600 shadow-md shadow-violet-600/25' : 'bg-blue-600 shadow-md shadow-blue-600/20';

  const headerClass = isGenZ
    ? 'border-b border-violet-200/30 bg-white/80 shadow-sm shadow-violet-500/5 backdrop-blur-xl'
    : 'border-b border-slate-200/90 bg-white/95 shadow-sm backdrop-blur-md';

  const mainBg = isGenZ
    ? 'bg-gradient-to-br from-violet-50/90 via-white to-amber-50/40 genz-noise'
    : 'bg-gradient-to-b from-slate-50 to-slate-100/80';

  return (
    <div className={`flex min-h-screen flex-col ${isGenZ ? 'text-slate-900' : 'text-slate-900'}`}>
      <header className={`sticky top-0 z-40 ${headerClass}`}>
        <div className="flex h-14 items-center justify-between gap-3 px-3 sm:px-4 lg:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setMobileNavOpen((o) => !o)}
              className={
                isGenZ
                  ? 'flex size-10 items-center justify-center rounded-xl text-violet-900 transition hover:bg-violet-100 lg:hidden'
                  : 'flex size-10 items-center justify-center rounded-xl text-slate-700 transition hover:bg-slate-100 lg:hidden'
              }
              aria-expanded={mobileNavOpen}
              aria-label={mobileNavOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileNavOpen ? <IconClose /> : <IconMenu />}
            </button>
            <TaxSaathiLogo className="min-w-0" />
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <ModeToggle variant="header" />
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Mobile overlay */}
        <button
          type="button"
          aria-label="Close navigation"
          className={`fixed bottom-0 left-0 right-0 top-14 z-40 bg-slate-950/45 backdrop-blur-[2px] transition-opacity duration-300 ease-out lg:hidden ${
            mobileNavOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
          }`}
          onClick={() => setMobileNavOpen(false)}
        />

        <aside className={sidebarClass} aria-label="Main navigation">
          <div className={`flex h-12 items-center justify-between border-b px-4 lg:hidden ${isGenZ ? 'border-violet-200/60' : 'border-slate-200/80'}`}>
            <span className={`text-xs font-semibold uppercase tracking-wider ${isGenZ ? 'text-violet-800' : 'text-slate-500'}`}>Menu</span>
            <button
              type="button"
              onClick={() => setMobileNavOpen(false)}
              className={`rounded-lg p-2 ${isGenZ ? 'text-violet-800 hover:bg-violet-100' : 'text-slate-600 hover:bg-slate-100'}`}
              aria-label="Close menu"
            >
              <IconClose className="size-5" />
            </button>
          </div>
          <nav className="flex flex-1 flex-col gap-1 p-3 lg:mt-2 lg:p-4" aria-label="Primary">
            <p
              className={`mb-2 hidden px-3 text-[10px] font-semibold uppercase tracking-[0.2em] lg:block ${
                isGenZ ? 'text-violet-300/60' : 'text-slate-500'
              }`}
            >
              Navigate
            </p>
            {NAV.map((item) => {
              const Icon = item.icon;
              const active = view === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigate(item.id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                    active
                      ? `${navActiveBg} text-white focus-visible:ring-white/40 ${isGenZ ? 'focus-visible:ring-offset-violet-950' : 'focus-visible:ring-offset-slate-950'}`
                      : `${navInactive} focus-visible:ring-blue-500/40 focus-visible:ring-offset-white lg:focus-visible:ring-offset-slate-950`
                  }`}
                >
                  <Icon className={`size-5 shrink-0 ${active ? 'text-white' : 'opacity-80 lg:opacity-100'}`} />
                  <span className="truncate">{isGenZ ? item.labelGenZ : item.label}</span>
                </button>
              );
            })}
          </nav>
          <div className={`mt-auto hidden border-t p-4 lg:block ${isGenZ ? 'border-violet-500/20' : 'border-slate-800'}`}>
            <p className={`text-[10px] leading-relaxed ${isGenZ ? 'text-violet-300/50' : 'text-slate-400'}`}>
              {isGenZ ? 'India · tax education demo' : 'India · illustrative tax tools'}
            </p>
          </div>
        </aside>

        <main className={`relative min-h-[calc(100vh-3.5rem)] flex-1 overflow-x-hidden overflow-y-auto ${mainBg}`}>
          <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
