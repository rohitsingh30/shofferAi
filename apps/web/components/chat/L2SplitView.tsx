'use client';

import { useL2Payment } from './L2PaymentContext';
import { useL2Cart } from './L2CartContext';

interface L2SplitViewProps {
  children: React.ReactNode;
  paymentPanel: React.ReactNode;
  cartPanel: React.ReactNode;
}

export function L2SplitView({ children, paymentPanel, cartPanel }: L2SplitViewProps) {
  const { l2State: paymentState } = useL2Payment();
  const { l2CartState: cartState } = useL2Cart();

  const isPaymentVisible = paymentState !== 'CLOSED';
  const isCartVisible = !isPaymentVisible && cartState !== 'CLOSED';
  const isVisible = isPaymentVisible || isCartVisible;

  const isAnimating = isPaymentVisible
    ? paymentState === 'OPENING' || paymentState === 'CLOSING'
    : cartState === 'OPENING' || cartState === 'CLOSING';

  const rightPanel = isPaymentVisible ? paymentPanel : isCartVisible ? cartPanel : null;

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Left panel — Chat */}
      <div
        className="h-full flex-shrink-0 overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          width: isVisible ? '60%' : '100%',
        }}
      >
        {children}
      </div>

      {/* Right panel — Payment or Cart (L2) */}
      {isVisible && (
        <div
          className="h-full flex-shrink-0 overflow-hidden border-l border-border/50 transition-all duration-300 ease-in-out"
          style={{
            width: '40%',
            transform: isAnimating ? 'translateX(100%)' : 'translateX(0)',
            opacity: isAnimating ? 0 : 1,
          }}
        >
          {rightPanel}
        </div>
      )}

      {/* Mobile overlay */}
      {isVisible && (
        <div
          className="fixed inset-0 z-50 bg-chat-bg md:hidden"
          style={{
            transform: isAnimating ? 'translateY(100%)' : 'translateY(0)',
            transition: 'transform 300ms ease-in-out',
          }}
        >
          {rightPanel}
        </div>
      )}
    </div>
  );
}
