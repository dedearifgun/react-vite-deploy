import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5015/api';
// Ekspor origin agar bisa digunakan untuk membentuk URL aset
export const API_ORIGIN = new URL(API_BASE_URL).origin;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const productAPI = {
  getProducts: (params = {}) => api.get('/products', { params }),
  searchProducts: (query) => api.get('/products', { params: { search: query, limit: 5 } }),
  getProduct: (id) => api.get(`/products/${id}`),
  getProductByCode: (code) => api.get(`/products/by-code/${encodeURIComponent(code)}`),
  createProduct: (productData) => {
    if (productData && (productData instanceof FormData)) {
      return api.post('/products', productData, { headers: { 'Content-Type': 'multipart/form-data' } });
    }
    return api.post('/products', productData);
  },
  updateProduct: (id, productData) => {
    if (productData && (productData instanceof FormData)) {
      return api.put(`/products/${id}`, productData, { headers: { 'Content-Type': 'multipart/form-data' } });
    }
    return api.put(`/products/${id}`, productData);
  },
  deleteProduct: (id) => api.delete(`/products/${id}`),
  reorderProducts: (orders) => api.put('/products/reorder', { orders }),
};

export const categoryAPI = {
  getCategories: (config = {}) => api.get('/categories', config),
  getCategory: (id) => api.get(`/categories/${id}`),
  createCategory: (categoryData) => api.post('/categories', categoryData),
  updateCategory: (id, categoryData) => api.put(`/categories/${id}`, categoryData),
  deleteCategory: (id) => api.delete(`/categories/${id}`),
  reorderCategories: (orders) => api.put('/categories/reorder', { orders }),
};

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  logout: () => api.get('/auth/logout'),
};

export const userAPI = {
  getUsers: () => api.get('/users'),
  getUser: (id) => api.get(`/users/${id}`),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/users/${id}`),
};

// Logs API untuk halaman Admin Logs
export const logsAPI = {
  // Mendukung filter: start/end (YYYY-MM-DD), action, model, limit
  getLogs: (params = {}) => api.get('/logs', { params }),
};

// Statistik untuk dashboard admin
export const statsAPI = {
  getTotals: () => api.get('/stats/totals'),
  getToday: () => api.get('/stats/today'),
  getDaily: (days = 7) => api.get('/stats/daily', { params: { days } }),
  getDailyWith: (params = {}) => api.get('/stats/daily', { params }),
};

// Analytics publik (klik WhatsApp)
export const analyticsAPI = {
  trackWhatsAppClick: (payload = {}) => api.post('/analytics/wa-click', payload),
};

export default api;