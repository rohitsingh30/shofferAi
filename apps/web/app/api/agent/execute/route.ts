/**
 * POST /api/agent/execute
 *
 * SSE endpoint that runs the cloud chat loop, with browser ops delegated
 * to the external Browser Operations Service via MCP.
 *
 * Per-task lifecycle:
 *   1. Create Task row
 *   2. Open SSE stream
 *   3. Open BrowserOpsHost: connect MCP, loadTools, optionally session.open
 *   4. Run AgentExecutor (LLM loop + tool dispatch)
 *   5. Close session, emit task_complete
 *
 * No relay, no laptop bridge, no WebSocket. Pure HTTP+MCP.
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AgentExecutor, type AgentCallbacks, matchSkill } from '@shofferai/agent-core';
import { CredentialInjector } from '@/lib/credential-vault';
import { browserOpsClient, workflowEngine, vault, skills, lessonStore } from '@/lib/singletons';
import { BrowserOpsHost } from '@/lib/browser-ops';
import { track, trackTimed } from '@/lib/telemetry';
import { TaskLatencyTracker } from '@/lib/task-latency-tracker';
import { getAuthUser } from '@/lib/auth-helper';
import { handleCheckoutSuccess, handleCheckoutFailure, handleOrderStatusUpdate } from '@/lib/order-operations';
import { UserInputTimeoutError } from '@shofferai/shared';

export const dynamic = 'force-dynamic';

/** Map a skill name → site id understood by the runner. */
function siteForSkill(skillId: string | undefined): string | null {
  if (!skillId) return null;
  if (skillId.startsWith('bigbasket')) return 'bigbasket';
  if (skillId.startsWith('blinkit'))   return 'blinkit';
  if (skillId.startsWith('zepto'))     return 'zepto';
  if (skillId.startsWith('swiggy-instamart')) return 'swiggy_instamart';
  if (skillId.startsWith('zomato'))    return 'zomato';
  if (skillId.startsWith('swiggy'))    return 'swiggy';
  return null;
}

