import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const getCartStorageKey = (user) => {
  if (user?.id) return `zelora_cart_user_${user.id}`;
  if (user?.email) return `zelora_cart_${user.email.toLowerCase().trim()}`;
  return 'zelora_cart_guest';
};

export function CartProvider({ children }) {
  const { user } = useAuth();
  const currentKey = getCartStorageKey(user);

  const [cartItems, setCartItems] = useState(() => {
    try {
      // Purge old un-scoped legacy key if present
      localStorage.removeItem('zelora_cart');
      const stored = localStorage.getItem(currentKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [toast, setToast] = useState(null);
  const prevUserRef = useRef(user);

  // Listen for global logout events for instant state wipe
  useEffect(() => {
    const handleLogout = () => {
      setCartItems([]);
      try {
        localStorage.removeItem('zelora_cart');
        localStorage.removeItem('zelora_cart_guest');
      } catch (e) {
        console.warn('Error clearing cart on logout', e);
      }
    };
    window.addEventListener('zelora_logout', handleLogout);
    return () => window.removeEventListener('zelora_logout', handleLogout);
  }, []);

  // Sync / switch cart when user changes (login, logout, account switch, new registration)
  useEffect(() => {
    const prevUser = prevUserRef.current;
    prevUserRef.current = user;

    // Purge legacy key
    localStorage.removeItem('zelora_cart');

    if (!user) {
      // User logged out: clear memory cart so guest starts completely empty
      localStorage.removeItem('zelora_cart_guest');
      setCartItems([]);
    } else {
      // User logged in / registered
      const targetKey = getCartStorageKey(user);
      const userStored = localStorage.getItem(targetKey);
      const userItems = userStored ? JSON.parse(userStored) : [];

      // Check if user came from a guest session that had items
      const guestStored = localStorage.getItem('zelora_cart_guest');
      const guestItems = guestStored ? JSON.parse(guestStored) : [];

      // Only migrate if user transitioned from guest AND guest had items
      if (!prevUser && guestItems.length > 0) {
        const merged = [...userItems];
        guestItems.forEach((gItem) => {
          const existingIndex = merged.findIndex((m) => m.id === gItem.id);
          if (existingIndex > -1) {
            merged[existingIndex].quantity += gItem.quantity;
          } else {
            merged.push(gItem);
          }
        });
        localStorage.removeItem('zelora_cart_guest');
        localStorage.setItem(targetKey, JSON.stringify(merged));
        setCartItems(merged);
      } else {
        // Different user or new user: load strictly this user's cart (empty for new users)
        setCartItems(userItems);
      }
    }
  }, [user]);

  // Persist cart to user-scoped storage key
  useEffect(() => {
    try {
      if (currentKey) {
        localStorage.setItem(currentKey, JSON.stringify(cartItems));
      }
    } catch (e) {
      console.warn('Could not persist cart to storage', e);
    }
  }, [cartItems, currentKey]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const addToCart = (product, size, color, quantity = 1) => {
    if (!product) return;
    
    // Check if product has sizes and one is not selected
    if (product.sizes && product.sizes.length > 0 && !size) {
      showToast('Please select a size first.', 'error');
      return false;
    }

    const itemColor = color || (product.colors && product.colors[0]?.name) || 'Noir Black';
    const itemSize = size || (product.sizes ? product.sizes[0] : 'Standard');
    const cartItemId = `${product.id}-${itemSize}-${itemColor}`;

    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.id === cartItemId);
      if (existingIndex > -1) {
        const updated = [...prevItems];
        const newQty = updated[existingIndex].quantity + quantity;
        
        // Prevent exceeding stock count if defined
        if (product.stockCount && newQty > product.stockCount) {
          showToast(`Maximum available stock reached (${product.stockCount} items).`, 'warning');
          updated[existingIndex].quantity = product.stockCount;
        } else {
          updated[existingIndex].quantity = newQty;
          showToast(`Updated "${product.name}" quantity (${itemSize}) in your cart.`);
        }
        return updated;
      } else {
        const safeQty = product.stockCount ? Math.min(quantity, product.stockCount) : quantity;
        showToast(`Added "${product.name}" (${itemSize}) to cart.`);
        return [
          ...prevItems,
          {
            id: cartItemId,
            product,
            size: itemSize,
            color: itemColor,
            quantity: safeQty,
            addedAt: Date.now(),
          },
        ];
      }
    });

    return true;
  };

  const updateQuantity = (cartItemId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(cartItemId);
      return;
    }

    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id === cartItemId) {
          const maxStock = item.product.stockCount || 99;
          const clampedQty = Math.min(newQty, maxStock);
          if (newQty > maxStock) {
            showToast(`Only ${maxStock} items available in stock.`, 'warning');
          }
          return { ...item, quantity: clampedQty };
        }
        return item;
      })
    );
  };

  const removeFromCart = (cartItemId) => {
    setCartItems((prev) => {
      const found = prev.find((item) => item.id === cartItemId);
      if (found) {
        showToast(`Removed "${found.product.name}" from cart.`, 'info');
      }
      return prev.filter((item) => item.id !== cartItemId);
    });
  };

  const clearCart = () => {
    setCartItems([]);
    try {
      localStorage.removeItem(currentKey);
      localStorage.removeItem('zelora_cart');
      localStorage.removeItem('zelora_cart_guest');
    } catch (e) {
      console.warn('Could not clear cart storage', e);
    }
  };

  // Calculations
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  
  const subtotal = cartItems.reduce(
    (acc, item) => acc + (item.product.originalPrice || item.product.price) * item.quantity,
    0
  );

  const discountedSubtotal = cartItems.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  const discountTotal = subtotal - discountedSubtotal;
  
  // Free delivery above ₹500
  const deliveryCharge = discountedSubtotal > 500 || discountedSubtotal === 0 ? 0 : 50;
  const totalAmount = discountedSubtotal + deliveryCharge;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartCount,
        subtotal,
        discountTotal,
        discountedSubtotal,
        deliveryCharge,
        totalAmount,
        toast,
        setToast,
        showToast,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
