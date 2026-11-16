// ZELORA Mobile API Client with Automatic JWT Interception & Refresh
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE } from '../config';

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'zelora_mobile_access_token',
  REFRESH_TOKEN: 'zelora_mobile_refresh_token',
  USER_DATA: 'zelora_mobile_user_data',
};

export const getStoredAccessToken = async () => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  } catch {
    return null;
  }
};

export const getStoredRefreshToken = async () => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  } catch {
    return null;
  }
};

export const saveAuthTokens = async ({ access, refresh }) => {
  try {
    if (access) await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, access);
    if (refresh) await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refresh);
  } catch (err) {
    console.warn('Failed to store auth tokens:', err);
  }
};

export const clearAuthTokens = async () => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.ACCESS_TOKEN,
      STORAGE_KEYS.REFRESH_TOKEN,
      STORAGE_KEYS.USER_DATA,
    ]);
  } catch (err) {
    console.warn('Failed to clear tokens:', err);
  }
};

export const saveStoredUser = async (user) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
  } catch (err) {
    console.warn('Failed to store user profile:', err);
  }
};

export const getStoredUser = async () => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

/**
 * Universal request function with automatic bearer authorization and token auto-refresh
 */
export async function apiClient(endpoint, options = {}, isRetry = false) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers || {}),
  };

  const token = await getStoredAccessToken();
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (netErr) {
    throw new Error(
      `Cannot connect to ZELORA backend service (${url}). Please ensure the Django server is running on port 8000 and accessible.`
    );
  }

  // Intercept 401 Unauthorized for Silent Token Refresh
  if (response.status === 401 && !isRetry) {
    const refreshToken = await getStoredRefreshToken();
    if (refreshToken) {
      try {
        const refreshResponse = await fetch(`${API_BASE}/auth/token/refresh/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh: refreshToken }),
        });

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          if (refreshData.access) {
            await saveAuthTokens({
              access: refreshData.access,
              refresh: refreshData.refresh || refreshToken,
            });
            return apiClient(endpoint, options, true);
          }
        }
      } catch (refreshErr) {
        console.warn('Token auto-refresh failed:', refreshErr);
      }
    }
  }

  const contentType = response.headers.get('content-type') || '';
  let data = null;
  if (contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMessage =
      (data && (data.detail || data.message || (typeof data === 'object' && JSON.stringify(data)))) ||
      `HTTP Error ${response.status}`;
    const error = new Error(errorMessage);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}
