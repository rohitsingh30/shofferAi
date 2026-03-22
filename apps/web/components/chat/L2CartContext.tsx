'use client';

import { createContext, useContext, useState, useCallback, useRef } from 'react';

export type L2CartState = 'CLOSED' | 'OPENING' | 'OPEN' | 'CLOSING';

interface L2CartContextType {
  l2CartState: L2CartState;
  openCart: () => void;
  closeCart: () => void;
  pendingConfirm: (() => void) | null;
  openCartForConfirm: (onConfirm: () => void) => void;
  clearPendingConfirm: () => void;
}

const L2CartContext = createContext<L2CartContextType | null>(null);

export function L2CartProvider({ children }: { children: React.ReactNode }) {
  const [l2CartState, setL2CartState] = useState<L2CartState>('CLOSED');
  const [pendingConfirm, setPendingConfirm] = useState<(() => void) | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openCart = useCallback(() => {
    setL2CartState('OPENING');
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setL2CartState('OPEN');
    }, 300);
  }, []);

  const closeCart = useCallback(() => {
    setL2CartState('CLOSING');
    setPendingConfirm(null);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setL2CartState('CLOSED');
    }, 300);
  }, []);

  const openCartForConfirm = useCallback((onConfirm: () => void) => {
    setPendingConfirm(() => onConfirm);
    setL2CartState('OPENING');
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setL2CartState('OPEN');
    }, 300);
  }, []);

  const clearPendingConfirm = useCallback(() => {
    setPendingConfirm(null);
  }, []);

  return (
    <L2CartContext.Provider value={{ l2CartState, openCart, closeCart, pendingConfirm, openCartForConfirm, clearPendingConfirm }}>
      {children}
    </L2CartContext.Provider>
  );
}

export function useL2Cart() {
  const ctx = useContext(L2CartContext);
  if (!ctx) throw new Error('useL2Cart must be used within L2CartProvider');
  return ctx;
}
