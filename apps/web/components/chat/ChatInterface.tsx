'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageBubble, type Message } from './MessageBubble';
import { TaskProgress, type StepInfo } from './TaskProgress';
import { InputPrompt } from './InputPrompt';
import { CartSummary, type CartItem } from './CartSummary';
import { L2PaymentProvider, useL2Payment } from './L2PaymentContext';
import { L2SplitView } from './L2SplitView';
import { PaymentPanel } from './PaymentPanel';

const ALL_SUGGESTIONS = [
  { text: 'Book a hotel in Goa this weekend under 4000/night', icon: '🏨' },
  { text: 'Order milk and bread from Blinkit', icon: '🛒' },
  { text: 'Order butter chicken from Zomato', icon: '🍛' },
  { text: 'Order biryani from Swiggy', icon: '🍲' },
  { text: 'Buy wireless earbuds under 2000 from Flipkart', icon: '🛍️' },
  { text: 'Order rice, dal, oil from Zepto', icon: '⚡' },
  { text: 'Buy a kurta for men from Myntra under 1500', icon: '👕' },
  { text: 'Order fruits and veggies from BigBasket', icon: '🥬' },
  { text: 'Order snacks from Swiggy Instamart', icon: '🍫' },
];

// Show 4 suggestions — always hotel + 3 random from the rest
const SUGGESTIONS = (() => {
  const rest = ALL_SUGGESTIONS.slice(1);
  for (let i = rest.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rest[i], rest[j]] = [rest[j], rest[i]];
  }
  return [ALL_SUGGESTIONS[0], ...rest.slice(0, 3)];
})();

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
    // Rich input props
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
  } | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartTotal, setCartTotal] = useState('');
  const [cartStore, setCartStore] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const { openL2 } = useL2Payment();

  const resetChat = useCallback(() => {
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
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
  }, []);

  // Listen for "newchat" event from Sidebar
  useEffect(() => {
    const handler = () => resetChat();
    window.addEventListener('newchat', handler);
    return () => window.removeEventListener('newchat', handler);
  }, [resetChat]);

  // Abort stream on unmount
  useEffect(() => {
    return () => {
      if (abortRef.current) {
        abortRef.current.abort();
        abortRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentSteps, cartItems]);

  // Auto-resize textarea
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 200) + 'px';
  }, []);

  const handleSSEEvent = useCallback((event: { type: string; payload: Record<string, unknown> }) => {
    switch (event.type) {
      case 'message':
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: 'assistant',
            content: event.payload.content as string,
          },
        ]);
        break;
      case 'step_update': {
        const action = event.payload.action as string;
        const status = event.payload.status as string;

        // Check if this is a cart_update event (encoded in step_update)
        if (status === 'cart_update') {
          try {
            const cartData = JSON.parse(action);
            if (cartData._type === 'cart_update') {
              setCartItems(cartData.items || []);
              setCartTotal(cartData.total || '');
              setCartStore(cartData.store || '');
              break;
            }
          } catch {
            // Not JSON, treat as normal step
          }
        }

        // Only show milestone steps (completed report_step) and pause states.
        // Hide low-level "running" browser actions to reduce noise.
        // Allow specific running statuses that are meaningful (skill activation, mode switches).
        if (status === 'running' && !action.startsWith('Using skill:') && !action.includes('instant mode') && !action.includes('AI mode')) break;

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
        });
        setIsLoading(false);
        break;
      }
      case 'payment_required':
        openL2({
          taskId: event.payload.taskId as string,
          bookingSummary: event.payload.bookingSummary as string,
          amountCents: event.payload.amountCents as number,
          serviceFeeCents: event.payload.serviceFeeCents as number,
          description: event.payload.description as string | undefined,
        });
        break;
      case 'complete':
        setCurrentSteps([]);
        break;
      case 'error':
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: 'assistant',
            content: `I ran into an issue: ${event.payload.error}`,
          },
        ]);
        setCurrentSteps([]);
        break;
    }
  }, [openL2]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    // Abort any previous in-flight request
    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;

    const userMessage: Message = {
      id: Date.now().toString(),
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
      if (error instanceof DOMException && error.name === 'AbortError') {
        // Request was cancelled (new chat or navigation) — don't show error
        return;
      }
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
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
    try {
      await fetch('/api/agent/input', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: pendingInput.taskId,
          stepId: pendingInput.stepId,
          value,
        }),
      });
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
        /* Empty state — centered like ChatGPT */
        <div className="flex flex-1 flex-col items-center justify-center px-4">
          <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/20">
            <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="mb-1 text-2xl font-semibold">What can I do for you?</h2>
          <p className="mb-8 text-sm text-muted-foreground">
            I&apos;ll handle the browsing, clicking, and typing. You just tell me what you need.
          </p>

          <div className="grid w-full max-w-2xl grid-cols-2 gap-3">
            {SUGGESTIONS.map((s, i) => (
              <button
                key={s.text}
                onClick={() => sendMessage(s.text)}
                className="group relative flex items-center gap-3.5 overflow-hidden rounded-xl border border-white/[0.08] bg-[#1a1a24] px-5 py-4 text-left text-sm transition-all duration-200 hover:border-primary/30 hover:bg-[#1e1e2e] hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-0.5"
              >
                <div className={`pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${
                  i % 2 === 0
                    ? 'bg-gradient-to-br from-primary/10 via-transparent to-accent/5'
                    : 'bg-gradient-to-br from-accent/10 via-transparent to-primary/5'
                }`} />
                <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-lg ring-1 ring-white/[0.08] transition-all group-hover:bg-primary/15 group-hover:ring-primary/25">{s.icon}</span>
                <span className="relative text-muted-foreground transition-colors group-hover:text-foreground/90">{s.text}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Messages */
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl px-4 py-6">
            <div className="space-y-6">
              {messages.map((message, i) => (
                <div key={message.id} className="animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
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
                    onSubmit={handleInputResponse}
                  />
                </div>
              )}

              {isLoading && currentSteps.length === 0 && (
                <div className="flex items-start gap-4 animate-fade-in">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
                    <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="typing-indicator flex items-center gap-1 pt-2">
                    <span className="h-2 w-2 rounded-full bg-muted-foreground" />
                    <span className="h-2 w-2 rounded-full bg-muted-foreground" />
                    <span className="h-2 w-2 rounded-full bg-muted-foreground" />
                  </div>
                </div>
              )}
            </div>
            <div ref={messagesEndRef} className="h-4" />
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="border-t border-border/50 bg-chat-bg px-4 pb-4 pt-3">
        <form onSubmit={handleSubmit} className="mx-auto max-w-3xl">
          <div className="relative rounded-2xl border border-border bg-input transition-colors focus-within:border-muted-foreground/40">
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Tell me what you need..."
              disabled={isLoading}
              rows={1}
              className="w-full resize-none bg-transparent px-4 py-3.5 pr-14 text-sm leading-relaxed placeholder:text-muted-foreground/60 focus:outline-none disabled:opacity-50"
              style={{ maxHeight: '200px' }}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute bottom-2.5 right-2.5 flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-all hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
              </svg>
            </button>
          </div>
          <p className="mt-2 text-center text-xs text-muted-foreground/50">
            ShofferAI executes real actions on websites. Payment info is encrypted and never seen by the AI.
          </p>
        </form>
      </div>
    </div>
  );

  return (
    <L2SplitView rightPanel={<PaymentPanel />}>
      {chatContent}
    </L2SplitView>
  );
}

export function ChatInterface() {
  return (
    <L2PaymentProvider>
      <ChatInterfaceInner />
    </L2PaymentProvider>
  );
}
