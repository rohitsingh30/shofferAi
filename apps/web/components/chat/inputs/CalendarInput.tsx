'use client';

import { useState, useMemo, useCallback } from 'react';

interface CalendarInputProps {
  mode?: 'single' | 'range';
  shortcuts?: string[];
  onSubmit: (value: string) => void;
}

const DEFAULT_SHORTCUTS = ['Today', 'Tomorrow', 'This weekend', 'Next week'];
const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] as const;

function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function stripTime(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function nightsBetween(a: Date, b: Date): number {
  return Math.round(
    (stripTime(b).getTime() - stripTime(a).getTime()) / 86_400_000,
  );
}

/** Resolve a shortcut label into a single date or [start, end] range. */
function resolveShortcut(
  label: string,
  today: Date,
): Date | [Date, Date] | null {
  const t = stripTime(today);
  switch (label) {
    case 'Today':
      return t;
    case 'Tomorrow':
      return new Date(t.getFullYear(), t.getMonth(), t.getDate() + 1);
    case 'This weekend': {
      const dayOfWeek = t.getDay(); // 0=Sun
      const satOffset = dayOfWeek <= 6 ? (6 - dayOfWeek) % 7 || 7 : 0;
      const sat = new Date(t.getFullYear(), t.getMonth(), t.getDate() + satOffset);
      const sun = new Date(sat.getFullYear(), sat.getMonth(), sat.getDate() + 1);
      // If today IS Saturday or Sunday, use this weekend
      if (dayOfWeek === 6) {
        return [t, new Date(t.getFullYear(), t.getMonth(), t.getDate() + 1)];
      }
      if (dayOfWeek === 0) {
        return t;
      }
      return [sat, sun];
    }
    case 'Next week': {
      const dayOfWeek = t.getDay();
      const monOffset = ((8 - dayOfWeek) % 7) || 7;
      const mon = new Date(t.getFullYear(), t.getMonth(), t.getDate() + monOffset);
      const sun = new Date(mon.getFullYear(), mon.getMonth(), mon.getDate() + 6);
      return [mon, sun];
    }
    default:
      return null;
  }
}

function buildMonthGrid(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  return cells;
}

export function CalendarInput({
  mode = 'single',
  shortcuts = DEFAULT_SHORTCUTS,
  onSubmit,
}: CalendarInputProps) {
  const today = useMemo(() => stripTime(new Date()), []);

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const [selected, setSelected] = useState<Date | null>(null);
  const [rangeEnd, setRangeEnd] = useState<Date | null>(null);
  const [activeShortcut, setActiveShortcut] = useState<string | null>(null);

  const cells = useMemo(
    () => buildMonthGrid(viewYear, viewMonth),
    [viewYear, viewMonth],
  );

  const monthLabel = useMemo(
    () =>
      new Date(viewYear, viewMonth).toLocaleString('default', {
        month: 'long',
        year: 'numeric',
      }),
    [viewYear, viewMonth],
  );

  const isPast = useCallback(
    (d: Date) => stripTime(d).getTime() < today.getTime(),
    [today],
  );

  const isInRange = useCallback(
    (d: Date) => {
      if (mode !== 'range' || !selected || !rangeEnd) return false;
      const t = stripTime(d).getTime();
      const s = stripTime(selected).getTime();
      const e = stripTime(rangeEnd).getTime();
      return t > Math.min(s, e) && t < Math.max(s, e);
    },
    [mode, selected, rangeEnd],
  );

  const isSelected = useCallback(
    (d: Date) => {
      if (selected && isSameDay(d, selected)) return true;
      if (rangeEnd && isSameDay(d, rangeEnd)) return true;
      return false;
    },
    [selected, rangeEnd],
  );

  // --- Handlers ---

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  function handleDayClick(d: Date) {
    if (isPast(d)) return;
    setActiveShortcut(null);

    if (mode === 'single') {
      setSelected(d);
      setRangeEnd(null);
    } else {
      // Range mode
      if (!selected || rangeEnd) {
        // Start fresh range
        setSelected(d);
        setRangeEnd(null);
      } else {
        // Set end (ensure end >= start)
        if (stripTime(d).getTime() < stripTime(selected).getTime()) {
          setRangeEnd(selected);
          setSelected(d);
        } else {
          setRangeEnd(d);
        }
      }
    }
  }

  function handleShortcut(label: string) {
    const result = resolveShortcut(label, today);
    if (!result) return;

    setActiveShortcut(label);

    if (Array.isArray(result)) {
      if (mode === 'range') {
        setSelected(result[0]);
        setRangeEnd(result[1]);
      } else {
        setSelected(result[0]);
        setRangeEnd(null);
      }
      // Navigate calendar to show the start date
      setViewYear(result[0].getFullYear());
      setViewMonth(result[0].getMonth());
    } else {
      setSelected(result);
      setRangeEnd(null);
      setViewYear(result.getFullYear());
      setViewMonth(result.getMonth());
    }
  }

  function handleSubmit() {
    if (!selected) return;
    if (mode === 'single') {
      onSubmit(toISO(selected));
    } else {
      if (!rangeEnd) return;
      onSubmit(
        JSON.stringify({ start: toISO(selected), end: toISO(rangeEnd) }),
      );
    }
  }

  const canSubmit = mode === 'single' ? !!selected : !!(selected && rangeEnd);
  const nights =
    mode === 'range' && selected && rangeEnd
      ? nightsBetween(selected, rangeEnd)
      : 0;

  return (
    <div className="w-full max-w-xs">
      {/* Shortcut chips */}
      {shortcuts.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {shortcuts.map((label) => (
            <button
              key={label}
              type="button"
              onClick={() => handleShortcut(label)}
              className={
                activeShortcut === label
                  ? 'rounded-full border border-primary bg-primary/20 text-primary px-3 py-1.5 text-xs font-medium transition-all'
                  : 'rounded-full border border-white/[0.15] bg-white/[0.03] px-3 py-1.5 text-xs text-foreground/70 cursor-pointer transition-all hover:border-primary/40'
              }
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Month navigation */}
      <div className="flex items-center justify-between px-2 mb-2">
        <button
          type="button"
          onClick={prevMonth}
          className="flex h-7 w-7 items-center justify-center rounded-full text-foreground/60 hover:bg-white/10 transition-colors"
          aria-label="Previous month"
        >
          ‹
        </button>
        <span className="text-sm font-medium text-foreground/80">
          {monthLabel}
        </span>
        <button
          type="button"
          onClick={nextMonth}
          className="flex h-7 w-7 items-center justify-center rounded-full text-foreground/60 hover:bg-white/10 transition-colors"
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_LABELS.map((d) => (
          <div
            key={d}
            className="flex h-9 w-9 items-center justify-center text-xs font-medium text-foreground/40"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Date grid */}
      <div className="grid grid-cols-7">
        {cells.map((cell, i) => {
          if (!cell) {
            return <div key={`empty-${i}`} className="h-9 w-9" />;
          }

          const past = isPast(cell);
          const sel = isSelected(cell);
          const inRange = isInRange(cell);
          const isToday = isSameDay(cell, today);

          let className =
            'w-9 h-9 flex items-center justify-center rounded-full text-sm transition-colors';

          if (past) {
            className += ' text-muted-foreground/30 cursor-not-allowed';
          } else if (sel) {
            className += ' bg-primary text-white cursor-pointer';
          } else if (inRange) {
            className +=
              ' bg-primary/20 text-foreground cursor-pointer hover:bg-white/10';
          } else {
            className +=
              ' text-foreground cursor-pointer hover:bg-white/10';
          }

          if (isToday && !sel) {
            className += ' border border-primary/40';
          }

          return (
            <button
              key={cell.getTime()}
              type="button"
              onClick={() => handleDayClick(cell)}
              disabled={past}
              className={className}
            >
              {cell.getDate()}
            </button>
          );
        })}
      </div>

      {/* Nights label (range mode) */}
      {mode === 'range' && nights > 0 && (
        <p className="mt-2 text-center text-xs text-foreground/50">
          {nights} night{nights !== 1 ? 's' : ''}
        </p>
      )}

      {/* Submit */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!canSubmit}
        className={`mt-3 w-full rounded-xl px-5 py-2.5 text-sm font-medium transition-all ${
          canSubmit
            ? 'bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/25 active:scale-[0.98]'
            : 'bg-white/[0.04] text-zinc-600 cursor-not-allowed'
        }`}
      >
        Continue →
      </button>
    </div>
  );
}