export async function POST(request: Request) {
  const authStart = Date.now();
  const authUser = await getAuthUser(request);
  if (!authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { message } = await request.json();
  if (!message) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 });
  }
  const userId = authUser.userId;

  const taskId = await workflowEngine.createTask(userId, message);
  await workflowEngine.updateTaskStatus(taskId, 'running');
  let stepCounter = 0;

  const lat = new TaskLatencyTracker(taskId, userId);
  lat.startPhase('auth');
  lat.endPhase('auth', { durationOverride: Date.now() - authStart });
  lat.startPhase('task_setup');

  track({ event: 'task_created', category: 'task', userId, taskId, metadata: { message: message.slice(0, 200) } });
  const taskTimer = trackTimed({ event: 'task_execution', category: 'task', userId, taskId });

  const [profile, credentials, previousCtx] = await Promise.all([
    prisma.profile.findUnique({ where: { userId } }),
    vault.list(userId),
    workflowEngine.loadPreviousContext(userId, { excludeTaskId: taskId }),
  ]);

  lat.endPhase('task_setup');

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      let streamClosed = false;

      function send(type: string, payload: Record<string, unknown>) {
        if (streamClosed) return;
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type, payload })}\n\n`));
          if (type === 'message') lat.addMarker('first_message_sent');
        } catch {
          streamClosed = true;
        }
      }

      function sendKeepAlive() {
        if (streamClosed) return;
        try { controller.enqueue(encoder.encode(`: keepalive\n\n`)); }
        catch { streamClosed = true; }
      }

      const heartbeatTimer = setInterval(sendKeepAlive, 15_000);

      // Construct one BrowserOpsHost per task — owns the per-task session_id.
      const opsHost = new BrowserOpsHost({
        client: browserOpsClient,
        taskId,
        userRef: `sha256:${userId}`,
      });

      request.signal.addEventListener('abort', () => {
        console.log('[execute] taskId=%s SSE client disconnected', taskId);
        streamClosed = true;
        clearInterval(heartbeatTimer);
        opsHost.closeSession().catch(() => {});
        workflowEngine.updateTaskStatus(taskId, 'failed').catch(() => {});
        try { controller.close(); } catch { /* already closed */ }
      });

      try {
        send('task_started', { taskId });

        // ─── Skill match ──────────────────────────────────────────
        lat.startPhase('skill_match');
        let matchedSkill = matchSkill(skills, message);
        if (!matchedSkill && previousCtx.lastSkillId) {
          const fallback = skills.find(s => s.name === previousCtx.lastSkillId);
          if (fallback) matchedSkill = fallback;
        }
        if (matchedSkill) {
          workflowEngine.setTaskSkill(taskId, matchedSkill.name).catch((err) =>
            console.warn('[execute] persist matchedSkillId failed:', err));
        }
        lat.endPhase('skill_match', { skillName: matchedSkill?.name || 'none' });

        // ─── Browser ops setup ────────────────────────────────────
        // Connect to runner + fetch tool catalogue. This is fast (< 200ms warm).
        lat.startPhase('browser_ops_setup');
        try {
          await opsHost.connect();
          await opsHost.loadTools();
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          console.error('[execute] taskId=%s browser-ops connect failed:', taskId, msg);
          send('error', { message: 'Browser service unavailable. Please ensure the runner is up.', detail: msg });
          await workflowEngine.updateTaskStatus(taskId, 'failed');
          clearInterval(heartbeatTimer);
          try { controller.close(); } catch {}
          return;
        }

        // Open a browser session for the matched skill's site (if grocery/food/etc).
        // Chat-only / no-skill tasks skip session.open.
        const site = siteForSkill(matchedSkill?.name);
        if (site) {
          try {
            const snap = await opsHost.openSession({
              site,
              user_ref: `sha256:${userId}`,
              region: 'in-mumbai',
              device: 'desktop',
            });
            console.log('[execute] taskId=%s session=%s warm=%s site=%s', taskId, snap.session_id, snap.warm, site);
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            console.error('[execute] taskId=%s session.open failed:', taskId, msg);
            send('message', { content: `I can't reach **${site}** right now. The browser service may be offline or this site isn't supported yet.` });
            send('task_complete', { summary: 'Browser unavailable' });
            await workflowEngine.updateTaskStatus(taskId, 'failed');
            clearInterval(heartbeatTimer);
            try { controller.close(); } catch {}
            return;
          }
        }
        lat.endPhase('browser_ops_setup');

        // ─── Agent ────────────────────────────────────────────────
        const injector = new CredentialInjector(vault, userId);

        const agent = new AgentExecutor({
          mcpHost: opsHost,
          credentialInjector: injector,
          skills,
          vault,
          lessonStore,
          trackEvent: track,
          taskId,
          previousContext: previousCtx.contextText || undefined,
          userContext: {
            name: authUser.name || undefined,
            email: authUser.email || undefined,
            userId,
            savedAddresses: profile?.addresses
              ? (JSON.parse(profile.addresses) as Array<{ label: string; flatNo?: string; line1?: string; line2?: string; city?: string; state?: string; pincode?: string; contactNumber?: string; address?: string }>).map((a) => ({
                  label: a.label,
                  address: [a.flatNo, a.line1, a.line2, a.city, a.state, a.pincode].filter(Boolean).join(', ') || a.address || '',
                }))
              : [],
            addressLabels: profile?.addresses
              ? (JSON.parse(profile.addresses) as Array<{ label: string }>).map((a) => a.label)
              : [],
            credentialLabels: credentials.map((c) => ({ id: c.id, label: c.label, type: c.type })),
            preferences: profile?.preferences ? JSON.parse(profile.preferences) : {},
          },
          onSaveAddress: async (targetUserId: string, address: Record<string, unknown>) => {
            try {
              const existingProfile = await prisma.profile.findUnique({ where: { userId: targetUserId } });
              let addresses: Array<Record<string, unknown>> = [];
              if (existingProfile?.addresses) addresses = JSON.parse(existingProfile.addresses);
              const label = (address.label as string) || 'Home';
              addresses.push({ ...address, id: crypto.randomUUID(), label });
              await prisma.profile.upsert({
                where: { userId: targetUserId },
                update: { addresses: JSON.stringify(addresses) },
                create: { userId: targetUserId, addresses: JSON.stringify(addresses), phone: '', preferences: '{}' },
              });
              return { saved: true, addressCount: addresses.length };
            } catch (error) {
              return { saved: false, error: error instanceof Error ? error.message : 'DB error' };
            }
          },
        });

        const callbacks: AgentCallbacks = {
          onMessage: (content: string) => {
            send('message', { content });
            workflowEngine.addMessage(taskId, 'assistant', content)
              .catch(e => console.error('[execute] addMessage(assistant) failed:', e));
          },
          onSuggestions: (chips: string[]) => {
            send('suggestions', { chips });
          },
          onStepUpdate: (step) => {
            const stepNumber = ++stepCounter;
            send('step_update', { step: { ...step, number: stepNumber } });
            prisma.taskStep.create({
              data: {
                taskId, stepNumber, action: step.action, status: step.status,
                startedAt: new Date(),
                completedAt: step.status === 'completed' || step.status === 'failed' ? new Date() : null,
              },
            }).catch(e => console.error('[execute] taskStep.create failed:', e));
          },
          onInputRequired: async (request) => {
            send('input_required', request as unknown as Record<string, unknown>);
            workflowEngine.addMessage(taskId, 'assistant', request.question, {
              type: 'input_required', stepId: request.stepId, inputType: request.inputType,
              options: request.options,
            }).catch(e => console.error('[execute] addMessage(input_required) failed:', e));

            const pauseManager = workflowEngine.getPauseManager();
            try {
              const response = await pauseManager.waitForInput({
                taskId, stepId: request.stepId,
                question: request.question, inputType: request.inputType,
                timeout: 600_000,
              });
              workflowEngine.addMessage(taskId, 'user', response.value || '[no response]', {
                type: 'input_response', stepId: request.stepId,
              }).catch(e => console.error('[execute] addMessage(user response) failed:', e));
              return response;
            } catch (err) {
              if (err instanceof UserInputTimeoutError) {
                send('input_timeout', { stepId: request.stepId });
                return { taskId, stepId: request.stepId, value: '', cancelled: true };
              }
              throw err;
            }
          },
          onConfirmRequired: async (details) => {
            const stepId = `confirm_${Date.now()}`;
            send('confirm_required', {
              stepId,
              action: details.action,
              description: details.description,
            });
            const pauseManager = workflowEngine.getPauseManager();
            try {
              const response = await pauseManager.waitForInput({
                taskId, stepId,
                question: details.action,
                inputType: 'confirmation',
                timeout: 600_000,
              });
              return Boolean(response.value && /^(yes|y|true|confirm)/i.test(response.value));
            } catch {
              return false;
            }
          },
          onPaymentRequired: async (details) => {
            const stepId = `payment_${Date.now()}`;
            send('payment_required', {
              stepId,
              bookingSummary: details.bookingSummary,
              amountInr: details.amountInr,
              description: details.description,
            });
            const pauseManager = workflowEngine.getPauseManager();
            try {
              const response = await pauseManager.waitForInput({
                taskId, stepId,
                question: details.description, inputType: 'confirmation',
                timeout: 600_000,
              });
              return Boolean(response.value && /^(paid|confirmed|yes|true)/i.test(response.value));
            } catch {
              return false;
            }
          },
          onComplete: async (summary: string) => {
            send('task_complete', { summary });
            await workflowEngine.updateTaskStatus(taskId, 'completed');
            taskTimer.end({ success: true });
            lat.finish(true);
            track({ event: 'task_completed', category: 'task', userId, taskId, success: true });
          },
          onError: async (error: string) => {
            send('error', { message: error });
            await workflowEngine.updateTaskStatus(taskId, 'failed');
            taskTimer.end({ success: false });
            lat.finish(false);
            track({ event: 'task_failed', category: 'task', userId, taskId, success: false, metadata: { error: error.slice(0, 500) } });
          },
        };

        await agent.execute(message, callbacks);

        // Always release the browser session at the end of the task
        await opsHost.closeSession();

      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        console.error('[execute] taskId=%s fatal:', taskId, err);
        send('error', { message: msg });
        await workflowEngine.updateTaskStatus(taskId, 'failed');
        taskTimer.end({ success: false });
        await opsHost.closeSession();
      } finally {
        clearInterval(heartbeatTimer);
        if (!streamClosed) {
          try { controller.close(); } catch {}
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
