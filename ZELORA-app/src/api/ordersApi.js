// ZELORA Mobile Orders API
import { apiClient } from './client';

export const ordersApi = {
  getOrders: async (status = '') => {
    const endpoint = `/auth/orders/${status ? `?status=${status}` : ''}`;
    return await apiClient(endpoint);
  },

  getOrderDetails: async (orderId) => {
    return await apiClient(`/auth/orders/${orderId}/`);
  },

  createOrder: async (orderData) => {
    return await apiClient('/auth/orders/', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  cancelOrder: async (orderId) => {
    return await apiClient(`/auth/orders/${orderId}/cancel/`, {
      method: 'POST',
    });
  },
};
