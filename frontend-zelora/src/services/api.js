const API_BASE = '/api/auth';

export const getAccessToken = () => localStorage.getItem('customer_access_token');
export const getRefreshToken = () => localStorage.getItem('customer_refresh_token');

export const setTokens = (tokens) => {
  if (tokens.access) localStorage.setItem('customer_access_token', tokens.access);
  if (tokens.refresh) localStorage.setItem('customer_refresh_token', tokens.refresh);
};

export const clearTokens = () => {
  localStorage.removeItem('customer_access_token');
  localStorage.removeItem('customer_refresh_token');
  localStorage.removeItem('customer_user');
};

export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem('customer_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setStoredUser = (user) => {
  localStorage.setItem('customer_user', JSON.stringify(user));
};

async function request(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const token = getAccessToken();
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
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
    const error = new Error(
      (data && (data.detail || data.message || (typeof data === 'object' && JSON.stringify(data)))) ||
      `Request failed with status ${response.status}`
    );
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const authApi = {
  register: (payload) => request('/register/', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),

  login: (payload) => request('/login/', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),

  verifyEmail: (payload) => request('/verify-email/', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),

  resendVerification: (payload) => request('/resend-verification/', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),

  sendSellerOtp: (payload) => request('/seller/send-otp/', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),

  verifySellerOtp: (payload) => request('/seller/verify-otp/', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),

  sellerRegister: (payload) => request('/seller/register/', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),

  sellerLogin: (payload) => request('/seller/login/', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),

  googleAuth: (payload) => request('/google/', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),

  forgotPassword: (payload) => request('/forgot-password/', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),

  resetPassword: (payload) => request('/reset-password/', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),

  logout: async () => {
    const refresh = getRefreshToken();
    try {
      if (refresh) {
        await request('/logout/', {
          method: 'POST',
          body: JSON.stringify({ refresh }),
        });
      }
    } catch {
      // Continue client cleanup
    } finally {
      clearTokens();
    }
  },

  getMe: () => request('/me/'),

  // Customer Profile
  updateProfile: (data) => request('/profile/', {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),

  // Addresses
  getAddresses: () => request('/addresses/'),
  createAddress: (data) => request('/addresses/', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateAddress: (id, data) => request(`/addresses/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteAddress: (id) => request(`/addresses/${id}/`, {
    method: 'DELETE',
  }),
  setDefaultAddress: (id) => request(`/addresses/${id}/default/`, {
    method: 'POST',
  }),

  // Orders
  getOrders: (status) => request(`/orders/${status ? `?status=${status}` : ''}`),
  getOrderDetails: (orderId) => request(`/orders/${orderId}/`),
  createOrder: (data) => request('/orders/', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  cancelOrder: (orderId) => request(`/orders/${orderId}/cancel/`, {
    method: 'POST',
  }),
  returnOrder: (orderId) => request(`/orders/${orderId}/return/`, {
    method: 'POST',
  }),

  // Notifications
  getNotifications: (category) => request(`/notifications/${category ? `?category=${category}` : ''}`),
  markNotificationRead: (id) => request(id ? `/notifications/${id}/read/` : '/notifications/read-all/', {
    method: 'POST',
  }),
  deleteNotification: (id) => request(`/notifications/${id}/`, {
    method: 'DELETE',
  }),

  // Razorpay Payment Gateway
  getRazorpayConfig: () => request('/payment/razorpay/config/'),
  createRazorpayOrder: (payload) => request('/payment/razorpay/create-order/', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  verifyRazorpayPayment: (payload) => request('/payment/razorpay/verify/', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
};

// ==============================================================================
// ADMIN CONSOLE API CLIENT (/api/admin)
// ==============================================================================

const ADMIN_API_BASE = '/api/admin';

export const getAdminAccessToken = () => localStorage.getItem('zelora_admin_token');
export const setAdminAccessToken = (token) => localStorage.setItem('zelora_admin_token', token);
export const clearAdminTokens = () => {
  localStorage.removeItem('zelora_admin_token');
  localStorage.removeItem('zelora_admin_user');
};

export const getStoredAdminUser = () => {
  try {
    const raw = localStorage.getItem('zelora_admin_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setStoredAdminUser = (user) => {
  localStorage.setItem('zelora_admin_user', JSON.stringify(user));
};

async function adminRequest(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const token = getAdminAccessToken();
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${ADMIN_API_BASE}${endpoint}`, {
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
    const error = new Error(
      (data && (data.detail || data.message || (typeof data === 'object' && JSON.stringify(data)))) ||
      `Admin request failed with status ${response.status}`
    );
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const adminApi = {
  // 1. Auth
  login: (payload) => adminRequest('/auth/login/', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  getMe: () => adminRequest('/auth/me/'),

  // 2. Dashboard
  getMetrics: () => adminRequest('/dashboard/metrics/'),

  // 3. User Management
  getCustomers: (search) => adminRequest(`/users/customers/${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  getCustomerDetail: (userId) => adminRequest(`/users/customers/${userId}/`),
  sendCustomerNotification: (userId, payload) => adminRequest(`/users/customers/${userId}/notify/`, {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  toggleCustomerBlock: (userId) => adminRequest(`/users/customers/${userId}/toggle-block/`, {
    method: 'POST',
  }),
  getSellers: () => adminRequest('/users/sellers/'),
  getSellerDetail: (sellerId) => adminRequest(`/users/sellers/${sellerId}/`),
  sendSellerNotification: (sellerId, payload) => adminRequest(`/users/sellers/${sellerId}/notify/`, {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  getAdminUsers: () => adminRequest('/users/admins/'),
  createAdminUser: (payload) => adminRequest('/users/admins/', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),

  // 4. Shop Management
  getShopApprovals: () => adminRequest('/shops/approvals/'),
  shopDecision: (shopId, action, feedback) => adminRequest(`/shops/${shopId}/decision/`, {
    method: 'POST',
    body: JSON.stringify({ action, feedback }),
  }),

  // 5. Product Management
  moderateProduct: (productId, action) => adminRequest(`/products/${productId}/moderate/`, {
    method: 'POST',
    body: JSON.stringify({ action }),
  }),

  // 6. Orders, Payments, Payouts
  getOrders: () => adminRequest('/orders/'),
  getPayments: () => adminRequest('/payments/'),
  getPayouts: () => adminRequest('/payouts/'),
  processPayout: (payload) => adminRequest('/payouts/', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),

  // 7. Marketing & Content
  getCoupons: () => adminRequest('/coupons/'),
  createCoupon: (payload) => adminRequest('/coupons/', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  getBanners: () => adminRequest('/banners/'),
  createBanner: (payload) => adminRequest('/banners/', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  getNotifications: () => adminRequest('/notifications/'),
  sendNotification: (payload) => adminRequest('/notifications/', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),

  // 8. Support & Settings
  getReviews: () => adminRequest('/reviews/'),
  moderateReview: (reviewId, status) => adminRequest(`/reviews/${reviewId}/`, {
    method: 'POST',
    body: JSON.stringify({ status }),
  }),
  getTickets: () => adminRequest('/tickets/'),
  replyTicket: (ticketId, message, status) => adminRequest(`/tickets/${ticketId}/reply/`, {
    method: 'POST',
    body: JSON.stringify({ message, status }),
  }),
  getSettings: () => adminRequest('/settings/'),
  updateSettings: (payload) => adminRequest('/settings/', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
};
