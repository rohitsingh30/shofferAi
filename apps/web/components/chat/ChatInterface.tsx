'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageBubble, type Message } from './MessageBubble';
import { TaskProgress, type StepInfo } from './TaskProgress';
import { ThinkingIndicator } from './ThinkingIndicator';
import { InputPrompt } from './InputPrompt';
import { CartSummary, type CartItem } from './CartSummary';
// shouldSuppressMessage removed from client — server-side two-tier filter (regex + AI rewrite) is authoritative
import type { ProductCardData } from '@shofferai/shared';
import { L2PaymentProvider, useL2Payment } from './L2PaymentContext';
import { L2CartProvider, useL2Cart } from './L2CartContext';
import { CartProvider, useCart } from './CartContext';
import { L2SplitView } from './L2SplitView';
import { PaymentPanel } from './PaymentPanel';
import { L2CartPanel } from './L2CartPanel';
import { CartBar } from './CartBar';

const ALL_SUGGESTIONS = [
  { text: 'Book a hotel in Goa this weekend under ₹4000/night', icon: '🏨', category: 'Travel' },
  { text: 'Order milk, bread & eggs from Blinkit', icon: '🛒', category: 'Grocery' },
  { text: 'Order butter chicken from Zomato', icon: '🍛', category: 'Food' },
  { text: 'Order biryani from Swiggy', icon: '🍲', category: 'Food' },
  { text: 'Buy wireless earbuds under ₹2000 from Flipkart', icon: '🎧', category: 'Shopping' },
  { text: 'Order rice, dal & oil from Zepto', icon: '⚡', category: 'Grocery' },
  { text: 'Buy a kurta for men from Myntra under ₹1500', icon: '👕', category: 'Shopping' },
  { text: 'Order fruits and veggies from BigBasket', icon: '🥬', category: 'Grocery' },
];

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function ChatInterfaceInner() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentSteps, setCurrentSteps] = useState<StepInfo[]>([]);
  const [pendingInput, setPendingInput] = useState<{
    taskId: string;
    stepId: string;
    question: string;
    inputType: string;
    options?: string[];
    cards?: Array<{ id: string; label: string; emoji?: string; image?: string; subtitle?: string; badge?: string }>;
    show_quantity?: boolean;
    allow_custom?: boolean;
    multi_select?: boolean;
    saved?: Array<{ label: string; address: string }>;
    mode?: 'single' | 'range';
    shortcuts?: string[];
    counters?: Array<{ label: string; min?: number; max?: number; default?: number }>;
    min?: number;
    max?: number;
    step?: number;
    presets?: number[];
    placeholder?: string;
    format_hint?: string;
    sections?: Array<Record<string, unknown>>;
    product?: ProductCardData;
  } | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartTotal, setCartTotal] = useState('');
  const [cartStore, setCartStore] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const taskIdRef = useRef<string | null>(null);
  const { openL2, closeL2 } = useL2Payment();
  const { closeCart } = useL2Cart();
  const { clearCart, setTaskId: setCartTaskId, syncFromAgent, addItem } = useCart();

  // Pick suggestions on client mount only — avoids hydration mismatch
  const [suggestions, setSuggestions] = useState(ALL_SUGGESTIONS.slice(0, 4));
  const [greeting, setGreeting] = useState('Hey there');

  useEffect(() => {
    const rest = ALL_SUGGESTIONS.slice(1);
    const shuffled = [...rest].sort(() => Math.random() - 0.5);
    setSuggestions([ALL_SUGGESTIONS[0], ...shuffled.slice(0, 3)]);
    setGreeting(getGreeting());
  }, []);

  const resetChat = useCallback(() => {
    // Send explicit cancel to server before aborting the SSE stream.
    // Fire-and-forget — UI resets immediately regardless of cancel result.
    if (taskIdRef.current) {
      fetch('/api/agent/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId: taskIdRef.current }),
      }).catch(() => {});
      taskIdRef.current = null;
    }
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setMessages([]);
    setInput('');
    setIsLoading(false);
    setCurrentSteps([]);
    setPendingInput(null);
    setCartItems([]);
    setCartTotal('');
    setCartStore('');
    // Close L2 panels and clear cart context
    closeL2();
    closeCart();
    clearCart();
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
  }, [closeL2, closeCart, clearCart]);

  useEffect(() => {
    const handler = () => resetChat();
    window.addEventListener('newchat', handler);
    return () => window.removeEventListener('newchat', handler);
  }, [resetChat]);

  useEffect(() => {
    return () => {
      if (abortRef.current) {
        abortRef.current.abort();
        abortRef.current = null;
      }
    };
  }, []);

  // Cancel running task when user closes the tab or browser window.
  // fetch+keepalive survives page teardown (like sendBeacon) but supports
  // proper Content-Type headers so the cancel endpoint parses JSON correctly.
  useEffect(() => {
    const cancelOnUnload = () => {
      const tid = taskIdRef.current;
      if (!tid) return;
      taskIdRef.current = null;
      // keepalive: true keeps the request alive after page destruction
      fetch('/api/agent/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId: tid }),
        keepalive: true,
      }).catch(() => {});
    };
    window.addEventListener('beforeunload', cancelOnUnload);
    window.addEventListener('pagehide', cancelOnUnload);
    return () => {
      window.removeEventListener('beforeunload', cancelOnUnload);
      window.removeEventListener('pagehide', cancelOnUnload);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentSteps, cartItems]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 200) + 'px';
  }, []);

  const handleSSEEvent = useCallback((event: { type: string; payload: Record<string, unknown> }) => {
    // Capture taskId for cancel support
    if (event.payload.taskId) {
      taskIdRef.current = event.payload.taskId as string;
    }

    switch (event.type) {
      case 'task_started':
        // Set taskId on cart so payment uses the real task ID
        setCartTaskId(event.payload.taskId as string);
        break;
      case 'message': {
        const content = event.payload.content as string;
        // Server-side two-tier filter (regex + AI rewrite) already cleaned this message.
        // No client-side suppression — that caused false positives and vanishing messages.
        setMessages((prev) => [
          ...prev,
          {
            id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            role: 'assistant',
            content,
          },
        ]);
        break;
      }
      case 'step_update': {
        const action = event.payload.action as string;
        const status = event.payload.status as string;

        if (status === 'cart_update') {
          try {
            const cartData = JSON.parse(action);
            if (cartData._type === 'cart_update') {
              setCartItems(cartData.items || []);
              setCartTotal(cartData.total || '');
              setCartStore(cartData.store || '');
              // Sync to CartContext so CartBar appears at the bottom
              syncFromAgent(cartData.items || [], cartData.store || '', cartData.total || '');
              break;
            }
          } catch {
            // Not JSON, treat as normal step
          }
        }

        if (status === 'order_placed' || status === 'order_failed' || status === 'order_status') {
          try {
            const orderData = JSON.parse(action);
            if (orderData._type === 'order_status_update') {
              if (status === 'order_placed') {
                handleSSEEvent({
                  type: 'order_placed',
                  payload: {
                    orderNumber: '',
                    targetSite: '',
                    targetOrderId: orderData.targetOrderId,
                    targetOrderUrl: orderData.targetOrderUrl,
                    targetTrackingUrl: orderData.targetTrackingUrl,
                    estimatedDelivery: orderData.estimatedDelivery,
                  },
                });
              } else if (status === 'order_failed') {
                handleSSEEvent({
                  type: 'order_failed',
                  payload: {
                    orderNumber: '',
                    reason: orderData.failureReason || 'Checkout failed',
                  },
                });
              } else {
                // order_status: shipped, out_for_delivery, delivered, cancelled
                handleSSEEvent({
                  type: 'order_status',
                  payload: {
                    orderNumber: orderData.orderNumber || '',
                    status: orderData.status,
                    message: orderData.message || '',
                    targetTrackingUrl: orderData.targetTrackingUrl,
                    targetSite: orderData.targetSite || '',
                  },
                });
              }
              break;
            }
          } catch {
            // Not JSON, treat as normal step
          }
        }

        if (status === 'running' && !action.startsWith('🧠 ') && !action.startsWith('⚡ ') && !action.startsWith('🔄 ')) break;

        setCurrentSteps((prev) => {
          const step: StepInfo = { action, status };
          const idx = prev.findIndex((s) => s.action === step.action);
          if (idx >= 0) {
            const updated = [...prev];
            updated[idx] = step;
            return updated;
          }
          return [...prev, step];
        });
        break;
      }
      case 'input_required': {
        setCurrentSteps([]); // Clear progress card so InputPrompt is visible
        const p = event.payload;
        setPendingInput({
          taskId: p.taskId as string,
          stepId: p.stepId as string,
          question: p.question as string,
          inputType: p.inputType as string,
          options: p.options as string[] | undefined,
          cards: p.cards as typeof pendingInput extends null ? never : NonNullable<typeof pendingInput>['cards'],
          show_quantity: p.show_quantity as boolean | undefined,
          allow_custom: p.allow_custom as boolean | undefined,
          multi_select: p.multi_select as boolean | undefined,
          saved: p.saved as typeof pendingInput extends null ? never : NonNullable<typeof pendingInput>['saved'],
          mode: p.mode as 'single' | 'range' | undefined,
          shortcuts: p.shortcuts as string[] | undefined,
          counters: p.counters as typeof pendingInput extends null ? never : NonNullable<typeof pendingInput>['counters'],
          min: p.min as number | undefined,
          max: p.max as number | undefined,
          step: p.step as number | undefined,
          presets: p.presets as number[] | undefined,
          placeholder: p.placeholder as string | undefined,
          format_hint: p.format_hint as string | undefined,
          sections: p.sections as Array<Record<string, unknown>> | undefined,
          product: p.product as ProductCardData | undefined,
        });
        setIsLoading(false);
        break;
      }
      case 'payment_required':
        openL2({
          taskId: event.payload.taskId as string,
          stepId: (event.payload.stepId as string | undefined) || 'payment',
          bookingSummary: event.payload.bookingSummary as string,
          amountCents: event.payload.amountCents as number,
          serviceFeeCents: event.payload.serviceFeeCents as number,
          description: event.payload.description as string | undefined,
        });
        break;
      case 'order_confirmed': {
        const p = event.payload;
        setMessages((prev) => [
          ...prev,
          {
            id: `order-confirmed-${Date.now()}`,
            role: 'assistant',
            content: '',
            orderConfirmed: {
              orderNumber: p.orderNumber as string,
              items: p.items as Array<{ name: string; qty?: number; quantity?: number; priceCents?: number; price?: string }>,
              productAmountCents: p.productAmountCents as number,
              serviceFeeCents: p.serviceFeeCents as number,
              totalCents: p.totalCents as number,
              targetSite: p.targetSite as string,
            },
          },
        ]);
        break;
      }
      case 'order_placed': {
        const p = event.payload;
        setMessages((prev) => [
          ...prev,
          {
            id: `order-placed-${Date.now()}`,
            role: 'assistant',
            content: '',
            orderPlaced: {
              orderNumber: p.orderNumber as string,
              targetSite: p.targetSite as string,
              targetOrderId: p.targetOrderId as string | undefined,
              targetOrderUrl: p.targetOrderUrl as string | undefined,
              targetTrackingUrl: p.targetTrackingUrl as string | undefined,
              estimatedDelivery: p.estimatedDelivery as string | undefined,
            },
          },
        ]);
        break;
      }
      case 'order_failed': {
        const p = event.payload;
        setMessages((prev) => [
          ...prev,
          {
            id: `order-failed-${Date.now()}`,
            role: 'assistant',
            content: '',
            orderFailed: {
              orderNumber: p.orderNumber as string,
              reason: (p.reason as string) || (p.message as string) || 'Unknown error',
              refundAmountCents: p.refundAmountCents as number | undefined,
            },
          },
        ]);
        break;
      }
      case 'order_status': {
        const p = event.payload;
        setMessages((prev) => [
          ...prev,
          {
            id: `order-status-${Date.now()}`,
            role: 'assistant',
            content: '',
            orderStatus: {
              orderNumber: p.orderNumber as string,
              status: p.status as string,
              message: (p.message as string) || '',
              targetTrackingUrl: p.targetTrackingUrl as string | undefined,
              targetSite: p.targetSite as string | undefined,
            },
          },
        ]);
        break;
      }
      case 'complete': {
        const summary = event.payload.summary as string | undefined;
        // Always show the completion summary as a message so users see the result
        if (summary) {
          setMessages((prev) => [
            ...prev,
            {
              id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              role: 'assistant',
              content: summary,
            },
          ]);
        }
        setCurrentSteps([]);
        break;
      }
      case 'error': {
        const errorText = event.payload.error as string;
        const errorCode = event.payload.code as string | undefined;
        const errorTaskId = event.payload.taskId as string | undefined;
        // Friendly timeout messages are already user-facing — show as-is
        const isFriendlyError = errorCode === 'INPUT_TIMEOUT';
        const ref = (!isFriendlyError && errorTaskId) ? ` (${errorCode || 'ERR'}:${errorTaskId.slice(-8)})` : '';
        const displayText = isFriendlyError ? errorText : `Something went wrong: ${errorText}${ref}`;
        setMessages((prev) => [
          ...prev,
          {
            id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            role: 'assistant',
            content: displayText,
          },
        ]);
        setCurrentSteps([]);
        break;
      }
    }
  }, [openL2, syncFromAgent]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;

    const userMessage: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      role: 'user',
      content: text.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
    setIsLoading(true);
    setCurrentSteps([]);

    try {
      const res = await fetch('/api/agent/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage.content }),
        signal: controller.signal,
      });

      if (!res.ok) throw new Error('Failed to execute');

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        let buffer = '';
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const event = JSON.parse(line.slice(6));
                  handleSSEEvent(event);
                } catch {
                  // skip
                }
              }
            }
          }
        } finally {
          reader.releaseLock();
        }
      }
    } catch (error: unknown) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          role: 'assistant',
          content: 'Something went wrong. Please try again.',
        },
      ]);
    } finally {
      setIsLoading(false);
      if (abortRef.current === controller) {
        abortRef.current = null;
      }
    }
  }, [isLoading, handleSSEEvent]);

  const handleInputResponse = async (value: string) => {
    if (!pendingInput) return;

    // When user confirms selections from card_grid/carousel, sync items to CartContext
    // so the floating CartBar appears at the bottom.
    if (
      (pendingInput.inputType === 'card_grid' || pendingInput.inputType === 'carousel') &&
      pendingInput.cards?.length
    ) {
      try {
        // Extract store name from question text (e.g., "from Blinkit", "on Flipkart")
        const storeMatch = pendingInput.question.match(/(?:from|on|at)\s+([A-Z][a-zA-Z]+)/);
        const store = storeMatch?.[1] || 'Cart';

        const parsePrice = (s?: string): number => {
          if (!s) return 0;
          const m = s.match(/₹([\d,]+)/);
          return m ? parseFloat(m[1].replace(/,/g, '')) : 0;
        };

        // CardGridInput: [{id, label, qty}], CarouselInput: ["id1"] or "id1"
        let parsed: unknown;
        try { parsed = JSON.parse(value); } catch { parsed = value; }

        let selectedIds: Array<{ id: string; qty: number }> = [];
        if (Array.isArray(parsed)) {
          selectedIds = parsed.map((item: unknown) =>
            typeof item === 'object' && item !== null && 'id' in item
              ? { id: (item as { id: string }).id, qty: (item as { qty?: number }).qty || 1 }
              : { id: String(item), qty: 1 },
          );
        } else if (typeof parsed === 'string' && parsed) {
          selectedIds = [{ id: parsed, qty: 1 }];
        } else if (typeof parsed === 'number') {
          selectedIds = [{ id: String(parsed), qty: 1 }];
        }

        if (selectedIds.length > 0) {
          for (const sel of selectedIds) {
            const card = pendingInput.cards?.find((c) => c.id === sel.id);
            const price = card?.subtitle ? parsePrice(card.subtitle) : 0;
            addItem({
              id: `input-${sel.id}-${Date.now()}`,
              name: card?.label || sel.id,
              price,
              store,
            });
          }
        }
      } catch {
        // parse error — ignore
      }
    }

    // Persist the question + selection as chat messages so the conversation
    // doesn't feel empty after the transient InputPrompt disappears.
    if (pendingInput.question) {
      const ts = Date.now();
      // Resolve user-friendly label for the selection
      let selectionLabel = value;
      if (pendingInput.cards?.length) {
        const card = pendingInput.cards.find((c) => c.id === String(value));
        if (card) selectionLabel = card.label;
      } else if (pendingInput.options?.length) {
        const idx = parseInt(value, 10);
        if (!isNaN(idx) && pendingInput.options[idx - 1]) {
          selectionLabel = pendingInput.options[idx - 1];
        }
      }
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-q-${ts}`,
          role: 'assistant',
          content: pendingInput!.question,
        },
        {
          id: `msg-a-${ts}`,
          role: 'user',
          content: selectionLabel,
        },
      ]);
    }

    try {
      const res = await fetch('/api/agent/input', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: pendingInput.taskId,
          stepId: pendingInput.stepId,
          value,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        console.error('Input delivery failed:', res.status, body);
        // Retry once after a short delay (pending entry may not be registered yet)
        if (res.status === 404) {
          await new Promise((r) => setTimeout(r, 1000));
          const retry = await fetch('/api/agent/input', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              taskId: pendingInput.taskId,
              stepId: pendingInput.stepId,
              value,
            }),
          });
          if (!retry.ok) {
            console.error('Input delivery retry failed:', retry.status);
          }
        }
      }
    } catch (error) {
      console.error('Failed to send input:', error);
    }
    setPendingInput(null);
    setIsLoading(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const isEmpty = messages.length === 0;

  const chatContent = (
    <div className="flex h-full flex-col">
      {isEmpty ? (
        /* ─── Empty State ─── */
        <div className="flex flex-1 flex-col items-center justify-center px-4 pb-4">
          {/* Ambient glow */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
            <div className="h-[500px] w-[500px] rounded-full bg-primary/[0.07] blur-[120px]" style={{ animation: 'glow-pulse 4s ease-in-out infinite' }} />
          </div>

          {/* Logo mark */}
          <div className="relative mb-6 animate-slide-up">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-violet-500 to-fuchsia-500 shadow-2xl shadow-primary/25">
              <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-background bg-success" />
          </div>

          <h2 className="mb-2 animate-slide-up text-3xl font-semibold tracking-tight" style={{ animationDelay: '0.05s' }}>
            {greeting} ✨
          </h2>
          <p className="mb-10 max-w-md animate-slide-up text-center text-[15px] leading-relaxed text-muted-foreground" style={{ animationDelay: '0.1s' }}>
            Tell me what you need — I&apos;ll browse, click, and get it done for you.
          </p>

          {/* Suggestion Cards */}
          <div className="grid w-full max-w-2xl grid-cols-1 gap-2.5 sm:grid-cols-2">
            {suggestions.map((s, i) => (
              <button
                key={s.text}
                onClick={() => sendMessage(s.text)}
                className="animate-slide-up group relative flex items-start gap-3.5 overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-4 text-left text-sm transition-all duration-300 hover:border-primary/25 hover:bg-white/[0.05] hover:shadow-xl hover:shadow-primary/[0.08] hover:-translate-y-0.5 active:scale-[0.98]"
                style={{ animationDelay: `${0.15 + i * 0.06}s` }}
              >
                {/* Hover glow overlay */}
                <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/[0.06] via-transparent to-violet-500/[0.04] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.05] text-lg ring-1 ring-white/[0.06] transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/10 group-hover:ring-primary/20 group-hover:shadow-lg group-hover:shadow-primary/10">{s.icon}</span>
                <div className="relative min-w-0 pt-0.5">
                  <span className="block text-[13px] leading-snug text-zinc-400 transition-colors group-hover:text-zinc-100">{s.text}</span>
                  <span className="mt-1 inline-flex items-center rounded-full bg-white/[0.04] px-2 py-0.5 text-[10px] font-medium text-zinc-600 transition-colors group-hover:bg-primary/10 group-hover:text-primary/70">{s.category}</span>
                </div>
                <svg className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-800 transition-all duration-300 group-hover:text-primary/50 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* ─── Messages ─── */
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl px-4 py-8">
            <div className="space-y-5">
              {messages.map((message, i) => (
                <div key={message.id} className="animate-fade-in" style={{ animationDelay: `${Math.min(i * 0.05, 0.3)}s` }}>
                  <MessageBubble message={message} />
                </div>
              ))}

              {cartItems.length > 0 && (
                <div className="animate-fade-in">
                  <CartSummary items={cartItems} total={cartTotal} store={cartStore} />
                </div>
              )}

              {currentSteps.length > 0 && (
                <div className="animate-fade-in">
                  <TaskProgress steps={currentSteps} />
                </div>
              )}

              {pendingInput && (
                <div className="animate-fade-in">
                  <InputPrompt
                    question={pendingInput.question}
                    inputType={pendingInput.inputType}
                    options={pendingInput.options}
                    cards={pendingInput.cards}
                    show_quantity={pendingInput.show_quantity}
                    allow_custom={pendingInput.allow_custom}
                    multi_select={pendingInput.multi_select}
                    saved={pendingInput.saved}
                    mode={pendingInput.mode}
                    shortcuts={pendingInput.shortcuts}
                    counters={pendingInput.counters}
                    min={pendingInput.min}
                    max={pendingInput.max}
                    step={pendingInput.step}
                    presets={pendingInput.presets}
                    placeholder={pendingInput.placeholder}
                    format_hint={pendingInput.format_hint}
                    sections={pendingInput.sections as any}
                    product={pendingInput.product}
                    onSubmit={handleInputResponse}
                  />
                </div>
              )}

              {isLoading && currentSteps.length === 0 && (
                <div className="animate-fade-in">
                  <ThinkingIndicator />
                </div>
              )}
            </div>
            <div ref={messagesEndRef} className="h-6" />
          </div>
        </div>
      )}

      {/* ─── Cart Bar ─── */}
      {!isEmpty && <CartBar />}

      {/* ─── Input Area ─── */}
      <div className={`px-4 pb-5 pt-3 ${isEmpty ? '' : 'border-t border-white/[0.04]'}`}>
        <form onSubmit={handleSubmit} className="mx-auto max-w-3xl">
          <div
            className={`gradient-border relative rounded-2xl bg-zinc-900/80 backdrop-blur-xl transition-all duration-300 ${
              isFocused
                ? 'shadow-lg shadow-primary/10 ring-1 ring-primary/20'
                : 'ring-1 ring-white/[0.08] hover:ring-white/[0.12]'
            }`}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="What do you need done?"
              disabled={isLoading}
              rows={1}
              className="w-full resize-none bg-transparent px-4 py-3.5 pr-14 text-[14px] leading-relaxed text-white placeholder:text-zinc-500 focus:outline-none disabled:opacity-40"
              style={{ maxHeight: '200px' }}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className={`absolute bottom-2 right-2 flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200 ${
                input.trim() && !isLoading
                  ? 'bg-primary text-white shadow-lg shadow-primary/25 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 active:scale-95'
                  : 'bg-zinc-800 text-zinc-600'
              }`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
              </svg>
            </button>
          </div>
          <div className="mt-2 flex items-center justify-center gap-1.5 text-[11px] text-zinc-600">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
            <span>Your payment info is encrypted end-to-end</span>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <L2SplitView paymentPanel={<PaymentPanel />} cartPanel={<L2CartPanel />}>
      {chatContent}
    </L2SplitView>
  );
}

export function ChatInterface() {
  return (
    <CartProvider>
      <L2PaymentProvider>
        <L2CartProvider>
          <ChatInterfaceInner />
        </L2CartProvider>
      </L2PaymentProvider>
    </CartProvider>
  );
}
