// ZELORA Mobile Authentication Context
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';
import { getStoredAccessToken, getStoredUser, clearAuthTokens, saveStoredUser } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore authenticated session on startup
  useEffect(() => {
    const bootstrapAuth = async () => {
      try {
        const storedToken = await getStoredAccessToken();
        const storedUser = await getStoredUser();

        if (storedToken) {
          setToken(storedToken);
          setUser(storedUser);

          // Silently verify & refresh user profile from backend
          try {
            const freshProfile = await authApi.getMe();
            if (freshProfile) {
              setUser(freshProfile);
              await saveStoredUser(freshProfile);
            }
          } catch (profileErr) {
            console.log('Session verification check:', profileErr.message);
          }
        }
      } catch (err) {
        console.warn('Auth bootstrap failed:', err);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    if (res.tokens?.access) {
      setToken(res.tokens.access);
    }
    if (res.user) {
      setUser(res.user);
    }
    return res;
  };

  const register = async (payload) => {
    const res = await authApi.register(payload);
    if (res.tokens?.access) {
      setToken(res.tokens.access);
    }
    if (res.user) {
      setUser(res.user);
    }
    return res;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.warn('Logout error:', err);
    } finally {
      await clearAuthTokens();
      setUser(null);
      setToken(null);
    }
  };

  const refreshUser = async () => {
    try {
      const fresh = await authApi.getMe();
      if (fresh) {
        setUser(fresh);
        await saveStoredUser(fresh);
      }
    } catch (e) {
      console.warn('Failed to refresh user:', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user && token),
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
