// ZELORA AI Assistant API Client

const AI_API_BASE = '/api/ai';

export const getActiveAuthToken = () => {
  return (
    localStorage.getItem('customer_access_token') ||
    localStorage.getItem('zelora_seller_access_token') ||
    localStorage.getItem('zelora_admin_token') ||
    null
  );
};

export const getActiveAuthUser = () => {
  try {
    const rawCustomer = localStorage.getItem('customer_user');
    if (rawCustomer) return JSON.parse(rawCustomer);

    const rawSeller = localStorage.getItem('zelora_seller_user');
    if (rawSeller) return JSON.parse(rawSeller);

    const rawAdmin = localStorage.getItem('zelora_admin_user');
    if (rawAdmin) return JSON.parse(rawAdmin);

    return null;
  } catch {
    return null;
  }
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
    const errorMsg =
      (data && (data.detail || data.message || (typeof data === 'object' && JSON.stringify(data)))) ||
      `Request failed with status ${response.status}`;
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

