import { create } from 'zustand';
import api from '../services/api';

export const useSiteStore = create((set, get) => ({
  logoUrl: null,
  siteName: 'ConImpulso',
  loaded: false,

  fetchSettings: async () => {
    if (get().loaded) return;
    try {
      const res = await api.get('/homepage/active');
      const settings = res.data?.data?.layout?.settings || {};
      set({
        logoUrl: settings.logo_url || null,
        siteName: settings.site_name || 'ConImpulso',
        loaded: true,
      });
    } catch {
      set({ loaded: true });
    }
  },

  updateSettings: async (patch) => {
    const current = {
      logo_url: get().logoUrl,
      site_name: get().siteName,
    };
    const merged = { ...current, ...patch };
    await api.put('/admin/homepage/layout', { settings: merged });
    set({
      logoUrl: merged.logo_url,
      siteName: merged.site_name,
    });
  },
}));
