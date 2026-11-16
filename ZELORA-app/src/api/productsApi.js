// ZELORA Mobile Catalog & Products API
import { apiClient } from './client';

export const productsApi = {
  getProducts: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.category) query.append('category', params.category);
    if (params.search) query.append('search', params.search);
    if (params.ordering) query.append('ordering', params.ordering);
    if (params.gender) query.append('gender', params.gender);
    if (params.page) query.append('page', params.page);

    const queryString = query.toString();
    const endpoint = `/products/${queryString ? `?${queryString}` : ''}`;
    return await apiClient(endpoint);
  },

  getProductDetails: async (productId) => {
    return await apiClient(`/products/${productId}/`);
  },

  getCategories: async () => {
    try {
      return await apiClient('/categories/');
    } catch {
      // Fallback default fashion categories if endpoint not separately mapped
      return [
        { id: 1, name: 'All Categories', slug: 'all' },
        { id: 2, name: 'Outerwear & Coats', slug: 'outerwear' },
        { id: 3, name: 'Dresses & Gowns', slug: 'dresses' },
        { id: 4, name: 'Tops & Shirts', slug: 'tops' },
        { id: 5, name: 'Tailored Trousers', slug: 'trousers' },
        { id: 6, name: 'Knitwear & Sweaters', slug: 'knitwear' },
        { id: 7, name: 'Accessories & Leather', slug: 'accessories' },
      ];
    }
  },
};
