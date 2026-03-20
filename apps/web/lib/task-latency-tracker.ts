import { track } from './telemetry';

/* ────────────────────────────────────────────────────────────────────────────
 * TaskLatencyTracker — per-task phase-level latency instrumentation
 *
 * Usage:
 *   const lat = new TaskLatencyTracker(taskId, userId);
 *   lat.startPhase('skill_match');
 *   // ... do work ...
 *   lat.endPhase('skill_match', { skillName: 'blinkit' });
 *   lat.addMarker('first_message_sent');
 *   // on task complete:
 *   lat.finish(true);   // persists all phases + markers to TelemetryEvent table
 * ──────────────────────────────────────────────────────────────────────────── */

export interface PhaseRecord {
  phase: string;
  startMs: number;      // offset from tracker creation (ms)
  endMs?: number;       // offset from tracker creation (ms)
  durationMs?: number;
  metadata?: Record<string, unknown>;
}

export interface MarkerRecord {
  name: string;
  offsetMs: number;     // offset from tracker creation (ms)
  metadata?: Record<string, unknown>;
}

export interface TaskLatencyTimeline {
  taskId: string;
  userId?: string;
  totalMs: number;
  ttfmMs?: number;      // time-to-first-message
  phases: PhaseRecord[];
  markers: MarkerRecord[];
}

export class TaskLatencyTracker {
  private readonly taskId: string;
  private readonly userId?: string;
  private readonly origin: number;              // Date.now() when tracker created
  private readonly phases = new Map<string, PhaseRecord>();
  private readonly completedPhases: PhaseRecord[] = [];
  private readonly markers: MarkerRecord[] = [];
  private finished = false;

  constructor(taskId: string, userId?: string) {
    this.taskId = taskId;
    this.userId = userId;
    this.origin = Date.now();
  }

  /** Start timing a named phase. */
  startPhase(phase: string, metadata?: Record<string, unknown>): void {
    if (this.finished) return;
    const record: PhaseRecord = {
      phase,
      startMs: Date.now() - this.origin,
      metadata,
    };
    this.phases.set(phase, record);
  }

  /** End a previously-started phase. */
  endPhase(phase: string, metadata?: Record<string, unknown>): void {
    if (this.finished) return;
    const record = this.phases.get(phase);
    if (!record) {
      console.warn('[latency] endPhase(%s) called without startPhase — ignoring', phase);
      return;
    }
    record.endMs = Date.now() - this.origin;
    record.durationMs = record.endMs - record.startMs;
    if (metadata) {
      record.metadata = { ...record.metadata, ...metadata };
    }
    this.completedPhases.push(record);
    this.phases.delete(phase);
  }

  /** Record a point-in-time marker (e.g., first_message_sent). */
  addMarker(name: string, metadata?: Record<string, unknown>): void {
    if (this.finished) return;
    // Deduplicate — only first occurrence counts (e.g., TTFM)
    if (this.markers.some((m) => m.name === name)) return;
    this.markers.push({
      name,
      offsetMs: Date.now() - this.origin,
      metadata,
    });
  }

  /** Get the timeline so far (useful for API responses). */
  getTimeline(): TaskLatencyTimeline {
    const totalMs = Date.now() - this.origin;
    const ttfmMarker = this.markers.find((m) => m.name === 'first_message_sent');
    return {
      taskId: this.taskId,
      userId: this.userId,
      totalMs,
      ttfmMs: ttfmMarker?.offsetMs,
      phases: [
        ...this.completedPhases,
        // Include in-flight phases with current duration
        ...Array.from(this.phases.values()).map((p) => ({
          ...p,
          endMs: totalMs,
          durationMs: totalMs - p.startMs,
        })),
      ],
      markers: [...this.markers],
    };
  }

  /**
   * Finish tracking and persist all phases + markers as TelemetryEvents.
   * Call once on task completion or failure.
   */
  finish(success: boolean, metadata?: Record<string, unknown>): void {
    if (this.finished) return;
    this.finished = true;

    // Close any still-open phases
    for (const [phase] of this.phases) {
      this.endPhase(phase, { autoClosedOnFinish: true });
    }

    const totalMs = Date.now() - this.origin;
    const ttfmMarker = this.markers.find((m) => m.name === 'first_message_sent');
    const timeline = this.getTimeline();

    // Persist the full timeline as a single summary event
    track({
      event: 'task_latency',
      category: 'latency',
      userId: this.userId,
      taskId: this.taskId,
      durationMs: totalMs,
      success,
      metadata: {
        ...metadata,
        ttfmMs: ttfmMarker?.offsetMs ?? null,
        phaseCount: timeline.phases.length,
        markerCount: timeline.markers.length,
        phases: timeline.phases.map((p) => ({
          phase: p.phase,
          durationMs: p.durationMs,
          ...(p.metadata || {}),
        })),
        markers: timeline.markers.map((m) => ({
          name: m.name,
          offsetMs: m.offsetMs,
        })),
      },
    });

    // Also persist each phase as an individual event for aggregation queries
    for (const phase of timeline.phases) {
      track({
        event: 'task_phase',
        category: 'latency',
        userId: this.userId,
        taskId: this.taskId,
        durationMs: phase.durationMs,
        success,
        metadata: {
          phase: phase.phase,
          startMs: phase.startMs,
          endMs: phase.endMs,
          ...(phase.metadata || {}),
        },
      });
    }

    console.log(
      '[latency] taskId=%s total=%dms ttfm=%sms phases=%d markers=%d success=%s',
      this.taskId, totalMs, ttfmMarker?.offsetMs ?? '-',
      timeline.phases.length, timeline.markers.length, success,
    );
  }
}
