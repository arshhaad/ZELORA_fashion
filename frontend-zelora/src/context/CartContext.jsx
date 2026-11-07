import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const stored = localStorage.getItem('zelora_cart');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [toast, setToast] = useState(null);

  // Sync with localStorage
  useEffect(() => {
    try {
      localStorage.setItem('zelora_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.warn('Could not persist cart to storage', e);
    }
  }, [cartItems]);

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
  
  // Free delivery above $150
  const deliveryCharge = discountedSubtotal > 150 || discountedSubtotal === 0 ? 0 : 15;
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

