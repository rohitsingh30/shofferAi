import React from 'react';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

/** Render basic markdown: **bold**, *italic*, `code`, and line breaks */
function renderMarkdown(text: string) {
  const parts: React.ReactNode[] = [];
  // Split into lines first, then process inline formatting
  const lines = text.split('\n');

  lines.forEach((line, lineIdx) => {
    if (lineIdx > 0) parts.push(<br key={`br-${lineIdx}`} />);

    // Process inline formatting: **bold**, *italic*, `code`
    const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(line)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        parts.push(line.slice(lastIndex, match.index));
      }

      if (match[2]) {
        // **bold**
        parts.push(<strong key={`b-${lineIdx}-${match.index}`} className="font-semibold text-white">{match[2]}</strong>);
      } else if (match[3]) {
        // *italic*
        parts.push(<em key={`i-${lineIdx}-${match.index}`}>{match[3]}</em>);
      } else if (match[4]) {
        // `code`
        parts.push(
          <code key={`c-${lineIdx}-${match.index}`} className="rounded-md bg-white/[0.08] px-1.5 py-0.5 text-[13px] font-mono text-violet-300">
            {match[4]}
          </code>
        );
      }

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text after last match
    if (lastIndex < line.length) {
      parts.push(line.slice(lastIndex));
    }
  });

  return parts;
}

export function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[75%] rounded-2xl rounded-br-md bg-primary px-4 py-3 shadow-lg shadow-primary/10">
          <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-white">{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3.5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-violet-500 shadow-md shadow-primary/20">
        <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
      <div className="min-w-0 flex-1 rounded-2xl rounded-tl-md bg-white/[0.04] px-4 py-3 ring-1 ring-white/[0.06]">
        <p className="text-[14px] leading-relaxed text-zinc-200">
          {renderMarkdown(message.content)}
        </p>
      </div>
    </div>
  );
}
