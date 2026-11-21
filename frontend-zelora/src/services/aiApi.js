// ZELORA AI Assistant API Client

import { resolveActiveCart } from '../context/CartContext';

const AI_API_BASE = '/api/ai';

/**
 * Checks whether the current route is an unauthenticated login, register, or auth flow.
 * The AI concierge must NEVER be shown on any authentication or onboarding pages.
 */
export const isAuthenticationRoute = (pathname = '') => {
  const path = (pathname || (typeof window !== 'undefined' ? window.location.pathname : '')).toLowerCase();
  const authRoutes = [
    '/auth',
    '/login',
    '/register',
    '/verify-email',
    '/forgot-password',
    '/reset-password',
    '/seller/login',
    '/seller/register',
    '/seller/verify-otp',
    '/seller/forgot-password',
    '/seller/reset-password',
    '/admin/login',
    '/admin/register',
  ];
  return authRoutes.some((route) => path === route || path.startsWith(`${route}/`));
};

/**
 * Resolves the active portal context, JWT token, and authenticated user.
 * Strictly enforces that:
 * 1. On auth routes, no user/token is returned.
 * 2. On /admin routes, only admin credentials are used.
 * 3. On /seller routes, only seller credentials are used.
 * 4. On general routes, only customer credentials are used.
 */
export const getActivePortalAuth = (pathname = '') => {
  const path = pathname || (typeof window !== 'undefined' ? window.location.pathname : '');

  // 0. If on an authentication route, strictly return null session
  if (isAuthenticationRoute(path)) {
    return { token: null, user: null, role: null };
  }

  // 1. Admin Portal (/admin/...) or active administrator session
  const adminToken = localStorage.getItem('zelora_admin_token');
  const adminRaw = localStorage.getItem('zelora_admin_user');
  let adminUser = null;
  try { adminUser = adminRaw ? JSON.parse(adminRaw) : null; } catch { adminUser = null; }

  if (path.startsWith('/admin')) {
    if (adminToken && adminUser) {
      return {
        token: adminToken,
        user: { ...adminUser, is_staff: true, role: 'Administrator' },
        role: 'admin',
      };
    }
    return { token: null, user: null, role: null };
  }

  // 2. Seller Portal (/seller/...)
  const isSellerAuth = localStorage.getItem('zelora_seller_auth') === 'true';
  const sellerToken = localStorage.getItem('zelora_seller_access_token');
  const sellerRaw = localStorage.getItem('zelora_seller_user');
  let sellerUser = null;
  try { sellerUser = sellerRaw ? JSON.parse(sellerRaw) : null; } catch { sellerUser = null; }

  if (path.startsWith('/seller')) {
    if (isSellerAuth && sellerToken && sellerUser) {
      return {
        token: sellerToken,
        user: { ...sellerUser, is_seller: true, role: 'Boutique Seller' },
        role: 'seller',
      };
    }
    return { token: null, user: null, role: null };
  }

  // 3. Customer Portal (Home, Products, Orders, Landing, Account, etc.)
  // Strictly only return session if customer is authenticated!
  // NEVER leak admin or seller credentials onto the public customer storefront.
  const customerToken = localStorage.getItem('customer_access_token');
  const customerRaw = localStorage.getItem('customer_user');
  let customerUser = null;
  try { customerUser = customerRaw ? JSON.parse(customerRaw) : null; } catch { customerUser = null; }

  if (customerToken && customerUser) {
    return {
      token: customerToken,
      user: { ...customerUser, role: customerUser.role || 'Valued Client' },
      role: 'customer',
    };
  }

  // Unauthenticated visitor / guest: Return null session -> AI Assistant will NOT be shown
  return { token: null, user: null, role: null };
};

/**
 * Returns isolated storage keys for user-specific AI conversations.
 * Ensures each user account maintains an entirely private chat thread.
 */
export const getUserChatStorageKey = (userId, role = 'customer') => {
  return userId ? `zelora_ai_chat_${role}_${userId}` : null;
};

export const getUserConvStorageKey = (userId, role = 'customer') => {
  return userId ? `zelora_ai_conv_${role}_${userId}` : null;
};

export const getActiveAuthToken = (pathname = '') => {
  const auth = getActivePortalAuth(pathname);
  return auth.token;
};

