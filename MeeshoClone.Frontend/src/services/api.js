import axios from 'axios';

const API_BASE_URL = 'http://localhost:5041/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  upgradeToPremier: (data) => api.post('/auth/upgrade-premier', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  generateCaptcha: () => api.post('/auth/generate-captcha'),
  verifyCaptcha: (data) => api.post('/auth/verify-captcha', data),
};

// Vendor API
export const vendorAPI = {
  register: (data) => api.post('/vendor/register', data),
  getAll: () => api.get('/vendor'),
  getById: (id) => api.get(`/vendor/${id}`),
  update: (id, data) => api.put(`/vendor/${id}`, data),
  verify: (id) => api.post(`/vendor/${id}/verify`),
};

// Product API
export const productAPI = {
  create: (data) => api.post('/product', data),
  getAll: () => api.get('/product'),
  getById: (id) => api.get(`/product/${id}`),
  getByVendor: (vendorId) => api.get(`/product/vendor/${vendorId}`),
  getByCategory: (category) => api.get(`/product/category/${category}`),
  search: (query) => api.get('/product/search', { params: { query } }),
  update: (id, data) => api.put(`/product/${id}`, data),
  delete: (id) => api.delete(`/product/${id}`),
  toggleFeatured: (id, data) => api.post(`/product/${id}/featured`, data),
};

// Order API
export const orderAPI = {
  create: (data) => api.post('/order', data),
  getAll: () => api.get('/order'),
  getByUser: (userId) => api.get(`/order/user/${userId}`),
  getById: (id) => api.get(`/order/${id}`),
  updateStatus: (id, data) => api.put(`/order/${id}/status`, data),
  updatePayment: (id, data) => api.put(`/order/${id}/payment`, data),
};

// Seed API
export const seedAPI = {
  seedDatabase: () => api.post('/seed'),
};

// Category API
export const categoryAPI = {
  getAll: () => api.get('/category'),
  getById: (id) => api.get(`/category/${id}`),
  getFeatured: () => api.get('/category/featured'),
  getByCategory: (category) => api.get(`/category/category/${category}`),
};

// Company API
export const companyAPI = {
  getAll: () => api.get('/company'),
  getById: (id) => api.get(`/company/${id}`),
  getByCategory: (category) => api.get(`/company/category/${category}`),
  getFeatured: () => api.get('/company/featured'),
};

// Cart API
export const cartAPI = {
  getCart: (userId) => api.get(`/cart/${userId}`),
  addToCart: (data) => api.post('/cart', data),
  updateCart: (cartId, data) => api.put(`/cart/${cartId}`, data),
  removeFromCart: (cartId, itemId) => api.delete(`/cart/${cartId}/item/${itemId}`),
  clearCart: (cartId) => api.delete(`/cart/${cartId}`),
};

// Site Configuration API
export const siteConfigAPI = {
  getConfiguration: () => api.get('/siteconfiguration'),
  updateConfiguration: (data) => api.post('/siteconfiguration', data),
  updateHeader: (data) => api.put('/siteconfiguration/header', data),
  updateFooter: (data) => api.put('/siteconfiguration/footer', data),
  updateTheme: (data) => api.put('/siteconfiguration/theme', data),
};

export default api;
