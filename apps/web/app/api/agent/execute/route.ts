import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AgentExecutor, type AgentCallbacks } from '@shofferai/agent-core';
import { CredentialInjector } from '@/lib/credential-vault';
import { SessionMCPHost } from '@/lib/session-mcp-host';
import { remoteMcpHost, workflowEngine, vault, skills } from '@/lib/singletons';
import { track, trackTimed } from '@/lib/telemetry';
import { getAuthUser } from '@/lib/auth-helper';

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

      try {
        console.log('[execute] taskId=%s connecting relay...', taskId);
        await ensureRelayConnected();
        // Per-request MCP host with tab isolation: each task gets its own browser tab
        const mcpHost = new SessionMCPHost(remoteMcpHost, taskId);

        const injector = new CredentialInjector(vault, userId);

        const agent = new AgentExecutor({
          mcpHost,
          credentialInjector: injector,
          skills,
          vault,
          trackEvent: track,
          taskId,
          userContext: {
            name: authUser.name || undefined,
            email: authUser.email || undefined,
            userId,
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
              // Rich input props
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

            // Wait for user to provide input via /api/agent/input
            const pauseManager = workflowEngine.getPauseManager();
            const response = await pauseManager.waitForInput({
              ...request,
              taskId,
            });
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

            const pauseManager = workflowEngine.getPauseManager();
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
            // Send payment_required event to frontend — opens L2 panel
            send('payment_required', {
              taskId,
              bookingSummary: details.bookingSummary,
              amountCents: Math.round(details.amountInr * 100),
              serviceFeeCents: 0,
              description: details.description,
            });

            // Block until payment is verified
            const pauseManager = workflowEngine.getPauseManager();
            const response = await pauseManager.waitForInput({
              taskId,
              stepId: 'payment',
              question: 'Waiting for payment confirmation',
              inputType: 'payment',
              timeout: 600000, // 10 minutes
            });
            console.log('[execute] taskId=%s payment response=%s', taskId, response.value);
            return response.value === 'confirmed';
          },
          onComplete(summary) {
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
        // Release Chrome slot on the laptop
        console.log('[execute] taskId=%s stream closing, releasing session', taskId);
        remoteMcpHost.releaseSession(taskId).catch(e => console.warn('[execute] releaseSession failed:', e));
        controller.close();
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
