'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import type { ProductCardData } from '@shofferai/shared';

export interface CartItemData extends ProductCardData {
  quantity: number;
  /** "user" = picked via card_grid/carousel, "agent" = synced from agent cart_update */
  source: 'user' | 'agent';
}

interface AgentCartItem {
  name: string;
  quantity: number;
  price: string;
}

interface CartContextType {
  items: CartItemData[];
  store: string;
  taskId: string | null;
  itemCount: number;
  total: number;
  isEmpty: boolean;
  setTaskId: (id: string) => void;
  addItem: (product: ProductCardData) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  /** Sync cart state from agent's cart_update SSE events */
  syncFromAgent: (items: AgentCartItem[], store: string, total: string) => void;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItemData[]>([]);
  const [store, setStore] = useState('');
  const [taskId, setTaskId] = useState<string | null>(null);

  const addItem = useCallback((product: ProductCardData) => {
    setItems((prev) => {
      // If different store, clear cart first
      if (prev.length > 0 && prev[0].store !== product.store) {
        setStore(product.store);
        return [{ ...product, quantity: 1, source: 'user' as const }];
      }
      // If same item exists, increment quantity
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1, source: 'user' as const } : item,
        );
      }
      return [...prev, { ...product, quantity: 1, source: 'user' as const }];
    });
    setStore(product.store);
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => {
      const next = prev.filter((item) => item.id !== id);
      if (next.length === 0) setStore('');
      return next;
    });
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => {
        const next = prev.filter((item) => item.id !== id);
        if (next.length === 0) setStore('');
        return next;
      });
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item)),
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setStore('');
    setTaskId(null);
  }, []);

  // Parse formatted price string like "₹1,499" → 1499
  const parsePrice = (priceStr: string): number => {
    const cleaned = priceStr.replace(/[^\d.]/g, '');
    return parseFloat(cleaned) || 0;
  };

  const syncFromAgent = useCallback((agentItems: AgentCartItem[], agentStore: string, _total: string) => {
    setStore(agentStore);
    setItems((prev) => {
      // Keep all user-picked items intact — only replace agent-sourced items
      const userItems = prev.filter((item) => item.source === 'user');
      const newAgentItems = agentItems.map((item, i) => ({
        id: `agent-${i}-${item.name}`,
        name: item.name,
        price: parsePrice(item.price),
        store: agentStore,
        quantity: item.quantity,
        source: 'agent' as const,
      }));
      return [...userItems, ...newAgentItems];
    });
  }, []);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const isEmpty = items.length === 0;

  return (
    <CartContext.Provider
      value={{ items, store, taskId, itemCount, total, isEmpty, setTaskId, addItem, removeItem, updateQuantity, clearCart, syncFromAgent }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
