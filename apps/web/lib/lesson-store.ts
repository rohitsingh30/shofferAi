import type { PrismaClient } from '@prisma/client';
import type { LessonStore, LessonEntry } from '@shofferai/agent-core';

/**
 * Prisma-backed LessonStore — persists skill lessons to Cloud SQL.
 * Agent auto-saves lessons when recovering from errors during browser automation.
 */
export class PrismaLessonStore implements LessonStore {
  constructor(private prisma: PrismaClient) {}

  async loadForSkill(skillId: string, limit = 10): Promise<LessonEntry[]> {
    const rows = await this.prisma.skillLesson.findMany({
      where: {
        skillId,
        confidence: { gte: 0.3 },
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      orderBy: { confidence: 'desc' },
      take: limit,
    });
    return rows.map(r => ({
      id: r.id,
      skillId: r.skillId,
      errorPattern: r.errorPattern,
      resolution: r.resolution,
      source: r.source as 'auto' | 'user',
      confidence: r.confidence,
      successCount: r.successCount,
      failureCount: r.failureCount,
      lastUsedAt: r.lastUsedAt,
      createdAt: r.createdAt,
      expiresAt: r.expiresAt,
    }));
  }

  async save(lesson: Omit<LessonEntry, 'id'>): Promise<LessonEntry> {
    // Deduplicate: if same skill+error pattern exists, update instead
    const existing = await this.prisma.skillLesson.findFirst({
      where: { skillId: lesson.skillId, errorPattern: lesson.errorPattern },
    });

    if (existing) {
      const updated = await this.prisma.skillLesson.update({
        where: { id: existing.id },
        data: {
          resolution: lesson.resolution,
          confidence: Math.min(1, existing.confidence + 0.1),
          successCount: existing.successCount + lesson.successCount,
          lastUsedAt: new Date(),
        },
      });
      return this.toEntry(updated);
    }

    const created = await this.prisma.skillLesson.create({ data: lesson });
    return this.toEntry(created);
  }

  async recordOutcome(lessonId: string, success: boolean): Promise<void> {
    const lesson = await this.prisma.skillLesson.findUnique({ where: { id: lessonId } });
    if (!lesson) return;

    const delta = success ? 0.05 : -0.1;
    await this.prisma.skillLesson.update({
      where: { id: lessonId },
      data: {
        confidence: Math.max(0, Math.min(1, lesson.confidence + delta)),
        successCount: success ? { increment: 1 } : undefined,
        failureCount: !success ? { increment: 1 } : undefined,
        lastUsedAt: new Date(),
      },
    });
  }

  async findMatching(skillId: string, errorText: string): Promise<LessonEntry[]> {
    // Simple substring match — errorPattern is stored as a truncated error string
    const all = await this.loadForSkill(skillId, 50);
    const lower = errorText.toLowerCase();
    return all.filter(l => lower.includes(l.errorPattern.toLowerCase().slice(0, 100)));
  }

  private toEntry(r: {
    id: string; skillId: string; errorPattern: string; resolution: string;
    source: string; confidence: number; successCount: number; failureCount: number;
    lastUsedAt: Date; createdAt: Date; expiresAt: Date | null;
  }): LessonEntry {
    return {
      id: r.id, skillId: r.skillId, errorPattern: r.errorPattern,
      resolution: r.resolution, source: r.source as 'auto' | 'user',
      confidence: r.confidence, successCount: r.successCount,
      failureCount: r.failureCount, lastUsedAt: r.lastUsedAt,
      createdAt: r.createdAt, expiresAt: r.expiresAt,
    };
  }
}
