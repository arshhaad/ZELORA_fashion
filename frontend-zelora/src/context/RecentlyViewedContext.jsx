import { createContext, useContext, useState, useEffect } from 'react';

const RecentlyViewedContext = createContext(null);

export function RecentlyViewedProvider({ children }) {
  const [recentlyViewed, setRecentlyViewed] = useState(() => {
    try {
      const stored = localStorage.getItem('zelora_recently_viewed');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('zelora_recently_viewed', JSON.stringify(recentlyViewed));
    } catch (e) {
      console.warn('Could not persist recently viewed', e);
    }
  }, [recentlyViewed]);

  const addRecentlyViewed = (product) => {
    if (!product || !product.id) return;
    setRecentlyViewed((prev) => {
      // Filter out if already in list, then prepend
      const filtered = prev.filter((item) => item.id !== product.id);
      return [product, ...filtered].slice(0, 8); // keep latest 8 items
    });
  };

  return (
    <RecentlyViewedContext.Provider value={{ recentlyViewed, addRecentlyViewed }}>
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

