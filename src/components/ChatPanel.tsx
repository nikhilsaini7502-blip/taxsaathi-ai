import { useCallback, useEffect, useRef, useState } from 'react';
import type { AppMode } from '../context/ModeContext';
import { useMode } from '../context/ModeContext';
import { replyForQuestion } from '../lib/chatResponses';

type Msg = { id: string; role: 'user' | 'assistant'; text: string };

function genId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function welcomeText(mode: AppMode): string {
  return mode === 'genz'
    ? "Yo, I'm TaxSaathi — tere tax doubts ka wingman. Puch: HRA, 80C, new regime… main roast nahi, clarity dunga (thoda roast bhi)."
    : 'Welcome to TaxSaathi AI. Ask concise questions about Indian income tax concepts such as HRA, Section 80C, or regime selection. This is general information, not personalized tax advice.';
}

export function ChatPanel() {
  const { mode, isGenZ } = useMode();
  const [messages, setMessages] = useState<Msg[]>(() => [
    { id: 'welcome', role: 'assistant', text: welcomeText(mode) },
  ]);

  useEffect(() => {
    setMessages((prev) => {
      const first = prev[0];
      if (first?.id === 'welcome') {
        return [{ ...first, text: welcomeText(mode) }, ...prev.slice(1)];
      }
      return prev;
    });
  }, [mode]);
  const [draft, setDraft] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollDown = useCallback(() => {
    requestAnimationFrame(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }));
  }, []);

  const send = useCallback(() => {
    const t = draft.trim();
    if (!t) return;
    setDraft('');
    setMessages((m) => [...m, { id: genId(), role: 'user', text: t }]);
    setTimeout(() => {
      const answer = replyForQuestion(t, mode);
      setMessages((m) => [...m, { id: genId(), role: 'assistant', text: answer }]);
      scrollDown();
    }, 380);
    scrollDown();
  }, [draft, mode, scrollDown]);

  const shell = isGenZ
    ? 'rounded-3xl border-2 border-white/50 bg-white/75 shadow-xl shadow-fuchsia-500/10 backdrop-blur-xl'
    : 'rounded-2xl border border-slate-200/80 bg-white shadow-lg shadow-slate-200/50';

  return (
    <section className={shell + ' flex min-h-[420px] flex-col overflow-hidden'}>
      <header
        className={
          isGenZ
            ? 'border-b border-fuchsia-200/60 bg-gradient-to-r from-fuchsia-500/10 via-violet-500/10 to-amber-300/20 px-5 py-4'
            : 'border-b border-slate-100 bg-slate-50/80 px-5 py-4'
        }
      >
        <h2
          className={
            isGenZ
              ? 'font-[family-name:var(--font-display)] text-lg font-bold tracking-tight text-violet-900'
              : 'text-lg font-semibold tracking-tight text-slate-800'
          }
        >
          {isGenZ ? 'Ask TaxSaathi anything ✨' : 'Tax assistant chat'}
        </h2>
        <p className={isGenZ ? 'mt-1 text-sm text-violet-800/80' : 'mt-1 text-sm text-slate-500'}>
          {isGenZ
            ? 'No cap — keep it desi & specific for best answers.'
            : 'Educational responses only; consult a CA for complex cases.'}
        </p>
      </header>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={
              msg.role === 'user'
                ? isGenZ
                  ? 'ml-8 rounded-2xl rounded-br-md bg-gradient-to-br from-fuchsia-500 to-violet-600 px-4 py-3 text-sm text-white shadow-md'
                  : 'ml-8 rounded-xl rounded-br-sm bg-blue-600 px-4 py-3 text-sm text-white shadow-sm'
                : isGenZ
                  ? 'mr-6 rounded-2xl rounded-bl-md border border-amber-200/80 bg-amber-50/90 px-4 py-3 text-sm leading-relaxed text-slate-800'
                  : 'mr-6 rounded-xl rounded-bl-sm border border-slate-100 bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-700'
            }
          >
            {msg.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div
        className={
          isGenZ
            ? 'border-t border-fuchsia-200/50 bg-white/60 p-4 backdrop-blur-sm'
            : 'border-t border-slate-100 bg-slate-50/50 p-4'
        }
      >
        <div className="flex gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder={isGenZ ? 'Try: “80C kya hai?”' : 'e.g. Explain HRA exemption rules'}
            className={
              isGenZ
                ? 'min-w-0 flex-1 rounded-2xl border-2 border-violet-200 bg-white/90 px-4 py-3 text-sm text-slate-900 placeholder:text-violet-400 focus:border-fuchsia-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-300/50'
                : 'min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100'
            }
          />
          <button
            type="button"
            onClick={send}
            className={
              isGenZ
                ? 'shrink-0 rounded-2xl bg-gradient-to-r from-fuchsia-500 to-violet-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-fuchsia-500/30 transition hover:brightness-110 active:scale-[0.98]'
                : 'shrink-0 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98]'
            }
          >
            Send
          </button>
        </div>
      </div>
    </section>
  );
}
