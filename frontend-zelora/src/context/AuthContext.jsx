import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  authApi,
  getAccessToken,
  setTokens,
  clearTokens,
  getStoredUser,
  setStoredUser,
} from '../services/api';

const AuthContext = createContext(null);

export const GOOGLE_CLIENT_ID = '285108715643-d2on16eqroqmiqjr2te9bca9a151tc6b.apps.googleusercontent.com';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser());
  const [loading, setLoading] = useState(true);
  const [pendingEmail, setPendingEmail] = useState('');

  // Check existing session on startup
  useEffect(() => {
    const initAuth = async () => {
      const token = getAccessToken();
      if (token) {
        try {
          const profile = await authApi.getMe();
          setUser(profile);
          setStoredUser(profile);
        } catch {
          // Token expired or invalid
          clearTokens();
          setUser(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const handleAuthSuccess = (data) => {
    if (data.tokens) {
      setTokens(data.tokens);
    }
    if (data.user) {
      setUser(data.user);
      setStoredUser(data.user);
    }
  };

  const login = async (email, password) => {
    try {
      const data = await authApi.login({ email, password });
      handleAuthSuccess(data);
      return { success: true, data };
    } catch (err) {
      if (err.data && err.data.is_verified === false) {
        setPendingEmail(err.data.email || email);
        return {
          success: false,
          requiresVerification: true,
          email: err.data.email || email,
          message: err.message,
        };
      }
      throw err;
    }
  };

  const register = async ({ email, password, first_name, last_name }) => {
    const data = await authApi.register({ email, password, first_name, last_name });
    setPendingEmail(email);
    return data;
  };

  const verifyEmail = async (code, emailToVerify) => {
    const targetEmail = emailToVerify || pendingEmail;
    const data = await authApi.verifyEmail({ email: targetEmail, code });
    handleAuthSuccess(data);
    setPendingEmail('');
    return data;
  };

  const resendVerification = async (emailToResend) => {
    const targetEmail = emailToResend || pendingEmail;
    const data = await authApi.resendVerification({ email: targetEmail });
    return data;
  };

  const googleAuth = async ({ credential, access_token }) => {
    const data = await authApi.googleAuth({ credential, access_token });
    handleAuthSuccess(data);
    return data;
  };

  const forgotPassword = async (email) => {
    const data = await authApi.forgotPassword({ email });
    setPendingEmail(email);
    return data;
  };

  const resetPassword = async ({ email, code, new_password }) => {
    const targetEmail = email || pendingEmail;
    const data = await authApi.resetPassword({ email: targetEmail, code, new_password });
    return data;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Continue client cleanup
    }
    clearTokens();

    // Notify all context providers to wipe in-memory state
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('zelora_logout'));
    }

    // Clean up any legacy or guest storage keys to prevent data bleeding
    try {
      localStorage.removeItem('zelora_cart');
      localStorage.removeItem('zelora_cart_guest');
      localStorage.removeItem('zelora_wishlist');
      localStorage.removeItem('zelora_wishlist_guest');
      localStorage.removeItem('zelora_recently_viewed');
      localStorage.removeItem('zelora_recently_viewed_guest');
      localStorage.removeItem('zelora_addresses');
      localStorage.removeItem('zelora_orders');
      localStorage.removeItem('zelora_notifications');
    } catch (e) {
      console.warn('Error purging session storage on logout', e);
    }

    setUser(null);
    window.location.replace('/');
  };

  const refreshProfile = async () => {
    try {
      const profile = await authApi.getMe();
      setUser(profile);
      setStoredUser(profile);
    } catch {
      // Ignored
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        pendingEmail,
        setPendingEmail,
        login,
        register,
        verifyEmail,
        resendVerification,
        googleAuth,
        forgotPassword,
        resetPassword,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

