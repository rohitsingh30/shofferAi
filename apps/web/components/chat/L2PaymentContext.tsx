'use client';

import { createContext, useContext, useState, useCallback, useRef } from 'react';

export type L2State = 'CLOSED' | 'OPENING' | 'OPEN' | 'CLOSING';

export interface L2PaymentData {
  taskId: string;
  bookingSummary: string;
  amountCents: number;
  serviceFeeCents: number;
  description?: string;
}

interface L2PaymentContextType {
  l2State: L2State;
  l2Data: L2PaymentData | null;
  openL2: (data: L2PaymentData) => void;
  closeL2: () => void;
  setPaymentComplete: () => void;
}

const L2PaymentContext = createContext<L2PaymentContextType | null>(null);

export function L2PaymentProvider({ children }: { children: React.ReactNode }) {
  const [l2State, setL2State] = useState<L2State>('CLOSED');
  const [l2Data, setL2Data] = useState<L2PaymentData | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openL2 = useCallback((data: L2PaymentData) => {
    setL2Data(data);
    setL2State('OPENING');
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setL2State('OPEN');
    }, 300);
  }, []);

  const closeL2 = useCallback(() => {
    setL2State('CLOSING');
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setL2State('CLOSED');
      setL2Data(null);
    }, 300);
  }, []);

  const setPaymentComplete = useCallback(() => {
    closeL2();
  }, [closeL2]);

  return (
    <L2PaymentContext.Provider value={{ l2State, l2Data, openL2, closeL2, setPaymentComplete }}>
      {children}
    </L2PaymentContext.Provider>
  );
}

export function useL2Payment() {
  const ctx = useContext(L2PaymentContext);
  if (!ctx) {
    throw new Error('useL2Payment must be used within L2PaymentProvider');
  }
  return ctx;
}
