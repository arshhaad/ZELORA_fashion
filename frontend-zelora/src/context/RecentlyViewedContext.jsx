import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';

const RecentlyViewedContext = createContext(null);

export const getRecentlyViewedStorageKey = (user) => {
  if (user?.id) return `zelora_recently_viewed_user_${user.id}`;
  if (user?.email) return `zelora_recently_viewed_${user.email.toLowerCase().trim()}`;
  return 'zelora_recently_viewed_guest';
};

export function RecentlyViewedProvider({ children }) {
  const { user } = useAuth();
  const currentKey = getRecentlyViewedStorageKey(user);

  const [recentlyViewed, setRecentlyViewed] = useState(() => {
    try {
      localStorage.removeItem('zelora_recently_viewed'); // purge legacy
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
      setRecentlyViewed([]);
      try {
        localStorage.removeItem('zelora_recently_viewed');
        localStorage.removeItem('zelora_recently_viewed_guest');
      } catch (e) {
        console.warn('Error clearing recently viewed on logout', e);
      }
    };
    window.addEventListener('zelora_logout', handleLogout);
    return () => window.removeEventListener('zelora_logout', handleLogout);
  }, []);

  // Sync / switch recently viewed when user changes
  useEffect(() => {
    const prevUser = prevUserRef.current;
    prevUserRef.current = user;

    localStorage.removeItem('zelora_recently_viewed'); // purge legacy

    if (!user) {
      localStorage.removeItem('zelora_recently_viewed_guest');
      setRecentlyViewed([]);
    } else {
      const targetKey = getRecentlyViewedStorageKey(user);
      const userStored = localStorage.getItem(targetKey);
      setRecentlyViewed(userStored ? JSON.parse(userStored) : []);
    }
  }, [user]);

  useEffect(() => {
    try {
      if (currentKey) {
        localStorage.setItem(currentKey, JSON.stringify(recentlyViewed));
      }
    } catch (e) {
      console.warn('Could not persist recently viewed', e);
    }
  }, [recentlyViewed, currentKey]);

  const addRecentlyViewed = (product) => {
    if (!product || !product.id) return;
    setRecentlyViewed((prev) => {
      const filtered = prev.filter((item) => item.id !== product.id);
      return [product, ...filtered].slice(0, 8); // keep latest 8 items
    });
  };

  const clearRecentlyViewed = () => {
    setRecentlyViewed([]);
    try {
      localStorage.removeItem(currentKey);
      localStorage.removeItem('zelora_recently_viewed');
      localStorage.removeItem('zelora_recently_viewed_guest');
    } catch (e) {
      console.warn('Could not clear recently viewed', e);
    }
  };

  return (
    <RecentlyViewedContext.Provider value={{ recentlyViewed, addRecentlyViewed, clearRecentlyViewed }}>
      {children}
    </RecentlyViewedContext.Provider>
  );
}

export const useRecentlyViewed = () => {
  const context = useContext(RecentlyViewedContext);
  if (!context) {
    throw new Error('useRecentlyViewed must be used within RecentlyViewedProvider');
  }
  return context;
};
