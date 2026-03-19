import type { LessonEntry } from './types';

/**
 * Format lessons for injection into the system prompt.
 * Caps at 10 lessons, only includes those with confidence >= 0.3.
 */
export function formatLessonsForPrompt(lessons: LessonEntry[]): string {
  const filtered = lessons
    .filter((l) => l.confidence >= 0.3)
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 10);

  if (filtered.length === 0) return '';

  const lines = filtered.map(
    (l, i) =>
      `${i + 1}. When you see "${l.errorPattern}" → ${l.resolution} (confidence: ${Math.round(l.confidence * 100)}%)`
  );

  return `## LESSONS LEARNED (from past executions)\n${lines.join('\n')}`;
}
