import { createContext, useContext, useState, useEffect } from 'react';
import { useCart } from './CartContext';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { addToCart, showToast } = useCart();
  
  const [wishlistItems, setWishlistItems] = useState(() => {
    try {
      const stored = localStorage.getItem('zelora_wishlist');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('zelora_wishlist', JSON.stringify(wishlistItems));
    } catch (e) {
      console.warn('Could not persist wishlist to storage', e);
    }
  }, [wishlistItems]);

  const isInWishlist = (productId) => {
    return wishlistItems.some((item) => item.id === productId);
  };

  const toggleWishlist = (product) => {
    if (!product) return;
    setWishlistItems((prev) => {
      const exists = prev.some((item) => item.id === product.id);
      if (exists) {
        showToast(`Removed "${product.name}" from your wishlist.`, 'info');
        return prev.filter((item) => item.id !== product.id);
      } else {
        showToast(`Saved "${product.name}" to your wishlist.`);
        return [...prev, product];
      }
    });
  };

  const removeFromWishlist = (productId) => {
    setWishlistItems((prev) => {
      const found = prev.find((item) => item.id === productId);
      if (found) {
        showToast(`Removed "${found.name}" from wishlist.`, 'info');
      }
      return prev.filter((item) => item.id !== productId);
    });
  };

  const moveToCart = (product, size) => {
    const defaultSize = size || (product.sizes ? product.sizes[0] : 'Standard');
    const success = addToCart(product, defaultSize);
    if (success) {
      removeFromWishlist(product.id);
    }
    return success;
  };

  const wishlistCount = wishlistItems.length;

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
        moveToCart,
        wishlistCount,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

