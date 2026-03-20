'use client';

import { useState, useEffect } from 'react';

const THINKING_MESSAGES = [
  { text: 'Understanding your request...', icon: '🧠' },
  { text: 'Planning the best approach...', icon: '🗺️' },
  { text: 'Getting things ready...', icon: '⚡' },
  { text: 'Connecting to the site...', icon: '🔗' },
  { text: 'Almost there...', icon: '✨' },
];

export function ThinkingIndicator() {
  const [messageIndex, setMessageIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setMessageIndex((i) => (i + 1) % THINKING_MESSAGES.length);
        setVisible(true);
      }, 300);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  const msg = THINKING_MESSAGES[messageIndex];

  return (
    <div className="flex items-start gap-3.5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-violet-500 shadow-md shadow-primary/20">
        <svg className="h-3.5 w-3.5 text-white animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>

      <div className="flex-1 rounded-2xl rounded-tl-md bg-white/[0.03] ring-1 ring-white/[0.06] px-5 py-4">
        {/* Shimmer skeleton lines */}
        <div className="space-y-3">
          <div
            className={`flex items-center gap-2.5 transition-all duration-300 ${
              visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1'
            }`}
          >
            <span className="text-base">{msg.icon}</span>
            <span className="text-[13px] font-medium text-zinc-300">{msg.text}</span>
          </div>

          {/* Animated skeleton bars */}
          <div className="space-y-2 pt-1">
            <div className="h-2 w-3/4 rounded-full bg-gradient-to-r from-white/[0.04] via-white/[0.08] to-white/[0.04] bg-[length:200%_100%] animate-shimmer" />
            <div className="h-2 w-1/2 rounded-full bg-gradient-to-r from-white/[0.04] via-white/[0.08] to-white/[0.04] bg-[length:200%_100%] animate-shimmer" style={{ animationDelay: '0.15s' }} />
            <div className="h-2 w-2/3 rounded-full bg-gradient-to-r from-white/[0.04] via-white/[0.08] to-white/[0.04] bg-[length:200%_100%] animate-shimmer" style={{ animationDelay: '0.3s' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
