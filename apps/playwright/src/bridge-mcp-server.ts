#!/usr/bin/env node
/**
 * Bridge MCP Server — communication bridge between Copilot CLI and ShofferAI Cloud Run.
 *
 * Spawned by Copilot CLI via --additional-mcp-config (stdio transport).
 * Connects to TaskManager via local WebSocket on ws://localhost:{BRIDGE_WS_PORT}.
 *
 * Provides tools:
 *   - ask_user: Ask the user a question and wait for response
 *   - confirm_action: Ask for confirmation before irreversible actions
 *   - request_payment: Request payment and wait for confirmation
 *   - send_progress: Send a progress update to the user (non-blocking)
 *
 * Environment variables:
 *   BRIDGE_WS_PORT — Port of TaskManager's local WebSocket server
 *   BRIDGE_TASK_ID — Unique task ID for this execution
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import WebSocket from 'ws';
import { randomUUID } from 'crypto';
import { shouldSuppressMessage } from '@shofferai/shared';
import type {
  BridgeOutgoingMessage,
  BridgeIncomingMessage,
  BridgeAskUserMessage,
  BridgeRequestPaymentMessage,
} from '@shofferai/shared';

// ─── Configuration ────────────────────────────────────────────────────────

const BRIDGE_WS_PORT = process.env.BRIDGE_WS_PORT;
const BRIDGE_TASK_ID = process.env.BRIDGE_TASK_ID;
const WS_CONNECT_TIMEOUT_MS = 10_000;
const INPUT_TIMEOUT_MS = 5 * 60_000;   // 5 minutes for user input
const PAYMENT_TIMEOUT_MS = 10 * 60_000; // 10 minutes for payment

if (!BRIDGE_WS_PORT || !BRIDGE_TASK_ID) {
  console.error('Bridge MCP Server requires BRIDGE_WS_PORT and BRIDGE_TASK_ID env vars');
  process.exit(1);
}

// ─── WebSocket Connection to TaskManager ──────────────────────────────────

type PendingRequest = {
  resolve: (value: string | Record<string, unknown>) => void;
  reject: (error: Error) => void;
  timeoutId: ReturnType<typeof setTimeout>;
};

let ws: WebSocket | null = null;
const pendingRequests = new Map<string, PendingRequest>();

function sendToTaskManager(msg: BridgeOutgoingMessage): void {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    throw new Error('Bridge WebSocket not connected to TaskManager');
  }
  ws.send(JSON.stringify(msg));
}

function waitForResponse(
  stepId: string,
  timeoutMs: number,
  label: string,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      pendingRequests.delete(stepId);
      reject(new Error(`${label} timed out after ${timeoutMs / 1000}s`));
    }, timeoutMs);

    pendingRequests.set(stepId, {
      resolve: (value) => resolve(String(value)),
      reject,
      timeoutId,
    });
  });
}

function handleIncomingMessage(data: string): void {
  let msg: BridgeIncomingMessage;
  try {
    msg = JSON.parse(data);
  } catch {
    console.error('Bridge: invalid JSON from TaskManager:', data);
    return;
  }

  if (msg.type === 'bridge_input_response' || msg.type === 'bridge_payment_response') {
    const pending = pendingRequests.get(msg.stepId);
    if (pending) {
      clearTimeout(pending.timeoutId);
      pendingRequests.delete(msg.stepId);
      if (msg.type === 'bridge_input_response') {
        pending.resolve(msg.value);
      } else {
        pending.resolve(msg.confirmed ? 'confirmed' : 'cancelled');
      }
    }
  } else if (msg.type === 'bridge_cancel') {
    // Cancel all pending requests
    for (const [stepId, pending] of pendingRequests) {
      clearTimeout(pending.timeoutId);
      pending.reject(new Error(`Task cancelled: ${msg.reason || 'user cancelled'}`));
    }
    pendingRequests.clear();
  } else if (msg.type === 'bridge_registered') {
    console.error(`Bridge: registered for task ${msg.taskId}`);
  }
}

async function connectToTaskManager(): Promise<void> {
  return new Promise((resolve, reject) => {
    const url = `ws://127.0.0.1:${BRIDGE_WS_PORT}`;
    const timeout = setTimeout(() => {
      reject(new Error(`Bridge: failed to connect to TaskManager at ${url} within ${WS_CONNECT_TIMEOUT_MS}ms`));
    }, WS_CONNECT_TIMEOUT_MS);

    ws = new WebSocket(url);

    ws.on('open', () => {
      clearTimeout(timeout);
      console.error(`Bridge: connected to TaskManager at ${url}`);
      // Register this bridge for the task
      sendToTaskManager({ type: 'bridge_register', taskId: BRIDGE_TASK_ID! });
      resolve();
    });

    ws.on('message', (data) => {
      handleIncomingMessage(data.toString());
    });

    ws.on('close', () => {
      console.error('Bridge: WebSocket closed');
      // Reject all pending requests
      for (const [, pending] of pendingRequests) {
        clearTimeout(pending.timeoutId);
        pending.reject(new Error('Bridge WebSocket connection closed'));
      }
      pendingRequests.clear();
      ws = null;
    });

    ws.on('error', (err) => {
      clearTimeout(timeout);
      console.error('Bridge: WebSocket error:', err.message);
      reject(err);
    });
  });
}

// ─── MCP Server Setup ─────────────────────────────────────────────────────

const mcpServer = new McpServer({
  name: 'shofferai-bridge',
  version: '1.0.0',
});

// Tool: ask_user
mcpServer.registerTool(
  'ask_user',
  {
    description:
      'Ask the user a question and wait for their response. Use this when you need user input ' +
      'to proceed (e.g., choosing a hotel, confirming details, providing an OTP). ' +
      'The question is shown in the ShofferAI chat UI and the user types their response. ' +
      'For product selection, use input_type="card_grid" with cards array containing product details and images.',
    inputSchema: {
      question: z.string().describe('The question to ask the user'),
      options: z
        .array(z.string())
        .optional()
        .describe('Optional list of choices for a multiple-choice question'),
      input_type: z
        .enum(['text', 'choice', 'otp', 'confirmation', 'freetext', 'card_grid', 'carousel', 'chip_bar', 'address', 'calendar', 'stepper', 'slider', 'layout', 'product_card'])
        .optional()
        .describe('Type of input widget to show. Use "card_grid" for product selection with images, "carousel" for visual choices, "chip_bar" for toggleable filters, "product_card" for final product display with Add to Cart'),
      cards: z
        .array(z.object({
          id: z.string().describe('Unique card identifier'),
          label: z.string().describe('Product name or title'),
          image: z.string().optional().describe('Product image URL'),
          subtitle: z.string().optional().describe('Price and weight, e.g. "₹29 · 500 ml"'),
          badge: z.string().optional().describe('Badge text, e.g. "8% OFF" or "Bestseller"'),
          emoji: z.string().optional().describe('Emoji icon for the card'),
        }))
        .optional()
        .describe('Visual cards for card_grid or carousel input types'),
      show_quantity: z.boolean().optional().describe('Show quantity stepper on each card (card_grid)'),
      allow_custom: z.boolean().optional().describe('Allow user to add custom items (card_grid, carousel)'),
      multi_select: z.boolean().optional().describe('Allow multiple selections (card_grid, carousel, chip_bar)'),
      shortcuts: z.array(z.string()).optional().describe('Quick-pick shortcut buttons'),
      min: z.number().optional().describe('Minimum value for stepper/slider'),
      max: z.number().optional().describe('Maximum value for stepper/slider'),
      step: z.number().optional().describe('Step increment for stepper/slider'),
      presets: z.array(z.number()).optional().describe('Preset values for stepper/slider'),
      placeholder: z.string().optional().describe('Placeholder text for text input'),
      format_hint: z.string().optional().describe('Format hint for text input'),
      product: z.object({
        id: z.string(),
        name: z.string(),
        image: z.string().optional(),
        price: z.number(),
        mrp: z.number().optional(),
        discount: z.string().optional(),
        rating: z.number().optional(),
        ratingCount: z.string().optional(),
        delivery: z.string().optional(),
        deliveryFree: z.boolean().optional(),
        specs: z.array(z.string()).optional(),
        offers: z.array(z.string()).optional(),
        color: z.string().optional(),
        store: z.string(),
      }).optional().describe('Product data for product_card input type'),
    },
  },
  async ({ question, options, input_type, cards, show_quantity, allow_custom, multi_select, shortcuts, min, max, step, presets, placeholder, format_hint, product }) => {
    const stepId = randomUUID();
    const inputType = input_type || (options?.length ? 'choice' : 'text');

    const msg: BridgeAskUserMessage = {
      type: 'bridge_ask_user',
      taskId: BRIDGE_TASK_ID!,
      stepId,
      question,
      inputType: inputType as BridgeAskUserMessage['inputType'],
      options,
      cards: cards as BridgeAskUserMessage['cards'],
      show_quantity,
      allow_custom,
      multi_select,
      shortcuts,
      min,
      max,
      step,
      presets,
      placeholder,
      format_hint,
      product: product as BridgeAskUserMessage['product'],
    };

    // ── Image validation: bounce back if carousel/card_grid/product_card lacks real image URLs ──
    if (inputType === 'carousel' || inputType === 'card_grid') {
      const cardsList = cards as Array<{ id: string; image?: string }> | undefined;
      const hasRealImages = cardsList?.some(c => c.image?.startsWith('http'));
      if (cardsList && cardsList.length > 0 && !hasRealImages) {
        return {
          content: [{ type: 'text' as const, text: '[SYSTEM: Your carousel/card_grid cards are missing real image URLs — they have emoji or placeholder text instead. Take a browser_snapshot of the current page, find the <img> src URLs for each product card, then re-call ask_user with the image field set to the actual https:// URL for each card. Do NOT use emoji or placeholder text.]' }],
        };
      }
    }
    if (inputType === 'product_card') {
      const prod = product as { image?: string } | undefined;
      if (prod && !prod.image?.startsWith('http')) {
        return {
          content: [{ type: 'text' as const, text: '[SYSTEM: Your product_card is missing an image URL. Take a browser_snapshot, find the product image <img> src URL, then re-call ask_user with product.image set to the actual https:// URL.]' }],
        };
      }
    }

    sendToTaskManager(msg);

    try {
      const response = await waitForResponse(stepId, INPUT_TIMEOUT_MS, 'User input');
      return {
        content: [{ type: 'text' as const, text: response }],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text' as const,
            text: `Error waiting for user input: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
        isError: true,
      };
    }
  },
);

// Tool: confirm_action
mcpServer.registerTool(
  'confirm_action',
  {
    description:
      'Ask the user to confirm before proceeding with an irreversible action ' +
      '(e.g., placing an order, completing a booking). Returns "confirmed" or "cancelled".',
    inputSchema: {
      action: z.string().describe('Description of the action to confirm'),
      details: z.string().optional().describe('Additional details like price, items, dates'),
    },
  },
  async ({ action, details }) => {
    const stepId = randomUUID();
    const question = details ? `${action}\n\nDetails: ${details}` : action;

    const msg: BridgeAskUserMessage = {
      type: 'bridge_ask_user',
      taskId: BRIDGE_TASK_ID!,
      stepId,
      question,
      inputType: 'confirmation',
      options: ['Confirm', 'Cancel'],
    };

    sendToTaskManager(msg);

    try {
      const response = await waitForResponse(stepId, INPUT_TIMEOUT_MS, 'Confirmation');
      const confirmed = response.toLowerCase().includes('confirm') || response.toLowerCase() === 'yes';
      return {
        content: [{ type: 'text' as const, text: confirmed ? 'confirmed' : 'cancelled' }],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text' as const,
            text: `Error waiting for confirmation: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
        isError: true,
      };
    }
  },
);

// Tool: request_payment
mcpServer.registerTool(
  'request_payment',
  {
    description:
      'Request payment from the user before completing a booking or order. ' +
      'This shows a payment dialog (Razorpay) in the chat UI. ' +
      'The tool blocks until the user completes or cancels payment. ' +
      'Returns "confirmed" with paymentId on success, or "cancelled".',
    inputSchema: {
      amount: z.number().describe('Payment amount in INR (e.g., 3500 for ₹3,500)'),
      description: z.string().describe('What the payment is for (e.g., "Hotel booking at Goa Resort")'),
      booking_summary: z
        .string()
        .optional()
        .describe('JSON string with booking details to show the user'),
    },
  },
  async ({ amount, description, booking_summary }) => {
    const stepId = randomUUID();
    // Keep bookingSummary as a JSON string — downstream (execute/route, BookingSummaryCard) expects a string
    let bookingSummary: string | undefined;
    if (booking_summary) {
      try {
        JSON.parse(booking_summary); // validate JSON
        bookingSummary = booking_summary;
      } catch {
        bookingSummary = JSON.stringify({ raw: booking_summary });
      }
    }

    const msg: BridgeRequestPaymentMessage = {
      type: 'bridge_request_payment',
      taskId: BRIDGE_TASK_ID!,
      stepId,
      amount,
      description,
      bookingSummary,
    };

    sendToTaskManager(msg);

    try {
      const response = await waitForResponse(stepId, PAYMENT_TIMEOUT_MS, 'Payment');
      if (response === 'confirmed') {
        return {
          content: [{ type: 'text' as const, text: 'Payment confirmed. Proceeding with the order.' }],
        };
      } else {
        return {
          content: [{ type: 'text' as const, text: 'Payment cancelled by user. Do NOT proceed with the order.' }],
        };
      }
    } catch (error) {
      return {
        content: [
          {
            type: 'text' as const,
            text: `Payment error: ${error instanceof Error ? error.message : 'Unknown error'}. Do NOT proceed.`,
          },
        ],
        isError: true,
      };
    }
  },
);

// Tool: send_progress
mcpServer.registerTool(
  'send_progress',
  {
    description:
      'Send a progress update to the user. This is non-blocking — the message is shown ' +
      'in the chat UI as a status update. Use this to keep the user informed about what ' +
      'you are doing (e.g., "Searching for hotels...", "Found 5 options under budget").',
    inputSchema: {
      message: z.string().describe('Progress message to display to the user'),
      step: z.string().optional().describe('Optional step name for tracking'),
    },
  },
  async ({ message, step }) => {
    // Filter internal reasoning/narration before it reaches the user
    if (shouldSuppressMessage(message)) {
      console.error(`[bridge] suppressed internal message: ${message.slice(0, 80)}`);
      return {
        content: [{ type: 'text' as const, text: 'Progress update sent.' }],
      };
    }
    sendToTaskManager({
      type: 'bridge_progress',
      taskId: BRIDGE_TASK_ID!,
      message,
      step,
    });
    return {
      content: [{ type: 'text' as const, text: 'Progress update sent.' }],
    };
  },
);

// ─── Main ─────────────────────────────────────────────────────────────────

async function main() {
  // Connect to TaskManager first
  await connectToTaskManager();

  // Then start the MCP server on stdio
  const transport = new StdioServerTransport();
  await mcpServer.connect(transport);
  console.error(`Bridge MCP Server running for task ${BRIDGE_TASK_ID}`);
}

main().catch((error) => {
  console.error('Bridge MCP Server fatal error:', error);
  process.exit(1);
});

// Clean up on exit
process.on('SIGTERM', () => {
  console.error('Bridge: SIGTERM received, closing');
  ws?.close();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.error('Bridge: SIGINT received, closing');
  ws?.close();
  process.exit(0);
});
