'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import type { ProductCardData } from '@shofferai/shared';

export interface CartItemData extends ProductCardData {
  quantity: number;
}

interface CartContextType {
  items: CartItemData[];
  store: string;
  itemCount: number;
  total: number;
  isEmpty: boolean;
  addItem: (product: ProductCardData) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItemData[]>([]);
  const [store, setStore] = useState('');

  const addItem = useCallback((product: ProductCardData) => {
    setItems((prev) => {
      // If different store, clear cart first
      if (prev.length > 0 && prev[0].store !== product.store) {
        setStore(product.store);
        return [{ ...product, quantity: 1 }];
      }
      // If same item exists, increment quantity
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }
      return [...prev, { ...product, quantity: 1 }];
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
  }, []);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const isEmpty = items.length === 0;

  return (
    <CartContext.Provider
      value={{ items, store, itemCount, total, isEmpty, addItem, removeItem, updateQuantity, clearCart }}
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
