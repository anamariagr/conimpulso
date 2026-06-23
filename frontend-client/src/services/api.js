import axios from 'axios';

const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  googleAuth: (credential) => api.post('/auth/google', { credential }),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  completeOnboarding: (data) => api.post('/auth/onboarding', data),
  refresh: () => api.post('/auth/refresh'),
  resetPassword: (data) => api.post('/auth/password/reset-link', data),
};

export const advertisingService = {
  campaigns: () => api.get('/advertising/campaigns'),
  createCampaign: (data) => api.post('/advertising/campaigns', data),
  updateCampaign: (id, data) => api.put(`/advertising/campaigns/${id}`, data),
  campaignStats: (id) => api.get(`/advertising/campaigns/${id}/stats`),
  createAd: (campaignId, data) => api.post(`/advertising/campaigns/${campaignId}/ads`, data),
  myAds: () => api.get('/advertising/ads'),
  featuredProducts: () => api.get('/advertising/featured'),
};

export const shopService = {
  index: () => api.get('/shops'),
  show: (slug) => api.get(`/shops/${slug}`),
  myShop: () => api.get('/my/shops'),
  store: (data) => api.post('/shops', data),
  update: (id, data) => api.put(`/shops/${id}`, data),
  destroy: (id) => api.delete(`/shops/${id}`),
};

export const productService = {
  index: () => api.get('/products'),
  show: (id) => api.get(`/products/${id}`),
  myProducts: () => api.get('/my/products'),
  store: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  destroy: (id) => api.delete(`/products/${id}`),
};

export const categoryService = {
  index: () => api.get('/categories'),
};

export const serviceService = {
  index: () => api.get('/services'),
  show: (id) => api.get(`/services/${id}`),
};

export const aiService = {
  suggestCategory: (name, description) => api.post('/ai/suggest-category', { name, description }),
  publicSuggestCategory: (name, description) => api.get('/ai/categories/suggest', { params: { name, description } }),
  similarProducts: (productId) => api.get(`/ai/recommendations/similar/${productId}`),
  relatedProducts: (productId) => api.get(`/ai/recommendations/related/${productId}`),
  trendingProducts: () => api.get('/ai/recommendations/trending'),
  personalizedRecommendations: () => api.get('/ai/recommendations/personalized'),
  moderateContent: (content, type) => api.post('/ai/moderate', { content, type }),
};

export const logisticsService = {
  quotes: () => api.get('/logistics/quotes'),
  shipments: () => api.get('/logistics/shipments'),
  createShipment: (data) => api.post('/logistics/shipments', data),
  trackShipment: (trackingNumber) => api.get(`/logistics/shipments/${trackingNumber}/track`),
  pickupRequests: () => api.get('/logistics/pickups'),
  createPickupRequest: (data) => api.post('/logistics/pickups', data),
};

export const advisorsService = {
  myProfile: () => api.get('/advisors/my-profile'),
  createProfile: (data) => api.post('/advisors/profiles', data),
  updateProfile: (id, data) => api.put(`/advisors/profiles/${id}`, data),
  apply: (data) => api.post('/advisors/apply', data),
  myApplications: () => api.get('/advisors/my-applications'),
  commissions: () => api.get('/advisors/commissions'),
  commissionStats: () => api.get('/advisors/commissions/stats'),
  leads: () => api.get('/advisors/leads'),
  createLead: (data) => api.post('/advisors/leads', data),
  opportunities: () => api.get('/advisors/opportunities'),
};

export const leadsService = {
  index: () => api.get('/leads'),
  show: (id) => api.get(`/leads/${id}`),
  myLeads: () => api.get('/leads/my'),
  store: (data) => api.post('/leads', data),
  update: (id, data) => api.put(`/leads/${id}`, data),
  convert: (id) => api.post(`/leads/${id}/convert`),
};

export const b2bService = {
  profiles: () => api.get('/b2b/profiles'),
  myProfile: () => api.get('/b2b/my-profile'),
  createProfile: (data) => api.post('/b2b/profiles', data),
  updateProfile: (id, data) => api.put(`/b2b/profiles/${id}`),
  connections: () => api.get('/b2b/connections'),
  pendingConnections: () => api.get('/b2b/connections/pending'),
  sendConnection: (data) => api.post('/b2b/connections', data),
  respondToConnection: (id, data) => api.post(`/b2b/connections/${id}/respond`),
  negotiations: () => api.get('/b2b/negotiations'),
  createNegotiation: (data) => api.post('/b2b/negotiations', data),
  negotiationMessages: (id) => api.get(`/b2b/negotiations/${id}/messages`),
  sendNegotiationMessage: (id, data) => api.post(`/b2b/negotiations/${id}/messages`, data),
  agreeNegotiation: (id) => api.post(`/b2b/negotiations/${id}/agree`),
  supplierRequests: () => api.get('/b2b/supplier-requests'),
  createSupplierRequest: (data) => api.post('/b2b/supplier-requests', data),
  submitQuote: (requestId, data) => api.post(`/b2b/supplier-requests/${requestId}/quote`, data),
};

export const vendorService = {
  shopStats: () => api.get('/vendor/shop/stats'),
  revenueStats: (period) => api.get('/vendor/shop/revenue', { params: { period } }),
  salesChart: (days) => api.get('/vendor/shop/sales-chart', { params: { days } }),
  topProducts: (limit) => api.get('/vendor/shop/top-products', { params: { limit } }),
  promotions: () => api.get('/vendor/shop/promotions'),
  createPromotion: (data) => api.post('/vendor/shop/promotions', data),
  updatePromotion: (id, data) => api.put(`/vendor/shop/promotions/${id}`, data),
  deletePromotion: (id) => api.delete(`/vendor/shop/promotions/${id}`),
  notifications: () => api.get('/vendor/shop/notifications'),
  markNotificationRead: (id) => api.post(`/vendor/shop/notifications/${id}/read`),
  markAllNotificationsRead: () => api.post('/vendor/shop/notifications/read-all'),
  unreadNotificationCount: () => api.get('/vendor/shop/notifications/count'),
};

export default api;