import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { prisma } from '@/lib/prisma';
import { AgentExecutor, type AgentCallbacks, matchSkill } from '@shofferai/agent-core';
import { CredentialInjector } from '@/lib/credential-vault';
import { remoteMcpHost, workflowEngine, vault, skills } from '@/lib/singletons';
import { track, trackTimed } from '@/lib/telemetry';
import { getAuthUser } from '@/lib/auth-helper';
import type {
  TaskRelayMessage,
  TaskHandoffMessage,
  TaskInputResponseMessage,
  TaskPaymentResponseMessage,
} from '@shofferai/shared';

/** Lazy relay connection — only needed when agent actually tries to use the browser */
async function ensureRelayConnected() {
  if (!remoteMcpHost.isConnected()) {
    console.log('[execute] Relay not connected, connecting...');
    await remoteMcpHost.connect();
    console.log('[execute] Relay connected');
  }
}

export async function POST(request: Request) {
  console.log('[execute] POST /api/agent/execute — incoming request');
  const authUser = await getAuthUser(request);
  if (!authUser) {
    console.warn('[execute] Unauthorized request');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { message } = await request.json();
  console.log('[execute] user=%s message=%s', authUser.userId, message?.slice(0, 120));
  if (!message) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 });
  }

  const userId = authUser.userId;

  // Create task in DB
  const taskId = await workflowEngine.createTask(userId, message);
  await workflowEngine.updateTaskStatus(taskId, 'running');
  console.log('[execute] taskId=%s created, status=running', taskId);

  track({ event: 'task_created', category: 'task', userId, taskId, metadata: { message: message.slice(0, 200) } });
  const taskTimer = trackTimed({ event: 'task_execution', category: 'task', userId, taskId });

  // Get user context
  const [profile, credentials] = await Promise.all([
    prisma.profile.findUnique({ where: { userId } }),
    vault.list(userId),
  ]);

  // Stream response via SSE
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      function send(type: string, payload: Record<string, unknown>) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type, payload })}\n\n`)
        );
      }

      // Cleanup function to remove task event listener
      let taskEventCleanup: (() => void) | null = null;
      // Track whether the agent handed off to the laptop browser agent.
      // When true, the stream must stay open for laptop events (task_progress,
      // task_complete, task_error) — the finally block must NOT close it.
      let handoffSent = false;

      try {
        // Don't eagerly connect relay — chat LLM can ask clarifying questions without it.
        // Relay is only needed when handoff_to_browser_agent or browse_website is called.
        console.log('[execute] taskId=%s starting (relay connection deferred)', taskId);

        // Match a skill for the user's request
        const matchedSkill = matchSkill(skills, message);
        console.log('[execute] taskId=%s matched skill: %s', taskId, matchedSkill?.name || 'none');

        // ─── Chat LLM gathers requirements, then hands off ─────────
        // Use AgentExecutor in "chat-only" mode — it will call handoff_to_browser_agent
        // when it has gathered enough info from the user.

        const injector = new CredentialInjector(vault, userId);

        const agent = new AgentExecutor({
          mcpHost: remoteMcpHost,
          credentialInjector: injector,
          skills,
          vault,
          trackEvent: track,
          taskId,
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
            credentialLabels: credentials.map((c) => ({
              id: c.id,
              label: c.label,
              type: c.type,
            })),
            preferences: profile?.preferences ? JSON.parse(profile.preferences) : {},
          },
        });

        // ─── Handle task events from laptop ──────────────────────────
        // When the laptop sends task_progress, task_input_required, etc.,
        // forward them as SSE events to the frontend.
        const pauseManager = workflowEngine.getPauseManager();

        const handleTaskEvent = (msg: TaskRelayMessage) => {
          // Only handle events for this task
          if ('taskId' in msg && msg.taskId !== taskId) return;

          switch (msg.type) {
            case 'task_progress':
              send('message', { content: msg.message });
              if (msg.step) {
                send('step_update', { action: msg.message, status: 'running' });
              }
              break;

            case 'task_input_required':
              console.log('[execute] taskId=%s TASK_INPUT_REQUIRED stepId=%s q=%s', taskId, msg.stepId, msg.question?.slice(0, 80));
              send('input_required', {
                taskId,
                stepId: msg.stepId,
                question: msg.question,
                inputType: msg.inputType,
                options: msg.options,
                cards: msg.cards,
                show_quantity: msg.show_quantity,
                allow_custom: msg.allow_custom,
                multi_select: msg.multi_select,
                saved: msg.saved,
                mode: msg.mode,
                shortcuts: msg.shortcuts,
                counters: msg.counters,
                min: msg.min,
                max: msg.max,
                step: msg.step,
                presets: msg.presets,
                placeholder: msg.placeholder,
                format_hint: msg.format_hint,
                sections: msg.sections,
              });
              // Wait for user input then send back to laptop
              pauseManager.waitForInput({
                taskId,
                stepId: msg.stepId,
                question: msg.question,
                inputType: msg.inputType,
              }).then((response) => {
                console.log('[execute] taskId=%s input received for stepId=%s', taskId, msg.stepId);
                const inputMsg: TaskInputResponseMessage = {
                  id: randomUUID(),
                  type: 'task_input_response',
                  taskId,
                  stepId: msg.stepId,
                  value: response.value,
                };
                remoteMcpHost.sendTaskMessage(inputMsg);
              }).catch((err) => {
                console.error('[execute] taskId=%s input error:', taskId, err);
              });
              break;

            case 'task_payment_required':
              console.log('[execute] taskId=%s TASK_PAYMENT_REQUIRED amount=%d', taskId, msg.amount);
              send('payment_required', {
                taskId,
                stepId: msg.stepId,
                bookingSummary: msg.bookingSummary,
                amountCents: Math.round(msg.amount * 100),
                serviceFeeCents: 0,
                description: msg.description,
              });
              pauseManager.waitForInput({
                taskId,
                stepId: msg.stepId,
                question: 'Waiting for payment',
                inputType: 'payment',
                timeout: 600000,
              }).then((response) => {
                console.log('[execute] taskId=%s payment response=%s', taskId, response.value);
                const paymentMsg: TaskPaymentResponseMessage = {
                  id: randomUUID(),
                  type: 'task_payment_response',
                  taskId,
                  stepId: msg.stepId,
                  confirmed: response.value === 'confirmed',
                };
                remoteMcpHost.sendTaskMessage(paymentMsg);
              }).catch((err) => {
                console.error('[execute] taskId=%s payment error:', taskId, err);
              });
              break;

            case 'task_complete':
              console.log('[execute] taskId=%s TASK_COMPLETE: %s', taskId, msg.summary?.slice(0, 120));
              send('complete', { summary: msg.summary });
              workflowEngine.updateTaskStatus(taskId, 'completed').catch(e => console.error('[execute] DB error:', e));
              taskTimer.end({ success: true, metadata: { skillName: matchedSkill?.name } });
              if (taskEventCleanup) taskEventCleanup();
              controller.close();
              break;

            case 'task_error':
              console.error('[execute] taskId=%s TASK_ERROR: %s', taskId, msg.error);
              send('error', { error: msg.error });
              workflowEngine.updateTaskStatus(taskId, 'failed').catch(e => console.error('[execute] DB error:', e));
              taskTimer.end({ success: false, metadata: { error: msg.error } });
              if (taskEventCleanup) taskEventCleanup();
              controller.close();
              break;
          }
        };

        remoteMcpHost.onTaskEvent(handleTaskEvent);
        taskEventCleanup = () => {
          // Remove our handler (simple approach — last handler wins)
          remoteMcpHost.onTaskEvent(() => {});
        };

        // ─── AgentExecutor callbacks (chat-only mode) ────────────────
        const callbacks: AgentCallbacks = {
          onMessage(content) {
            console.log('[execute] taskId=%s message: %s', taskId, content?.slice(0, 100));
            send('message', { content });
            workflowEngine.addMessage(taskId, 'assistant', content).catch(e => console.error('[execute] DB addMessage failed:', e));
          },
          onStepUpdate(step) {
            console.log('[execute] taskId=%s step_update: %o', taskId, step);
            send('step_update', step);
          },
          async onInputRequired(request) {
            console.log('[execute] taskId=%s INPUT_REQUIRED stepId=%s type=%s q=%s', taskId, request.stepId, request.inputType, request.question?.slice(0, 80));
            send('input_required', {
              taskId,
              stepId: request.stepId,
              question: request.question,
              inputType: request.inputType,
              options: request.options,
              cards: request.cards,
              show_quantity: request.show_quantity,
              allow_custom: request.allow_custom,
              multi_select: request.multi_select,
              saved: request.saved,
              mode: request.mode,
              shortcuts: request.shortcuts,
              counters: request.counters,
              min: request.min,
              max: request.max,
              step: request.step,
              presets: request.presets,
              placeholder: request.placeholder,
              format_hint: request.format_hint,
              sections: request.sections,
            });
            const response = await pauseManager.waitForInput({ ...request, taskId });
            console.log('[execute] taskId=%s input received for stepId=%s', taskId, request.stepId);
            return response;
          },
          async onConfirmRequired(details) {
            console.log('[execute] taskId=%s CONFIRM_REQUIRED: %s', taskId, details.action?.slice(0, 80));
            send('input_required', {
              taskId,
              stepId: 'confirm',
              question: `${details.action}\n\n${details.description}`,
              inputType: 'confirmation',
            });
            const response = await pauseManager.waitForInput({
              taskId,
              stepId: 'confirm',
              question: details.action,
              inputType: 'confirmation',
            });
            console.log('[execute] taskId=%s confirm response=%s', taskId, response.value);
            return response.value === 'yes';
          },
          async onPaymentRequired(details: { bookingSummary: string; amountInr: number; description: string }) {
            console.log('[execute] taskId=%s PAYMENT_REQUIRED amount=₹%d', taskId, details.amountInr);
            send('payment_required', {
              taskId,
              bookingSummary: details.bookingSummary,
              amountCents: Math.round(details.amountInr * 100),
              serviceFeeCents: 0,
              description: details.description,
            });
            const response = await pauseManager.waitForInput({
              taskId,
              stepId: 'payment',
              question: 'Waiting for payment confirmation',
              inputType: 'payment',
              timeout: 600000,
            });
            console.log('[execute] taskId=%s payment response=%s', taskId, response.value);
            return response.value === 'confirmed';
          },
          onComplete(summary) {
            if (handoffSent) {
              // Handoff is active — the laptop will send task_complete.
              // Don't mark completed here (the LLM's "I've handed this off" is just a text message).
              console.log('[execute] taskId=%s onComplete suppressed (handoff active)', taskId);
              return;
            }
            console.log('[execute] taskId=%s COMPLETE: %s', taskId, summary?.slice(0, 120));
            send('complete', { summary });
            workflowEngine.updateTaskStatus(taskId, 'completed').catch(e => console.error('[execute] DB updateStatus failed:', e));
            taskTimer.end({ success: true, metadata: { skillName: agent.matchedSkill?.name } });
          },
          onError(error) {
            console.error('[execute] taskId=%s ERROR: %s', taskId, error);
            send('error', { error });
            workflowEngine.updateTaskStatus(taskId, 'failed').catch(e => console.error('[execute] DB updateStatus failed:', e));
            taskTimer.end({ success: false, metadata: { error } });
          },

          // ─── Task handoff callback ─────────────────────────────────
          // Called by AgentExecutor when it decides to hand off to the
          // browser agent (Copilot CLI on the laptop).
          async onTaskHandoff(handoff: {
            description: string;
            skill?: { name: string; siteUrl: string; instructions: string; requiresAuth: boolean; params: Array<{ name: string; required: boolean; hint: string }> };
            extractedParams: Record<string, string>;
            conversationContext?: string;
          }) {
            console.log('[execute] taskId=%s TASK_HANDOFF to laptop', taskId);
            send('step_update', { action: 'Handing off to browser agent...', status: 'running' });

            // Lazy relay connection — only connect when we actually need the laptop
            try {
              await ensureRelayConnected();
            } catch (relayErr) {
              const msg = relayErr instanceof Error ? relayErr.message : 'Relay connection failed';
              console.error('[execute] taskId=%s relay connect failed during handoff: %s', taskId, msg);
              // Throw so the agent knows the handoff failed and can tell the user
              throw new Error(`Cannot reach browser agent: ${msg}. Make sure the laptop relay is running.`);
            }

            const handoffMsg: TaskHandoffMessage = {
              id: randomUUID(),
              type: 'task_handoff',
              taskId,
              userId,
              description: handoff.description,
              skill: handoff.skill,
              extractedParams: handoff.extractedParams,
              conversationContext: handoff.conversationContext,
            };

            remoteMcpHost.sendTaskMessage(handoffMsg);
            handoffSent = true;
            // Don't close the stream — keep it open for task events from the laptop
          },
        };

        await workflowEngine.addMessage(taskId, 'user', message);
        console.log('[execute] taskId=%s starting agent.execute()', taskId);
        await agent.execute(message, callbacks);
        console.log('[execute] taskId=%s agent.execute() finished', taskId);

      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        const stack = error instanceof Error ? error.stack : '';
        console.error('[execute] taskId=%s FATAL ERROR: %s\n%s', taskId, errorMsg, stack);
        send('error', { error: errorMsg });
        await workflowEngine.updateTaskStatus(taskId, 'failed');
        taskTimer.end({ success: false, metadata: { error: errorMsg } });
      } finally {
        if (handoffSent) {
          // Handoff was sent to laptop — keep the stream and event listener alive.
          // task_complete or task_error from the laptop will close the stream (lines 211/219).
          console.log('[execute] taskId=%s agent.execute() finished, handoff active — stream stays open', taskId);
        } else {
          if (taskEventCleanup) taskEventCleanup();
          console.log('[execute] taskId=%s stream closing', taskId);
          // Note: controller.close() may have already been called by task_complete/task_error
          try { controller.close(); } catch { /* already closed */ }
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
