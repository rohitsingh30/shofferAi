import { prisma } from './prisma';

export interface TelemetryData {
  event: string;
  category: string;
  userId?: string;
  taskId?: string;
  success?: boolean;
  durationMs?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Fire-and-forget telemetry tracking.
 * Never throws — errors are silently logged.
 */
export function track(data: TelemetryData): void {
  prisma.telemetryEvent
    .create({
      data: {
        event: data.event,
        category: data.category,
        userId: data.userId || null,
        taskId: data.taskId || null,
        success: data.success ?? true,
        durationMs: data.durationMs ?? null,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
      },
    })
    .catch(() => {
      // Silent — telemetry must never break the app
    });
}

/**
 * Track with timing — returns a function to call when done.
 */
export function trackTimed(
  data: Omit<TelemetryData, 'durationMs' | 'success'>
): { end: (extra?: { success?: boolean; metadata?: Record<string, unknown> }) => void } {
  const start = Date.now();
  return {
    end(extra) {
      track({
        ...data,
        durationMs: Date.now() - start,
        success: extra?.success ?? true,
        metadata: { ...data.metadata, ...extra?.metadata },
      });
    },
  };
}
