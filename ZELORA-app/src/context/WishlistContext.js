// ZELORA Mobile Wishlist Context
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);
const WISHLIST_STORAGE_PREFIX = 'zelora_mobile_wishlist_';

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const storageKey = user?.id
    ? `${WISHLIST_STORAGE_PREFIX}user_${user.id}`
    : `${WISHLIST_STORAGE_PREFIX}guest`;

  const [wishlistItems, setWishlistItems] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadWishlist = async () => {
      try {
        const raw = await AsyncStorage.getItem(storageKey);
        if (raw) {
          setWishlistItems(JSON.parse(raw));
        } else {
          setWishlistItems([]);
        }
      } catch (e) {
        console.warn('Failed to load wishlist:', e);
      } finally {
        setIsLoaded(true);
      }
    };

    loadWishlist();
  }, [storageKey]);

  useEffect(() => {
    if (!isLoaded) return;
    const saveWishlist = async () => {
      try {
        await AsyncStorage.setItem(storageKey, JSON.stringify(wishlistItems));
      } catch (e) {
        console.warn('Failed to persist wishlist:', e);
      }
    };
    saveWishlist();
  }, [wishlistItems, isLoaded, storageKey]);

  const isInWishlist = (productId) => {
    return wishlistItems.some((item) => item.id === productId);
  };

  const toggleWishlist = (product) => {
    setWishlistItems((prev) => {
      const exists = prev.some((item) => item.id === product.id);
      if (exists) {
        return prev.filter((item) => item.id !== product.id);
      }
      return [product, ...prev];
    });
  };

  const removeFromWishlist = (productId) => {
    setWishlistItems((prev) => prev.filter((item) => item.id !== productId));
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
        count: wishlistItems.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
