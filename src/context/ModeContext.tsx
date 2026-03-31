import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

export type AppMode = 'genz' | 'professional';

type ModeContextValue = {
  mode: AppMode;
  setMode: (m: AppMode) => void;
  isGenZ: boolean;
};

const ModeContext = createContext<ModeContextValue | null>(null);

export function ModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<AppMode>('professional');

  const value = useMemo(
    () => ({
      mode,
      setMode,
      isGenZ: mode === 'genz',
    }),
    [mode]
  );

  return <ModeContext.Provider value={value}>{children}</ModeContext.Provider>;
}

export function useMode() {
  const ctx = useContext(ModeContext);
  if (!ctx) throw new Error('useMode inside ModeProvider');
  return ctx;
}
