import React from 'react';

/** Render basic markdown: **bold**, *italic*, `code`, and line breaks */
export function renderMarkdown(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const lines = text.split('\n');

  lines.forEach((line, lineIdx) => {
    if (lineIdx > 0) parts.push(<br key={`br-${lineIdx}`} />);

    const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        parts.push(line.slice(lastIndex, match.index));
      }

      if (match[2]) {
        parts.push(<strong key={`b-${lineIdx}-${match.index}`} className="font-semibold text-white">{match[2]}</strong>);
      } else if (match[3]) {
        parts.push(<em key={`i-${lineIdx}-${match.index}`}>{match[3]}</em>);
      } else if (match[4]) {
        parts.push(
          <code key={`c-${lineIdx}-${match.index}`} className="rounded-md bg-white/[0.08] px-1.5 py-0.5 text-[13px] font-mono text-violet-300">
            {match[4]}
          </code>
        );
      }

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < line.length) {
      parts.push(line.slice(lastIndex));
    }
  });

  return parts;
}
