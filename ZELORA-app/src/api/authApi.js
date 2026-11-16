// ZELORA Mobile Authentication & User API
import { apiClient, saveAuthTokens, saveStoredUser, clearAuthTokens } from './client';

export const authApi = {
  login: async ({ email, password }) => {
    const data = await apiClient('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (data.tokens) {
      await saveAuthTokens({
        access: data.tokens.access,
        refresh: data.tokens.refresh,
      });
    }
    if (data.user) {
      await saveStoredUser(data.user);
    }
    return data;
  },

  register: async ({ email, password, first_name, last_name, phone }) => {
    const data = await apiClient('/auth/register/', {
      method: 'POST',
      body: JSON.stringify({ email, password, first_name, last_name, phone }),
    });

    if (data.tokens) {
      await saveAuthTokens({
        access: data.tokens.access,
        refresh: data.tokens.refresh,
      });
    }
    if (data.user) {
      await saveStoredUser(data.user);
    }
    return data;
  },

  getMe: async () => {
    return await apiClient('/auth/me/');
  },

  updateProfile: async (payload) => {
    return await apiClient('/auth/profile/', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  getAddresses: async () => {
    return await apiClient('/auth/addresses/');
  },

  createAddress: async (payload) => {
    return await apiClient('/auth/addresses/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  logout: async () => {
    try {
      await apiClient('/auth/logout/', {
        method: 'POST',
      });
    } catch {
      // Proceed with local cleanup regardless
    } finally {
      await clearAuthTokens();
    }
  },
};
