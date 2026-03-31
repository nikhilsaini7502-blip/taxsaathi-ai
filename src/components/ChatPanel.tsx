import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AppMode } from '../context/ModeContext';
import { useMode } from '../context/ModeContext';
import { replyForQuestion } from '../lib/chatResponses';
import { cardShell, primaryGradientButton } from '../lib/uiTokens';

type Msg = { id: string; role: 'user' | 'assistant'; text: string };

function genId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function welcomeText(mode: AppMode): string {
  return mode === 'genz'
    ? "Yo, I'm TaxSaathi — tere tax doubts ka wingman. Puch: HRA, 80C, new regime… main roast nahi, clarity dunga (thoda roast bhi)."
    : 'Welcome to TaxSaathi AI. Ask concise questions about Indian income tax concepts such as HRA, Section 80C, or regime selection. This is general information, not personalized tax advice.';
}

function TypingDots({ isGenZ }: { isGenZ: boolean }) {
  const dot = isGenZ ? 'bg-fuchsia-500' : 'bg-indigo-500';
  return (
    <div className="flex items-center gap-1.5 px-1 py-0.5" aria-hidden>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className={`size-2 rounded-full ${dot}`}
          animate={{ y: [0, -5, 0], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
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
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollDown = useCallback(() => {
    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    });
  }, []);

  const send = useCallback(() => {
    const t = draft.trim();
    if (!t) return;
    setDraft('');
    setMessages((m) => [...m, { id: genId(), role: 'user', text: t }]);
    setIsTyping(true);
    scrollDown();
    window.setTimeout(() => {
      const answer = replyForQuestion(t, mode);
      setMessages((m) => [...m, { id: genId(), role: 'assistant', text: answer }]);
      setIsTyping(false);
      scrollDown();
    }, 650);
    scrollDown();
  }, [draft, mode, scrollDown]);

  const shell = `${cardShell(isGenZ)} flex min-h-[420px] flex-col overflow-hidden`;

  return (
    <motion.section
      className={shell}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <header
        className={
          isGenZ
            ? 'border-b border-fuchsia-200/50 bg-gradient-to-r from-fuchsia-500/10 via-violet-500/10 to-cyan-500/10 px-5 py-4 backdrop-blur-sm'
            : 'border-b border-slate-200/60 bg-white/50 px-5 py-4 backdrop-blur-sm'
        }
      >
        <h2
          className={
            isGenZ
              ? 'font-[family-name:var(--font-display)] text-lg font-bold tracking-tight text-violet-950'
              : 'text-lg font-semibold tracking-tight text-slate-800'
          }
        >
          {isGenZ ? '💬 Ask TaxSaathi anything' : 'Tax assistant chat'}
        </h2>
        <p className={isGenZ ? 'mt-1 text-sm text-violet-900/80' : 'mt-1 text-sm text-slate-600'}>
          {isGenZ
            ? 'No cap — keep it desi & specific for best answers.'
            : 'Educational responses only; consult a CA for complex cases.'}
        </p>
      </header>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto scroll-smooth px-4 py-4">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              layout
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className={
                msg.role === 'user'
                  ? isGenZ
                    ? 'ml-8 rounded-2xl rounded-br-md bg-gradient-to-br from-fuchsia-500 to-violet-600 px-4 py-3 text-sm text-white shadow-lg shadow-violet-500/20'
                    : 'ml-8 rounded-2xl rounded-br-md bg-gradient-to-r from-indigo-500 to-blue-600 px-4 py-3 text-sm text-white shadow-lg shadow-indigo-500/20'
                  : isGenZ
                    ? 'mr-6 rounded-2xl rounded-bl-md border border-white/50 bg-white/75 px-4 py-3 text-sm leading-relaxed text-slate-800 shadow-md backdrop-blur-sm'
                    : 'mr-6 rounded-2xl rounded-bl-md border border-white/40 bg-white/70 px-4 py-3 text-sm leading-relaxed text-slate-700 shadow-md backdrop-blur-sm'
              }
            >
              {msg.text}
            </motion.div>
          ))}
        </AnimatePresence>
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className={
              isGenZ
                ? 'mr-6 inline-flex items-center gap-2 rounded-2xl rounded-bl-md border border-amber-200/60 bg-amber-50/90 px-4 py-3 shadow-sm'
                : 'mr-6 inline-flex items-center gap-2 rounded-2xl rounded-bl-md border border-slate-200/60 bg-white/80 px-4 py-3 shadow-sm backdrop-blur-sm'
            }
          >
            <TypingDots isGenZ={isGenZ} />
            <span className="text-xs text-slate-500">{isGenZ ? 'Typing…' : 'Assistant is typing…'}</span>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      <div
        className={
          isGenZ
            ? 'border-t border-fuchsia-200/40 bg-white/55 p-4 backdrop-blur-md'
            : 'border-t border-slate-200/50 bg-white/55 p-4 backdrop-blur-md'
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
                ? 'min-w-0 flex-1 rounded-2xl border border-white/50 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-inner placeholder:text-violet-400 transition-all duration-200 focus:scale-[1.01] focus:border-fuchsia-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-300/50'
                : 'min-w-0 flex-1 rounded-2xl border border-white/50 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-inner placeholder:text-slate-400 transition-all duration-200 focus:scale-[1.01] focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/40'
            }
          />
          <motion.button type="button" onClick={send} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className={`shrink-0 ${primaryGradientButton(isGenZ)}`}>
            Send
          </motion.button>
        </div>
      </div>
    </motion.section>
  );
}
