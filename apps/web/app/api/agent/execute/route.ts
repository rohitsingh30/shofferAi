import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { prisma } from '@/lib/prisma';
import { AgentExecutor, type AgentCallbacks, matchSkill } from '@shofferai/agent-core';
import { CredentialInjector } from '@/lib/credential-vault';
import { remoteMcpHost, workflowEngine, vault, skills } from '@/lib/singletons';
import { track, trackTimed } from '@/lib/telemetry';
import { TaskLatencyTracker } from '@/lib/task-latency-tracker';
import { getAuthUser } from '@/lib/auth-helper';
import type {
  TaskRelayMessage,
  TaskHandoffMessage,
  TaskInputResponseMessage,
  TaskPaymentResponseMessage,
  TaskCancelMessage,
} from '@shofferai/shared';
import { shouldSuppressMessage } from '@shofferai/shared';

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

  // ─── Phase: auth ─────────────────────────────────────────────────
  const authStart = Date.now();
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

  // ─── Phase: task_setup ───────────────────────────────────────────
  // Create task first so we have the taskId for the latency tracker
  const taskId = await workflowEngine.createTask(userId, message);
  await workflowEngine.updateTaskStatus(taskId, 'running');
  console.log('[execute] taskId=%s created, status=running', taskId);

  // Initialize latency tracker — tracks all phases for this task
  const lat = new TaskLatencyTracker(taskId, userId);
  // Retroactively record auth phase duration
  lat.startPhase('auth');
  lat.endPhase('auth', { durationOverride: Date.now() - authStart });

  lat.startPhase('task_setup');

  track({ event: 'task_created', category: 'task', userId, taskId, metadata: { message: message.slice(0, 200) } });
  const taskTimer = trackTimed({ event: 'task_execution', category: 'task', userId, taskId });

  // Get user context
  const [profile, credentials] = await Promise.all([
    prisma.profile.findUnique({ where: { userId } }),
    vault.list(userId),
  ]);

  lat.endPhase('task_setup');

  // Stream response via SSE
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      let streamClosed = false;

      function send(type: string, payload: Record<string, unknown>) {
        if (streamClosed) return;
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type, payload })}\n\n`)
          );
          // Track time-to-first-message
          if (type === 'message') {
            lat.addMarker('first_message_sent');
          }
        } catch {
          // Stream already closed (browser disconnected, timeout, etc.)
          streamClosed = true;
        }
      }

      function sendKeepAlive() {
        if (streamClosed) return;
        try {
          controller.enqueue(encoder.encode(`: keepalive\n\n`));
        } catch {
          streamClosed = true;
        }
      }

      // SSE heartbeat — prevents keepAliveTimeout from killing the connection
      // while the laptop is executing the task (Chrome launching, page loading, etc.)
      const heartbeatTimer = setInterval(sendKeepAlive, 15_000);

      // Cleanup function to remove task event listener
      let taskEventCleanup: (() => void) | null = null;
      // Track whether the agent handed off to the laptop browser agent.
      // When true, the stream must stay open for laptop events (task_progress,
      // task_complete, task_error) — the finally block must NOT close it.
      let handoffSent = false;

      // ─── SSE disconnect detection ──────────────────────────────────
      // When the user closes the chat tab or navigates away, request.signal
      // fires 'abort'. If a handoff is active, send task_cancel to the laptop
      // so it kills the Copilot CLI + Chrome immediately instead of waiting
      // for the 10-minute task timeout.
      request.signal.addEventListener('abort', () => {
        console.log('[execute] taskId=%s SSE client disconnected (request aborted)', taskId);
        streamClosed = true;

        if (handoffSent) {
          try {
            const cancelMsg: TaskCancelMessage = {
              id: randomUUID(),
              type: 'task_cancel',
              taskId,
              reason: 'client_disconnected',
            };
            remoteMcpHost.sendTaskMessage(cancelMsg);
            console.log('[execute] taskId=%s sent task_cancel to laptop relay', taskId);
          } catch (e) {
            console.warn('[execute] taskId=%s failed to send task_cancel:', taskId, e);
          }
        }

        // Clean up SSE resources
        clearInterval(heartbeatTimer);
        if (taskEventCleanup) taskEventCleanup();
        workflowEngine.updateTaskStatus(taskId, 'failed').catch(() => {});
        try { controller.close(); } catch { /* already closed */ }
      });

      try {
        // Don't eagerly connect relay — chat LLM can ask clarifying questions without it.
        // Relay is only needed when handoff_to_browser_agent or browse_website is called.
        console.log('[execute] taskId=%s starting (relay connection deferred)', taskId);

        // ─── Phase: skill_match ──────────────────────────────────────
        lat.startPhase('skill_match');
        // Match a skill for the user's request
        const matchedSkill = matchSkill(skills, message);
        lat.endPhase('skill_match', { skillName: matchedSkill?.name || 'none' });
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
          onSaveAddress: async (targetUserId: string, address: Record<string, unknown>) => {
            try {
              const existingProfile = await prisma.profile.findUnique({ where: { userId: targetUserId } });
              let addresses: Array<Record<string, unknown>> = [];
              if (existingProfile?.addresses) {
                addresses = JSON.parse(existingProfile.addresses);
              }
              // Upsert by label: replace existing address with same label, or append
              const label = (address.label as string) || 'Home';
              const idx = addresses.findIndex((a) => a.label === label);
              if (idx >= 0) {
                addresses[idx] = address;
              } else {
                addresses.push(address);
              }
              await prisma.profile.upsert({
                where: { userId: targetUserId },
                update: { addresses: JSON.stringify(addresses) },
                create: { userId: targetUserId, addresses: JSON.stringify(addresses), phone: '', preferences: '{}' },
              });
              console.log('[execute] Address saved for user=%s label=%s count=%d', targetUserId, label, addresses.length);
              return { saved: true, addressCount: addresses.length };
            } catch (error) {
              const errMsg = error instanceof Error ? error.message : 'Unknown DB error';
              console.error('[execute] Failed to save address for user=%s:', targetUserId, errMsg);
              return { saved: false, error: errMsg };
            }
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
              // Only forward LLM text messages (no step field) as chat bubbles.
              // Tool call progress (has step field) goes only to MCP logs, not to the user.
              if (!msg.step) {
                // Defense-in-depth: skip internal tool-call labels that slipped through
                if (shouldSuppressMessage(msg.message)) {
                  console.log('[execute] taskId=%s suppressed internal msg: %s', taskId, msg.message?.slice(0, 80));
                } else {
                  send('message', { content: msg.message });
                  workflowEngine.addMessage(taskId, 'assistant', msg.message)
                    .catch(e => console.error('[execute] DB addMessage(task_progress) failed:', e));
                }
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
              // Persist the agent's question
              workflowEngine.addMessage(taskId, 'assistant', msg.question, {
                type: 'input_required', inputType: msg.inputType, stepId: msg.stepId,
                options: msg.options, cards: msg.cards,
              }).catch(e => console.error('[execute] DB addMessage(task_input_required) failed:', e));

              // Wait for user input then send back to laptop
              pauseManager.waitForInput({
                taskId,
                stepId: msg.stepId,
                question: msg.question,
                inputType: msg.inputType,
              }).then((response) => {
                console.log('[execute] taskId=%s input received for stepId=%s', taskId, msg.stepId);
                // Persist the user's response
                workflowEngine.addMessage(taskId, 'user', response.value || '[no response]', {
                  type: 'input_response', stepId: msg.stepId, inputType: msg.inputType,
                }).catch(e => console.error('[execute] DB addMessage(task_input_response) failed:', e));

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
              // Persist the payment request
              workflowEngine.addMessage(taskId, 'assistant',
                `Payment required: ₹${msg.amount}${msg.bookingSummary ? '\n' + msg.bookingSummary : ''}`,
                { type: 'payment_required', amount: msg.amount, stepId: msg.stepId },
              ).catch(e => console.error('[execute] DB addMessage(task_payment_required) failed:', e));

              pauseManager.waitForInput({
                taskId,
                stepId: msg.stepId,
                question: 'Waiting for payment',
                inputType: 'payment',
                timeout: 600000,
              }).then((response) => {
                console.log('[execute] taskId=%s payment response=%s', taskId, response.value);
                // Persist the payment confirmation/decline
                workflowEngine.addMessage(taskId, 'user',
                  response.value === 'confirmed' ? 'Payment confirmed' : 'Payment declined',
                  { type: 'payment_response', stepId: msg.stepId },
                ).catch(e => console.error('[execute] DB addMessage(task_payment_response) failed:', e));

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
              workflowEngine.addMessage(taskId, 'assistant', msg.summary, { type: 'task_complete' })
                .catch(e => console.error('[execute] DB addMessage(task_complete) failed:', e));
              workflowEngine.updateTaskStatus(taskId, 'completed').catch(e => console.error('[execute] DB error:', e));
              taskTimer.end({ success: true, metadata: { skillName: matchedSkill?.name } });
              lat.endPhase('browser_execution');
              lat.finish(true, { skillName: matchedSkill?.name, completedVia: 'browser' });
              clearInterval(heartbeatTimer);
              if (taskEventCleanup) taskEventCleanup();
              try { controller.close(); } catch { /* already closed */ }
              break;

            case 'task_error':
              console.error('[execute] taskId=%s TASK_ERROR: %s', taskId, msg.error);
              send('error', { error: msg.error });
              workflowEngine.addMessage(taskId, 'assistant', `Error: ${msg.error}`, {
                type: 'task_error', recoverable: msg.recoverable,
              }).catch(e => console.error('[execute] DB addMessage(task_error) failed:', e));
              workflowEngine.updateTaskStatus(taskId, 'failed').catch(e => console.error('[execute] DB error:', e));
              taskTimer.end({ success: false, metadata: { error: msg.error } });
              lat.endPhase('browser_execution');
              lat.finish(false, { error: msg.error, completedVia: 'browser' });
              clearInterval(heartbeatTimer);
              if (taskEventCleanup) taskEventCleanup();
              try { controller.close(); } catch { /* already closed */ }
              break;
          }
        };

        remoteMcpHost.onTaskEvent(handleTaskEvent, taskId);
        taskEventCleanup = () => {
          remoteMcpHost.removeTaskEventHandler(taskId);
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
            // Save the ask_user prompt as an assistant message
            workflowEngine.addMessage(taskId, 'assistant', request.question || '[input requested]', { inputType: request.inputType, stepId: request.stepId, options: request.options }).catch(e => console.error('[execute] DB addMessage(ask) failed:', e));
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
            lat.startPhase('user_input_wait');
            const response = await pauseManager.waitForInput({ ...request, taskId });
            lat.endPhase('user_input_wait', { inputType: request.inputType, stepId: request.stepId });
            console.log('[execute] taskId=%s input received for stepId=%s', taskId, request.stepId);
            // Save user's response
            workflowEngine.addMessage(taskId, 'user', response.value || '[no response]', { stepId: request.stepId, inputType: request.inputType }).catch(e => console.error('[execute] DB addMessage(input) failed:', e));
            return response;
          },
          async onConfirmRequired(details) {
            console.log('[execute] taskId=%s CONFIRM_REQUIRED: %s', taskId, details.action?.slice(0, 80));
            const confirmQuestion = `${details.action}\n\n${details.description}`;
            workflowEngine.addMessage(taskId, 'assistant', confirmQuestion, { type: 'confirmation' }).catch(e => console.error('[execute] DB addMessage(confirm-ask) failed:', e));
            send('input_required', {
              taskId,
              stepId: 'confirm',
              question: confirmQuestion,
              inputType: 'confirmation',
            });
            const response = await pauseManager.waitForInput({
              taskId,
              stepId: 'confirm',
              question: details.action,
              inputType: 'confirmation',
            });
            console.log('[execute] taskId=%s confirm response=%s', taskId, response.value);
            workflowEngine.addMessage(taskId, 'user', response.value === 'yes' ? 'Yes, confirmed' : 'No, cancelled', { type: 'confirmation' }).catch(e => console.error('[execute] DB addMessage(confirm-resp) failed:', e));
            return response.value === 'yes';
          },
          async onPaymentRequired(details: { bookingSummary: string; amountInr: number; description: string }) {
            console.log('[execute] taskId=%s PAYMENT_REQUIRED amount=₹%d', taskId, details.amountInr);
            workflowEngine.addMessage(taskId, 'assistant', `Payment required: ₹${details.amountInr}\n${details.bookingSummary}`, { type: 'payment', amountInr: details.amountInr }).catch(e => console.error('[execute] DB addMessage(payment-ask) failed:', e));
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
            workflowEngine.addMessage(taskId, 'user', response.value === 'confirmed' ? 'Payment confirmed' : 'Payment declined', { type: 'payment' }).catch(e => console.error('[execute] DB addMessage(payment-resp) failed:', e));
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
            lat.endPhase('llm_chat');
            lat.finish(true, { skillName: agent.matchedSkill?.name, completedVia: 'chat' });
          },
          onError(error) {
            console.error('[execute] taskId=%s ERROR: %s', taskId, error);
            send('error', { error });
            workflowEngine.updateTaskStatus(taskId, 'failed').catch(e => console.error('[execute] DB updateStatus failed:', e));
            taskTimer.end({ success: false, metadata: { error } });
            lat.finish(false, { error, completedVia: 'chat' });
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

            // ─── Phase: handoff_setup ──────────────────────────────────
            lat.endPhase('llm_chat');  // end chat phase
            lat.startPhase('handoff_setup');

            // Lazy relay connection — only connect when we actually need the laptop
            try {
              await ensureRelayConnected();
            } catch (relayErr) {
              const msg = relayErr instanceof Error ? relayErr.message : 'Relay connection failed';
              console.error('[execute] taskId=%s relay connect failed during handoff: %s', taskId, msg);
              lat.endPhase('handoff_setup', { error: msg });
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
            lat.endPhase('handoff_setup', { skill: handoff.skill?.name });
            lat.startPhase('browser_execution');  // starts when handoff sent, ends on task_complete/error
            // Don't close the stream — keep it open for task events from the laptop
          },
        };

        await workflowEngine.addMessage(taskId, 'user', message);
        console.log('[execute] taskId=%s starting agent.execute()', taskId);
        lat.startPhase('llm_chat');  // LLM conversation phase (ends on handoff or completion)
        await agent.execute(message, callbacks);
        console.log('[execute] taskId=%s agent.execute() finished', taskId);

      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        const stack = error instanceof Error ? error.stack : '';
        console.error('[execute] taskId=%s FATAL ERROR: %s\n%s', taskId, errorMsg, stack);
        send('error', { error: errorMsg });
        await workflowEngine.updateTaskStatus(taskId, 'failed');
        taskTimer.end({ success: false, metadata: { error: errorMsg } });
        lat.finish(false, { error: errorMsg, completedVia: 'fatal_error' });
      } finally {
        if (handoffSent) {
          // Handoff was sent to laptop — keep the stream, heartbeat, and event listener alive.
          // task_complete or task_error from the laptop will close the stream.
          console.log('[execute] taskId=%s agent.execute() finished, handoff active — stream stays open (heartbeat running)', taskId);
        } else {
          clearInterval(heartbeatTimer);
          if (taskEventCleanup) taskEventCleanup();
          console.log('[execute] taskId=%s stream closing', taskId);
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
