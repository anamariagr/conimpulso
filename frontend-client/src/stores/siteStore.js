import { create } from 'zustand';
import api from '../services/api';

export const useSiteStore = create((set, get) => ({
  logoUrl: null,
  siteName: 'ConImpulso',
  aiInsightsEnabled: false,
  whatsappPhone: '3115728852',
  callmebotApiKey: '',
  walletCoinValueCop: 3000,
  breBKey: '',
  breBQrImageUrl: '',
  wompiEnabled: false,
  wompiPublicKey: '',
  productOrderCommissionRate: 5,
  loaded: false,

  fetchSettings: async () => {
    if (get().loaded) return;
    try {
      const res = await api.get('/homepage/active');
      const settings = res.data?.data?.layout?.settings || {};
      set({
        logoUrl: settings.logo_url || null,
        siteName: settings.site_name || 'ConImpulso',
        aiInsightsEnabled: settings.ai_insights_enabled === true,
        whatsappPhone: settings.whatsapp_phone || '3115728852',
        callmebotApiKey: settings.callmebot_api_key || '',
        walletCoinValueCop: Number(settings.wallet_coin_value_cop) || 3000,
        breBKey: settings.bre_b_key || '',
        breBQrImageUrl: settings.bre_b_qr_image_url || '',
        wompiEnabled: settings.wompi_enabled === true,
        wompiPublicKey: settings.wompi_public_key || '',
        productOrderCommissionRate: Number(settings.product_order_commission_rate) || 5,
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
      ai_insights_enabled: get().aiInsightsEnabled,
      whatsapp_phone: get().whatsappPhone,
      callmebot_api_key: get().callmebotApiKey,
      wallet_coin_value_cop: get().walletCoinValueCop,
      bre_b_key: get().breBKey,
      bre_b_qr_image_url: get().breBQrImageUrl,
      wompi_enabled: get().wompiEnabled,
      wompi_public_key: get().wompiPublicKey,
      product_order_commission_rate: get().productOrderCommissionRate,
    };
    const merged = { ...current, ...patch };
    await api.put('/admin/homepage/layout', { settings: merged });
    set({
      logoUrl: merged.logo_url,
      siteName: merged.site_name,
      aiInsightsEnabled: merged.ai_insights_enabled === true,
      whatsappPhone: merged.whatsapp_phone || '3115728852',
      callmebotApiKey: merged.callmebot_api_key || '',
      walletCoinValueCop: Number(merged.wallet_coin_value_cop) || 3000,
      breBKey: merged.bre_b_key || '',
      breBQrImageUrl: merged.bre_b_qr_image_url || '',
      wompiEnabled: merged.wompi_enabled === true,
      wompiPublicKey: merged.wompi_public_key || '',
      productOrderCommissionRate: Number(merged.product_order_commission_rate) || 5,
    });
  },
}));
