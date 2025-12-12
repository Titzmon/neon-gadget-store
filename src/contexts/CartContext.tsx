import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Product } from '@/data/products';

const CART_STORAGE_KEY = 'shopping-cart';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Load cart from localStorage
const loadCartFromStorage = (): CartItem[] => {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load cart from localStorage:', error);
  }
  return [];
};

// Save cart to localStorage
const saveCartToStorage = (items: CartItem[]) => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Failed to save cart to localStorage:', error);
  }
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => loadCartFromStorage());
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    saveCartToStorage(items);
  }, [items]);

  const addToCart = useCallback((product: Product) => {
    setItems(currentItems => {
      const existingItem = currentItems.find(item => item.product.id === product.id);
      if (existingItem) {
        return currentItems.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...currentItems, { product, quantity: 1 }];
    });
    setIsCartOpen(true);
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setItems(currentItems => currentItems.filter(item => item.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems(currentItems =>
      currentItems.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setItems([]);
    localStorage.removeItem(CART_STORAGE_KEY);
  }, []);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
