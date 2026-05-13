'use client';

import { createContext, useContext, useState, useCallback, useMemo } from 'react';
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
  /** Per-store grouping: items keyed by store name. */
  byStore: Record<string, CartItemData[]>;
  /** Per-store subtotals (sum of price * quantity). */
  totalByStore: Record<string, number>;
  /** All store names in current cart, in insertion order. */
  stores: string[];
  /** @deprecated — kept for backward compat. Use `stores` for multi-store UI. */
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
  /** Clear only items from one store (others remain). */
  clearStore: (store: string) => void;
  /** Sync cart state from agent's cart_update SSE events */
  syncFromAgent: (items: AgentCartItem[], store: string, total: string) => void;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItemData[]>([]);
  const [taskId, setTaskId] = useState<string | null>(null);

  const addItem = useCallback((product: ProductCardData) => {
    setItems((prev) => {
      // Per-store carts coexist. Different store = ADD to that store's
      // section, NOT replace existing items. This is the foundation for
      // cross-store comparison shopping.
      // If same item exists, increment quantity.
      const existing = prev.find((item) => item.id === product.id && item.store === product.store);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id && item.store === product.store
            ? { ...item, quantity: item.quantity + 1, source: 'user' as const }
            : item,
        );
      }
      return [...prev, { ...product, quantity: 1, source: 'user' as const }];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((item) => item.id !== id));
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item)),
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setTaskId(null);
  }, []);

  const clearStore = useCallback((targetStore: string) => {
    setItems((prev) => prev.filter((item) => item.store !== targetStore));
  }, []);

  // Parse formatted price string like "₹1,499" → 1499
  const parsePrice = (priceStr: string): number => {
    const cleaned = priceStr.replace(/[^\d.]/g, '');
    return parseFloat(cleaned) || 0;
  };

  const syncFromAgent = useCallback((agentItems: AgentCartItem[], agentStore: string, _total: string) => {
    setItems((prev) => {
      // Replace this store's agent-sourced items only. User-picked items
      // and other stores' items remain untouched.
      const otherItems = prev.filter(
        (item) => !(item.source === 'agent' && item.store === agentStore),
      );
      const newAgentItems = agentItems.map((item, i) => ({
        id: `agent-${agentStore}-${i}-${item.name}`,
        name: item.name,
        price: parsePrice(item.price),
        store: agentStore,
        quantity: item.quantity,
        source: 'agent' as const,
      }));
      return [...otherItems, ...newAgentItems];
    });
  }, []);

  // Derived state — per-store grouping + totals
  const { byStore, totalByStore, stores } = useMemo(() => {
    const byStore: Record<string, CartItemData[]> = {};
    const totalByStore: Record<string, number> = {};
    const stores: string[] = [];
    for (const item of items) {
      const s = item.store || 'Cart';
      if (!byStore[s]) {
        byStore[s] = [];
        totalByStore[s] = 0;
        stores.push(s);
      }
      byStore[s].push(item);
      totalByStore[s] += item.price * item.quantity;
    }
    return { byStore, totalByStore, stores };
  }, [items]);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const isEmpty = items.length === 0;
  // Backward-compat single-store accessor: most-recent / only store.
  const store = stores[stores.length - 1] || '';

  return (
    <CartContext.Provider
      value={{
        items, byStore, totalByStore, stores, store, taskId, itemCount, total, isEmpty,
        setTaskId, addItem, removeItem, updateQuantity, clearCart, clearStore, syncFromAgent,
      }}
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
