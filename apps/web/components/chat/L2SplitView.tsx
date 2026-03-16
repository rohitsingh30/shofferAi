'use client';

import { useL2Payment } from './L2PaymentContext';

interface L2SplitViewProps {
  children: React.ReactNode;
  rightPanel: React.ReactNode;
}

export function L2SplitView({ children, rightPanel }: L2SplitViewProps) {
  const { l2State } = useL2Payment();

  const isVisible = l2State !== 'CLOSED';
  const isAnimatingIn = l2State === 'OPENING';
  const isAnimatingOut = l2State === 'CLOSING';

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

      {/* Right panel — Payment (L2) */}
      {isVisible && (
        <div
          className="h-full flex-shrink-0 overflow-hidden border-l border-border/50 transition-all duration-300 ease-in-out"
          style={{
            width: '40%',
            transform: isAnimatingIn || isAnimatingOut ? 'translateX(100%)' : 'translateX(0)',
            opacity: isAnimatingIn || isAnimatingOut ? 0 : 1,
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
            transform: isAnimatingIn || isAnimatingOut ? 'translateY(100%)' : 'translateY(0)',
            transition: 'transform 300ms ease-in-out',
          }}
        >
          {rightPanel}
        </div>
      )}
    </div>
  );
}
