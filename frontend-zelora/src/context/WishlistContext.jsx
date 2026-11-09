import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useCart } from './CartContext';

const WishlistContext = createContext(null);

export const getWishlistStorageKey = (user) => {
  if (user?.id) return `zelora_wishlist_user_${user.id}`;
  if (user?.email) return `zelora_wishlist_${user.email.toLowerCase().trim()}`;
  return 'zelora_wishlist_guest';
};

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const { addToCart, showToast } = useCart();

  const currentKey = getWishlistStorageKey(user);

  const [wishlistItems, setWishlistItems] = useState(() => {
    try {
      localStorage.removeItem('zelora_wishlist'); // purge legacy
      const stored = localStorage.getItem(currentKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const prevUserRef = useRef(user);

  // Listen for global logout event
  useEffect(() => {
    const handleLogout = () => {
      setWishlistItems([]);
      try {
        localStorage.removeItem('zelora_wishlist');
        localStorage.removeItem('zelora_wishlist_guest');
      } catch (e) {
        console.warn('Error clearing wishlist on logout', e);
      }
    };
    window.addEventListener('zelora_logout', handleLogout);
    return () => window.removeEventListener('zelora_logout', handleLogout);
  }, []);

  // Sync / switch wishlist when user changes
  useEffect(() => {
    const prevUser = prevUserRef.current;
    prevUserRef.current = user;

    localStorage.removeItem('zelora_wishlist'); // purge legacy

    if (!user) {
      // User logged out
      localStorage.removeItem('zelora_wishlist_guest');
      setWishlistItems([]);
    } else {
      const targetKey = getWishlistStorageKey(user);
      const userStored = localStorage.getItem(targetKey);
      const userItems = userStored ? JSON.parse(userStored) : [];

      const guestStored = localStorage.getItem('zelora_wishlist_guest');
      const guestItems = guestStored ? JSON.parse(guestStored) : [];

      if (!prevUser && guestItems.length > 0) {
        const merged = [...userItems];
        guestItems.forEach((g) => {
          if (!merged.some((m) => m.id === g.id)) {
            merged.push(g);
          }
        });
        localStorage.removeItem('zelora_wishlist_guest');
        localStorage.setItem(targetKey, JSON.stringify(merged));
        setWishlistItems(merged);
      } else {
        setWishlistItems(userItems);
      }
    }
  }, [user]);

  // Persist to user-scoped key
  useEffect(() => {
    try {
      if (currentKey) {
        localStorage.setItem(currentKey, JSON.stringify(wishlistItems));
      }
    } catch (e) {
      console.warn('Could not persist wishlist to storage', e);
    }
  }, [wishlistItems, currentKey]);

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

  const clearWishlist = () => {
    setWishlistItems([]);
    try {
      localStorage.removeItem(currentKey);
      localStorage.removeItem('zelora_wishlist');
      localStorage.removeItem('zelora_wishlist_guest');
    } catch (e) {
      console.warn('Could not clear wishlist storage', e);
    }
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
        clearWishlist,
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
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
};
