 import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CartItem, RescueBag } from '@/types';

interface CartContextType {
  items: CartItem[];
  addToCart: (bag: RescueBag, quantityToAdd?: number) => void;
  removeFromCart: (bagId: string) => void;
  updateQuantity: (bagId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalAmount: number;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (bag: RescueBag, quantityToAdd: number = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.bag.id === bag.id);
      if (existing) {
        const newQty = Math.min(bag.stockLeft, existing.quantity + quantityToAdd);
        return prev.map(i =>
          i.bag.id === bag.id ? { ...i, quantity: newQty } : i
        );
      }
      return [...prev, { bag, quantity: Math.min(bag.stockLeft, quantityToAdd) }];
    });
  };

  const removeFromCart = (bagId: string) => {
    setItems(prev => prev.filter(i => i.bag.id !== bagId));
  };

  const updateQuantity = (bagId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(bagId);
      return;
    }
    setItems(prev =>
      prev.map(i => (i.bag.id === bagId ? { ...i, quantity: Math.min(i.bag.stockLeft, quantity) } : i))
    );
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalAmount = items.reduce((sum, i) => sum + i.bag.rescuePrice * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalAmount }}
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
