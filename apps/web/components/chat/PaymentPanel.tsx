'use client';

import { useState, useCallback } from 'react';
import { useL2Payment } from './L2PaymentContext';
import { BookingSummaryCard } from './BookingSummaryCard';

const TIP_OPTIONS = [0, 10000, 20000, 50000]; // in paise (Rs 0, 100, 200, 500)

function formatInr(paise: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(paise / 100);
}

export function PaymentPanel() {
  const { l2Data, setPaymentComplete } = useL2Payment();
  const [selectedTip, setSelectedTip] = useState(10000); // Default Rs 100
  const [customTip, setCustomTip] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tipAmount = isCustom ? (parseInt(customTip, 10) || 0) * 100 : selectedTip;
  const totalCents = (l2Data?.amountCents || 0) + tipAmount;

  const handlePayment = useCallback(async () => {
    if (!l2Data) return;
    setLoading(true);
    setError(null);

    try {
      // Step 1: Create Razorpay order
      const orderRes = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: l2Data.taskId,
          amountCents: l2Data.amountCents,
          serviceFeeCents: tipAmount,
          bookingSummary: l2Data.bookingSummary,
        }),
      });

      if (!orderRes.ok) {
        const data = await orderRes.json();
        throw new Error(data.error || 'Failed to create order');
      }

      const { orderId, amount, currency, key } = await orderRes.json();

      // Step 2: Load and open Razorpay Checkout
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        const options = {
          key,
          amount,
          currency,
          order_id: orderId,
          name: 'ShofferAI',
          description: l2Data.description || 'Booking Payment',
          handler: async (response: {
            razorpay_order_id: string;
            razorpay_payment_id: string;
            razorpay_signature: string;
          }) => {
            // Step 3: Verify payment
            try {
              const verifyRes = await fetch('/api/payments/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  ...response,
                  taskId: l2Data.taskId,
                  stepId: l2Data.stepId || 'payment',
                }),
              });

              if (!verifyRes.ok) {
                throw new Error('Payment verification failed');
              }

              setPaymentComplete();
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Verification failed');
              setLoading(false);
            }
          },
          modal: {
            ondismiss: () => {
              setLoading(false);
            },
          },
          theme: {
            color: '#7c3aed',
          },
        };

        // @ts-expect-error Razorpay is loaded via script
        const rzp = new window.Razorpay(options);
        rzp.open();
      };
      document.body.appendChild(script);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
      setLoading(false);
    }
  }, [l2Data, tipAmount, setPaymentComplete]);

  if (!l2Data) return null;

  return (
    <div className="flex h-full flex-col bg-chat-bg">
      {/* Header */}
      <div className="border-b border-border/50 px-5 py-4">
        <h2 className="text-lg font-semibold">Complete Payment</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Pay to confirm your booking
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        {/* Booking Summary */}
        <BookingSummaryCard summaryJson={l2Data.bookingSummary} />

        {/* Cost Breakdown */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Booking cost</span>
            <span className="text-foreground">{formatInr(l2Data.amountCents)}</span>
          </div>

          {/* Tip/Service Fee */}
          <div className="pt-2">
            <p className="text-sm text-muted-foreground mb-2">Service fee (tip)</p>
            <div className="grid grid-cols-4 gap-2">
              {TIP_OPTIONS.map((amount) => (
                <button
                  key={amount}
                  onClick={() => {
                    setSelectedTip(amount);
                    setIsCustom(false);
                  }}
                  className={`rounded-lg border px-2 py-2 text-sm transition-colors ${
                    !isCustom && selectedTip === amount
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border/50 text-muted-foreground hover:border-primary/30'
                  }`}
                >
                  {amount === 0 ? 'None' : formatInr(amount)}
                </button>
              ))}
            </div>
            <div className="mt-2">
              <button
                onClick={() => setIsCustom(true)}
                className={`text-xs ${isCustom ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Custom amount
              </button>
              {isCustom && (
                <div className="mt-1 flex items-center gap-1">
                  <span className="text-sm text-muted-foreground">Rs</span>
                  <input
                    type="number"
                    value={customTip}
                    onChange={(e) => setCustomTip(e.target.value)}
                    placeholder="0"
                    className="w-24 rounded-lg border border-border/50 bg-transparent px-2 py-1 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-border/30 pt-2 mt-2">
            <div className="flex justify-between text-base font-semibold">
              <span>Total</span>
              <span className="text-primary">{formatInr(totalCents)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer — Pay Button */}
      <div className="border-t border-border/50 px-5 py-4 space-y-3">
        {error && (
          <p className="text-sm text-red-400 text-center">{error}</p>
        )}

        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? 'Processing...' : `Pay ${formatInr(totalCents)}`}
        </button>

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground/60">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
          Secured by Razorpay
        </div>
      </div>
    </div>
  );
}
