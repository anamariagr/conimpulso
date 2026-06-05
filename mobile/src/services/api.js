import axios from 'axios';

const API_URL = 'http://localhost/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  const token = await AsyncStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      AsyncStorage.removeItem('auth_token');
      // Navigate to login
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
};

export const productService = {
  index: () => api.get('/products'),
  show: (id) => api.get(`/products/${id}`),
  myProducts: () => api.get('/my/products'),
  store: (data) => api.post('/products', data),
};

export const shopService = {
  index: () => api.get('/shops'),
  show: (slug) => api.get(`/shops/${slug}`),
  myShop: () => api.get('/my/shop'),
};

export const walletService = {
  index: () => api.get('/wallet'),
  transactions: () => api.get('/wallet/transactions'),
  topUp: (data) => api.post('/wallet/top-up', data),
};

export const leadsService = {
  index: () => api.get('/leads'),
  store: (data) => api.post('/leads', data),
};

export const notificationsService = {
  getPushToken: () => api.post('/user/push-token', { token }),
  list: () => api.get('/notifications'),
  markRead: (id) => api.post(`/notifications/${id}/read`),
};

export default api;