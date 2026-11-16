// ZELORA Mobile Shopping Bag & Direct Buy Now Context
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

const CART_STORAGE_PREFIX = 'zelora_mobile_cart_';

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const storageKey = user?.id
    ? `${CART_STORAGE_PREFIX}user_${user.id}`
    : `${CART_STORAGE_PREFIX}guest`;

  const [cartItems, setCartItems] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [directBuyItem, setDirectBuyItem] = useState(null);

  // Load persisted cart on user switch or startup
  useEffect(() => {
    const loadCart = async () => {
      try {
        const raw = await AsyncStorage.getItem(storageKey);
        if (raw) {
          setCartItems(JSON.parse(raw));
        } else {
          setCartItems([]);
        }
      } catch (e) {
        console.warn('Failed to load cart from storage:', e);
      } finally {
        setIsLoaded(true);
      }
    };

    loadCart();
  }, [storageKey]);

  // Persist cart items upon modification
  useEffect(() => {
    if (!isLoaded) return;
    const saveCart = async () => {
      try {
        await AsyncStorage.setItem(storageKey, JSON.stringify(cartItems));
      } catch (e) {
        console.warn('Failed to persist cart:', e);
      }
    };
    saveCart();
  }, [cartItems, isLoaded, storageKey]);

  const addToCart = (product, quantity = 1, size = 'M') => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product.id === product.id && item.size === size
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }

      const newItem = {
        id: `cart_${product.id}_${size}_${Date.now()}`,
        product,
        quantity,
        size,
        price: parseFloat(product.price || 0),
      };
      return [newItem, ...prev];
    });
  };

  const removeFromCart = (itemId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const updateQuantity = (itemId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, quantity: newQty } : item))
    );
  };

  const clearCart = async () => {
    setCartItems([]);
    try {
      await AsyncStorage.removeItem(storageKey);
    } catch (e) {
      console.warn('Failed to clear cart storage:', e);
    }
  };

  // Calculations
  const subtotal = cartItems.reduce(
    (sum, item) => sum + (parseFloat(item.product.price) || 0) * item.quantity,
    0
  );
  const shipping = subtotal > 1500 || subtotal === 0 ? 0 : 150;
  const tax = Math.round(subtotal * 0.05); // 5% GST
  const total = subtotal + shipping + tax;
  const totalCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        subtotal,
        shipping,
        tax,
        total,
        totalCount,
        directBuyItem,
        setDirectBuyItem,
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