export const getActiveAuthUser = (pathname = '') => {
  const auth = getActivePortalAuth(pathname);
  return auth.user;
};

/**
 * Automatically refreshes the current session access token via /api/auth/token/refresh/
 */
export const refreshCurrentAuthToken = async () => {
  const path = typeof window !== 'undefined' ? window.location.pathname : '';
  const portalAuth = getActivePortalAuth(path);
  const role = portalAuth.role || 'customer';

  let refreshToken = null;
  if (role === 'admin') {
    refreshToken = localStorage.getItem('zelora_admin_refresh_token');
  } else if (role === 'seller') {
    refreshToken = localStorage.getItem('zelora_seller_refresh_token');
  } else {
    refreshToken = localStorage.getItem('customer_refresh_token');
  }

  if (!refreshToken) {
    return null;
  }

  try {
    const res = await fetch('/api/auth/token/refresh/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    const newAccess = data.access;
    const newRefresh = data.refresh;

    if (newAccess) {
      if (role === 'admin') {
        localStorage.setItem('zelora_admin_token', newAccess);
        if (newRefresh) localStorage.setItem('zelora_admin_refresh_token', newRefresh);
      } else if (role === 'seller') {
        localStorage.setItem('zelora_seller_access_token', newAccess);
        if (newRefresh) localStorage.setItem('zelora_seller_refresh_token', newRefresh);
      } else {
        localStorage.setItem('customer_access_token', newAccess);
        if (newRefresh) localStorage.setItem('customer_refresh_token', newRefresh);
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('storage'));
      }
      return newAccess;
    }
    return null;
  } catch (e) {
    console.warn('Auto token refresh error:', e);
    return null;
  }
};

async function aiRequest(endpoint, options = {}, isRetry = false) {
  let token = getActiveAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${AI_API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  // Automatic token refresh interceptor on 401
  if (response.status === 401 && !isRetry) {
    const refreshedToken = await refreshCurrentAuthToken();
    if (refreshedToken) {
      const retryHeaders = {
        ...headers,
        Authorization: `Bearer ${refreshedToken}`,
      };
      return aiRequest(endpoint, { ...options, headers: retryHeaders }, true);
    }
  }

  const contentType = response.headers.get('content-type');
  let data = null;
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    let errorMsg =
      (data && (data.detail || data.message || (typeof data === 'object' && JSON.stringify(data)))) ||
      `Request failed with status ${response.status}`;

    if (response.status === 502 || response.status === 504) {
      errorMsg = "Unable to reach ZELORA backend service. Please ensure the Django server is running on port 8000.";
    }

    const err = new Error(errorMsg);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
}

export const aiApi = {
  sendMessage: (
    message,
    conversationId = null,
    preferredProvider = null,
    cartCount = null,
    cartItems = null
  ) => {
    let finalCount = cartCount;
    let finalItems = cartItems;

    // Resilient fallback: snapshot directly from local storage if not supplied
    if (finalCount === null || finalCount === undefined || !finalItems || finalItems.length === 0) {
      try {
        const snapshot = resolveActiveCart();
        if (finalCount === null || finalCount === undefined || finalCount === 0) {
          finalCount = snapshot.count;
        }
        if (!finalItems || finalItems.length === 0) {
          finalItems = snapshot.items;
        }
      } catch (e) {
        console.warn('Could not resolve cart snapshot for AI:', e);
      }
    }

    return aiRequest('/chat/', {
      method: 'POST',
      body: JSON.stringify({
        message,
        conversation_id: conversationId,
        preferred_provider: preferredProvider,
        cart_count: typeof finalCount === 'number' ? finalCount : 0,
        cart_items: Array.isArray(finalItems) ? finalItems : [],
      }),
    });
  },

  getConversations: () => {
    return aiRequest('/conversations/', { method: 'GET' });
  },

  getConversationMessages: (conversationId) => {
    return aiRequest(`/conversations/${conversationId}/`, { method: 'GET' });
  },

  deleteConversation: (conversationId) => {
    return aiRequest(`/conversations/${conversationId}/`, { method: 'DELETE' });
  },

  clearAllConversations: () => {
    return aiRequest('/conversations/clear-all/', { method: 'POST' });
  },
};
