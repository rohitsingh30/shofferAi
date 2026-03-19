import React, { useState, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, spacing, fontSize, borderRadius, shadows } from '../../lib/theme';

interface CalendarInputProps {
  mode?: 'single' | 'range';
  shortcuts?: string[];
  onSubmit: (value: string) => void;
}

const DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DEFAULT_SHORTCUTS = ['Today', 'Tomorrow', 'This weekend', 'Next week'];

function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function isBetween(d: Date, start: Date, end: Date): boolean {
  return d.getTime() >= start.getTime() && d.getTime() <= end.getTime();
}

export function CalendarInput({
  mode = 'single',
  shortcuts = DEFAULT_SHORTCUTS,
  onSubmit,
}: CalendarInputProps) {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [viewDate, setViewDate] = useState(new Date(today));
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const prevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };
  const nextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  const selectDay = (day: number) => {
    const selected = new Date(year, month, day);
    selected.setHours(0, 0, 0, 0);
    if (selected.getTime() < today.getTime()) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (mode === 'single') {
      setStartDate(selected);
      setEndDate(null);
    } else {
      if (!startDate || (startDate && endDate)) {
        setStartDate(selected);
        setEndDate(null);
      } else {
        if (selected.getTime() < startDate.getTime()) {
          setEndDate(startDate);
          setStartDate(selected);
        } else {
          setEndDate(selected);
        }
      }
    }
  };

  const applyShortcut = (shortcut: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const d = new Date(today);
    switch (shortcut.toLowerCase()) {
      case 'today':
        setStartDate(new Date(d));
        setEndDate(null);
        break;
      case 'tomorrow': {
        const tm = new Date(d);
        tm.setDate(tm.getDate() + 1);
        setStartDate(tm);
        setEndDate(null);
        break;
      }
      case 'this weekend': {
        const dayOfWeek = d.getDay();
        const sat = new Date(d);
        sat.setDate(sat.getDate() + (6 - dayOfWeek));
        const sun = new Date(sat);
        sun.setDate(sun.getDate() + 1);
        setStartDate(sat);
        setEndDate(sun);
        break;
      }
      case 'next week': {
        const dayOfWeek2 = d.getDay();
        const nextMon = new Date(d);
        nextMon.setDate(nextMon.getDate() + (8 - dayOfWeek2));
        const nextFri = new Date(nextMon);
        nextFri.setDate(nextFri.getDate() + 4);
        setStartDate(nextMon);
        setEndDate(nextFri);
        break;
      }
    }
  };

  const handleSubmit = () => {
    if (!startDate) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (mode === 'range' && endDate) {
      onSubmit(JSON.stringify({ start: toISO(startDate), end: toISO(endDate) }));
    } else {
      onSubmit(toISO(startDate));
    }
  };

  const canSubmit = startDate !== null;

  // Build calendar grid cells
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <View style={styles.container}>
      {/* Shortcut chips */}
      {shortcuts.length > 0 && (
        <View style={styles.shortcuts}>
          {shortcuts.map((s) => (
            <Pressable key={s} style={styles.shortcutChip} onPress={() => applyShortcut(s)}>
              <Text style={styles.shortcutText}>{s}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* Month header */}
      <View style={styles.header}>
        <Pressable style={styles.navBtn} onPress={prevMonth} hitSlop={12}>
          <Text style={styles.navText}>‹</Text>
        </Pressable>
        <Text style={styles.monthText}>{MONTH_NAMES[month]} {year}</Text>
        <Pressable style={styles.navBtn} onPress={nextMonth} hitSlop={12}>
          <Text style={styles.navText}>›</Text>
        </Pressable>
      </View>

      {/* Day names */}
      <View style={styles.dayNamesRow}>
        {DAY_NAMES.map((d) => (
          <View key={d} style={styles.dayNameCell}>
            <Text style={styles.dayNameText}>{d}</Text>
          </View>
        ))}
      </View>

      {/* Day grid */}
      <View style={styles.grid}>
        {cells.map((day, idx) => {
          if (day === null) {
            return <View key={`empty-${idx}`} style={styles.dayCell} />;
          }
          const date = new Date(year, month, day);
          date.setHours(0, 0, 0, 0);
          const isPast = date.getTime() < today.getTime();
          const isStart = startDate && isSameDay(date, startDate);
          const isEnd = endDate && isSameDay(date, endDate);
          const isInRange =
            mode === 'range' && startDate && endDate && isBetween(date, startDate, endDate);
          const isToday = isSameDay(date, today);

          return (
            <Pressable
              key={`day-${day}`}
              style={[
                styles.dayCell,
                isInRange && !isStart && !isEnd && styles.dayCellRange,
                (isStart || isEnd) && styles.dayCellSelected,
              ]}
              onPress={() => selectDay(day)}
              disabled={isPast}
            >
              <Text
                style={[
                  styles.dayText,
                  isPast && styles.dayTextPast,
                  isToday && styles.dayTextToday,
                  (isStart || isEnd) && styles.dayTextSelected,
                ]}
              >
                {day}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Selection summary */}
      {startDate && (
        <Text style={styles.summary}>
          {mode === 'range' && endDate
            ? `${toISO(startDate)} → ${toISO(endDate)}`
            : toISO(startDate)}
        </Text>
      )}

      <Pressable
        style={[styles.submitBtn, !canSubmit && styles.submitDisabled]}
        onPress={handleSubmit}
        disabled={!canSubmit}
      >
        <Text style={styles.submitText}>Confirm Date</Text>
      </Pressable>
    </View>
  );
}

const CELL_SIZE = 44;

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  shortcuts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  shortcutChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surfaceRaised,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  shortcutText: {
    color: colors.secondary,
    fontSize: fontSize.xs,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: {
    color: colors.foreground,
    fontSize: fontSize.xl,
    fontWeight: '600',
  },
  monthText: {
    color: colors.foreground,
    fontSize: fontSize.base,
    fontWeight: '600',
  },
  dayNamesRow: {
    flexDirection: 'row',
  },
  dayNameCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  dayNameText: {
    color: colors.tertiary,
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%` as unknown as number,
    height: CELL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCellRange: {
    backgroundColor: colors.primaryGlow,
  },
  dayCellSelected: {
    backgroundColor: colors.primary,
    borderRadius: CELL_SIZE / 2,
  },
  dayText: {
    color: colors.foreground,
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
  dayTextPast: {
    color: colors.tertiary,
    opacity: 0.4,
  },
  dayTextToday: {
    color: colors.primary,
    fontWeight: '700',
  },
  dayTextSelected: {
    color: '#fff',
    fontWeight: '700',
  },
  summary: {
    color: colors.secondary,
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: 14,
    alignItems: 'center',
    ...shadows.glow,
  },
  submitDisabled: {
    opacity: 0.4,
  },
  submitText: {
    color: '#fff',
    fontSize: fontSize.base,
    fontWeight: '700',
  },
});
