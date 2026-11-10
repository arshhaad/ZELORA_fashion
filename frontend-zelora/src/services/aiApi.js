// ZELORA AI Assistant API Client

const AI_API_BASE = '/api/ai';

export const getActivePortalAuth = (pathname = '') => {
  const path = pathname || (typeof window !== 'undefined' ? window.location.pathname : '');

  // 1. Admin Portal
  if (path.startsWith('/admin')) {
    const token = localStorage.getItem('zelora_admin_token');
    const raw = localStorage.getItem('zelora_admin_user');
    let user = null;
    try { user = raw ? JSON.parse(raw) : null; } catch { user = null; }
    if (token && user) return { token, user, role: 'admin' };
    return { token: null, user: null, role: null };
  }

  // 2. Seller Portal
  if (path.startsWith('/seller')) {
    const isAuth = localStorage.getItem('zelora_seller_auth') === 'true';
    const token = localStorage.getItem('zelora_seller_access_token');
    const raw = localStorage.getItem('zelora_seller_user');
    let user = null;
    try { user = raw ? JSON.parse(raw) : null; } catch { user = null; }
    if (isAuth && token && user) return { token, user, role: 'seller' };
    return { token: null, user: null, role: null };
  }

  // 3. Customer Portal (Home, Products, Orders, Landing, Account, etc.)
  const token = localStorage.getItem('customer_access_token');
  const raw = localStorage.getItem('customer_user');
  let user = null;
  try { user = raw ? JSON.parse(raw) : null; } catch { user = null; }
  if (token && user) return { token, user, role: 'customer' };

  return { token: null, user: null, role: null };
};

export const getActiveAuthToken = (pathname = '') => {
  const auth = getActivePortalAuth(pathname);
  return auth.token;
};

export const getActiveAuthUser = (pathname = '') => {
  const auth = getActivePortalAuth(pathname);
  return auth.user;
};

async function aiRequest(endpoint, options = {}) {
  const token = getActiveAuthToken();
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
  sendMessage: (message, conversationId = null, preferredProvider = null) => {
    return aiRequest('/chat/', {
      method: 'POST',
      body: JSON.stringify({
        message,
        conversation_id: conversationId,
        preferred_provider: preferredProvider,
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

