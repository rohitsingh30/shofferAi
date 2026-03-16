import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { AgentExecutor, type AgentCallbacks } from '@shofferai/agent-core';
import { CredentialInjector } from '@/lib/credential-vault';
import { SessionMCPHost } from '@/lib/session-mcp-host';
import { remoteMcpHost, workflowEngine, vault, skills } from '@/lib/singletons';
import { track, trackTimed } from '@/lib/telemetry';

async function ensureRelayConnected() {
  if (!remoteMcpHost.isConnected()) {
    await remoteMcpHost.connect();
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { message } = await request.json();
  if (!message) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 });
  }

  const userId = session.user.id;

  // Create task in DB
  const taskId = await workflowEngine.createTask(userId, message);
  await workflowEngine.updateTaskStatus(taskId, 'running');

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
            name: session.user?.name || undefined,
            email: session.user?.email || undefined,
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
            send('message', { content });
            workflowEngine.addMessage(taskId, 'assistant', content).catch(console.error);
          },
          onStepUpdate(step) {
            send('step_update', step);
          },
          async onInputRequired(request) {
            send('input_required', {
              taskId,
              stepId: request.stepId,
              question: request.question,
              inputType: request.inputType,
              options: request.options,
            });

            // Wait for user to provide input via /api/agent/input
            const pauseManager = workflowEngine.getPauseManager();
            const response = await pauseManager.waitForInput({
              ...request,
              taskId,
            });
            return response;
          },
          async onConfirmRequired(details) {
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
            return response.value === 'yes';
          },
          async onPaymentRequired(details: { bookingSummary: string; amountInr: number; description: string }) {
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
            return response.value === 'confirmed';
          },
          onComplete(summary) {
            send('complete', { summary });
            workflowEngine.updateTaskStatus(taskId, 'completed').catch(console.error);
            taskTimer.end({ success: true, metadata: { skillName: agent.matchedSkill?.name } });
          },
          onError(error) {
            send('error', { error });
            workflowEngine.updateTaskStatus(taskId, 'failed').catch(console.error);
            taskTimer.end({ success: false, metadata: { error } });
          },
        };

        await workflowEngine.addMessage(taskId, 'user', message);
        await agent.execute(message, callbacks);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        send('error', { error: errorMsg });
        await workflowEngine.updateTaskStatus(taskId, 'failed');
        taskTimer.end({ success: false, metadata: { error: errorMsg } });
      } finally {
        // Release Chrome slot on the laptop
        remoteMcpHost.releaseSession(taskId).catch(() => {});
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
