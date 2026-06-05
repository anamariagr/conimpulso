import { create } from 'zustand';
import { authService } from '../services/api';

export const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('auth_token') || null,
  isAuthenticated: !!localStorage.getItem('auth_token'),
  isLoading: false,
  error: null,
  activeRole: null, // 'vendor', 'advisor', or null for client view

  // Actual role checks (from user data)
  isVendor: () => {
    const user = get().user;
    const roles = user?.roles || [];
    return roles.includes('vendor') || user?.is_vendor === true;
  },

  isAdvisor: () => {
    const user = get().user;
    const roles = user?.roles || [];
    return roles.includes('advisor') || user?.is_advisor === true;
  },

  isSuperAdmin: () => {
    const user = get().user;
    const roles = user?.roles || [];
    return roles.includes('super_admin') || roles.includes('admin');
  },

  // View-as role checks (considers activeRole for client users)
  viewAsVendor: () => {
    const { activeRole, isVendor } = get();
    // If activeRole is set, use it; otherwise use actual vendor status
    if (activeRole === 'vendor') return true;
    if (activeRole === 'advisor') return false;
    // activeRole is null, check actual status
    return isVendor();
  },

  viewAsAdvisor: () => {
    const { activeRole, isAdvisor } = get();
    if (activeRole === 'advisor') return true;
    if (activeRole === 'vendor') return false;
    return isAdvisor();
  },

  // Is viewing as a plain client (no activeRole and not actual vendor/advisor)
  isClientView: () => {
    const { activeRole, isVendor, isAdvisor } = get();
    if (activeRole) return false; // Has an active role view
    // Check if user has actual vendor or advisor role
    return !isVendor() && !isAdvisor();
  },

  setActiveRole: (role) => set({ activeRole: role }),

  clearActiveRole: () => set({ activeRole: null }),

  login: async (email, password) => {
    set({ isLoading: true, error: null, activeRole: null });
    try {
      const response = await authService.login({ email, password });
      const { user, token } = response.data.data;

      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(user));

      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        activeRole: null,
      });

      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      set({ isLoading: false, error: message, activeRole: null });
      return { success: false, message };
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null, activeRole: null });
    try {
      const response = await authService.register(data);
      const { user, token } = response.data.data;

      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(user));

      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        activeRole: null,
      });

      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      const errors = error.response?.data?.errors;
      set({ isLoading: false, error: message, activeRole: null });
      return { success: false, message, errors };
    }
  },

  logout: async () => {
    try {
      await authService.logout();
    } catch (e) {
      // Ignore logout errors
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        error: null,
        activeRole: null,
      });
    }
  },

  checkAuth: async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      set({ isAuthenticated: false, activeRole: null });
      return;
    }

    try {
      const response = await authService.me();
      const user = response.data.data.user;
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, isAuthenticated: true, activeRole: null });
    } catch (error) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      set({ user: null, token: null, isAuthenticated: false, activeRole: null });
    }
  },

  clearError: () => set({ error: null }),
}));