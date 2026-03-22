'use client';

/**
 * Clean placeholder for cards without images.
 * Shows the first letter(s) of the label in a subtle gradient badge.
 * Used by CarouselInput and CardGridInput when no image is available.
 */

const GRADIENTS = [
  'from-violet-500/20 to-fuchsia-500/20',
  'from-sky-500/20 to-cyan-500/20',
  'from-amber-500/20 to-orange-500/20',
  'from-emerald-500/20 to-teal-500/20',
  'from-rose-500/20 to-pink-500/20',
  'from-indigo-500/20 to-blue-500/20',
];

const TEXT_COLORS = [
  'text-violet-300',
  'text-sky-300',
  'text-amber-300',
  'text-emerald-300',
  'text-rose-300',
  'text-indigo-300',
];

function getInitials(label: string): string {
  // Strip leading emoji
  const clean = label.replace(/^[\p{Emoji_Presentation}\p{Emoji}\ufe0f\u200d]+\s*/u, '').trim();
  if (!clean) return label.charAt(0);
  const words = clean.split(/\s+/);
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
}

function stableIndex(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash + id.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % GRADIENTS.length;
}

interface CardPlaceholderProps {
  id: string;
  label: string;
  /** 'lg' for product-mode image area, 'sm' for emoji-mode compact cards */
  size?: 'lg' | 'sm';
  className?: string;
}

export function CardPlaceholder({ id, label, size = 'lg', className = '' }: CardPlaceholderProps) {
  const idx = stableIndex(id);
  const initials = getInitials(label);

  if (size === 'sm') {
    return (
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${GRADIENTS[idx]} ${className}`}>
        <span className={`text-sm font-semibold ${TEXT_COLORS[idx]}`}>{initials}</span>
      </div>
    );
  }

  return (
    <div className={`flex h-full w-full items-center justify-center rounded-lg bg-gradient-to-br ${GRADIENTS[idx]} ${className}`}>
      <span className={`text-2xl font-bold ${TEXT_COLORS[idx]} transition-transform duration-200 group-hover:scale-110`}>{initials}</span>
    </div>
  );
}
