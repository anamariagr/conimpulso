import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Settings as SettingsIcon, Mail, Shield, Bell, Globe, DollarSign, AlertTriangle, ImageIcon, ArrowRight, Sparkles, MessageCircle, Eye, EyeOff, Wallet, QrCode } from 'lucide-react';
import { useSiteStore } from '../../stores/siteStore';
import { SingleImageUploader } from '../../components/forms/ImageUploader';
import toast from 'react-hot-toast';

export default function SettingsView() {
  const {
    logoUrl, siteName, aiInsightsEnabled, whatsappPhone, callmebotApiKey,
    walletCoinValueCop, breBKey, breBQrImageUrl, wompiEnabled, wompiPublicKey,
    productOrderCommissionRate, loaded, fetchSettings, updateSettings,
  } = useSiteStore();

  // Settings are only safe to save once the real values have loaded from the
  // server — saving before that would overwrite the DB with these defaults.
  useEffect(() => { fetchSettings(); }, []);
  useEffect(() => {
    if (!loaded) return;
    setSettings((prev) => ({
      ...prev,
      appName: siteName || 'ConImpulso',
      aiInsights: aiInsightsEnabled,
      whatsappPhone: whatsappPhone || '3115728852',
      callmebotApiKey: callmebotApiKey || '',
      walletCoinValueCop: walletCoinValueCop || 3000,
      breBKey: breBKey || '',
      breBQrImageUrl: breBQrImageUrl || '',
      wompiEnabled: wompiEnabled || false,
      wompiPublicKey: wompiPublicKey || '',
      productOrderCommissionRate: productOrderCommissionRate || 10,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  const [settings, setSettings] = useState({
    appName: siteName || 'ConImpulso',
    appUrl: 'https://conimpulso.com',
    contactEmail: 'informacion@cristiangarcia.co',
    supportEmail: 'informacion@cristiangarcia.co',
    currency: 'COP',
    timezone: 'America/Bogota',
    maintenanceMode: false,
    advisorMonetization: false,
    userVerification: true,
    twoFactor: false,
    welcomeEmail: true,
    orderNotifications: true,
    aiInsights: aiInsightsEnabled,
    whatsappPhone: whatsappPhone || '3115728852',
    callmebotApiKey: callmebotApiKey || '',
    walletCoinValueCop: walletCoinValueCop || 3000,
    breBKey: breBKey || '',
    breBQrImageUrl: breBQrImageUrl || '',
    wompiEnabled: wompiEnabled || false,
    wompiPublicKey: wompiPublicKey || '',
    productOrderCommissionRate: productOrderCommissionRate || 10,
  });
  const [showApiKey, setShowApiKey] = useState(false);

  const set = (key, value) => setSettings((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    try {
      await updateSettings({
        ai_insights_enabled: settings.aiInsights,
        whatsapp_phone: settings.whatsappPhone,
        callmebot_api_key: settings.callmebotApiKey,
        wallet_coin_value_cop: settings.walletCoinValueCop,
        bre_b_key: settings.breBKey,
        bre_b_qr_image_url: settings.breBQrImageUrl,
        wompi_enabled: settings.wompiEnabled,
        wompi_public_key: settings.wompiPublicKey,
        product_order_commission_rate: settings.productOrderCommissionRate,
      });
      toast.success('Configuración guardada');
    } catch {
      toast.error('Error al guardar la configuración');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
          <p className="text-gray-500">Configura los ajustes generales de la plataforma</p>
        </div>
        <button onClick={handleSave} disabled={!loaded} className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
          {loaded ? 'Guardar cambios' : 'Cargando...'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">

          {/* Logo — redirige al Editor de Inicio */}
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Logo de la plataforma</h3>
                <p className="text-sm text-gray-500">Se edita desde el Editor de Inicio</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-14 w-32 bg-primary rounded-xl flex items-center justify-center px-3">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="max-h-10 max-w-[110px] object-contain" />
                ) : (
                  <div className="flex items-center gap-1.5">
                    <div className="w-7 h-7 bg-accent rounded-lg flex items-center justify-center">
                      <span className="text-primary font-bold text-sm">C</span>
                    </div>
                    <span className="text-white font-bold text-sm">ConImpulso</span>
                  </div>
                )}
              </div>
              <Link
                to="/admin/homepage-editor"
                className="flex items-center gap-2 px-4 py-2 bg-accent text-white font-medium rounded-xl hover:bg-accent-400 transition-colors text-sm"
              >
                Editar logo <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* General */}
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <SettingsIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">General</h3>
                <p className="text-sm text-gray-500">Nombre y URL de la plataforma</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la plataforma</label>
                <input
                  type="text"
                  value={settings.appName}
                  onChange={(e) => set('appName', e.target.value)}
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL de la aplicación</label>
                <input
                  type="text"
                  value={settings.appUrl}
                  onChange={(e) => set('appUrl', e.target.value)}
                  className="input-field w-full"
                />
              </div>
            </div>
          </div>

          {/* Email */}
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                <Mail className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Email</h3>
                <p className="text-sm text-gray-500">Configuración de correos</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email de contacto</label>
                <input
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) => set('contactEmail', e.target.value)}
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email de soporte</label>
                <input
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) => set('supportEmail', e.target.value)}
                  className="input-field w-full"
                />
              </div>
            </div>
          </div>

          {/* Localización */}
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <Globe className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Localización</h3>
                <p className="text-sm text-gray-500">Moneda y zona horaria</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Moneda</label>
                <select
                  value={settings.currency}
                  onChange={(e) => set('currency', e.target.value)}
                  className="input-field w-full"
                >
                  <option value="COP">Peso Colombiano (COP)</option>
                  <option value="USD">Dólar (USD)</option>
                  <option value="EUR">Euro (EUR)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Zona horaria</label>
                <select
                  value={settings.timezone}
                  onChange={(e) => set('timezone', e.target.value)}
                  className="input-field w-full"
                >
                  <option value="America/Bogota">Bogotá (UTC-5)</option>
                  <option value="America/Mexico_City">Ciudad de México (UTC-6)</option>
                  <option value="America/Buenos_Aires">Buenos Aires (UTC-3)</option>
                </select>
              </div>
            </div>
          </div>

        </div>

        {/* Right column */}
        <div className="space-y-6">

          {/* Seguridad */}
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Seguridad</h3>
              </div>
            </div>
            <div className="space-y-4">
              <Toggle
                label="Verificación de usuarios"
                checked={settings.userVerification}
                onChange={(v) => set('userVerification', v)}
              />
              <Toggle
                label="Autenticación de dos factores"
                checked={settings.twoFactor}
                onChange={(v) => set('twoFactor', v)}
              />
            </div>
          </div>

          {/* Notificaciones */}
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-accent-500/20 rounded-xl flex items-center justify-center">
                <Bell className="w-5 h-5 text-accent-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Notificaciones</h3>
              </div>
            </div>
            <div className="space-y-4">
              <Toggle
                label="Email de bienvenida"
                checked={settings.welcomeEmail}
                onChange={(v) => set('welcomeEmail', v)}
              />
              <Toggle
                label="Notificaciones de pedidos"
                checked={settings.orderNotifications}
                onChange={(v) => set('orderNotifications', v)}
              />
            </div>
          </div>

          {/* Sistema */}
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Sistema</h3>
              </div>
            </div>
            <div className="space-y-4">
              <Toggle
                label="Modo mantenimiento"
                checked={settings.maintenanceMode}
                onChange={(v) => set('maintenanceMode', v)}
              />
              <p className="text-xs text-gray-400">Solo admins pueden acceder cuando está activo.</p>
              <div className="border-t border-gray-100 pt-4">
                <Toggle
                  label="Cobrar por conexión de asesores"
                  checked={settings.advisorMonetization}
                  onChange={(v) => set('advisorMonetization', v)}
                />
                <p className="text-xs text-gray-400 mt-1">Si está desactivado, los asesores conectan gratis.</p>
              </div>
            </div>
          </div>

          {/* Funcionalidades */}
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Funcionalidades</h3>
              </div>
            </div>
            <div className="space-y-4">
              <Toggle
                label="AI Insights para vendedores"
                checked={settings.aiInsights}
                onChange={(v) => set('aiInsights', v)}
              />
              <p className="text-xs text-gray-400">Muestra la sección de análisis con IA en el dashboard de los vendedores.</p>
            </div>
          </div>

          {/* WhatsApp notificaciones */}
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Notificaciones WhatsApp</h3>
                <p className="text-sm text-gray-500">Recibe alertas de nuevas solicitudes de compra</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número de WhatsApp destino
                </label>
                <input
                  type="tel"
                  value={settings.whatsappPhone}
                  onChange={(e) => set('whatsappPhone', e.target.value)}
                  className="input-field w-full"
                  placeholder="Ej: 3115728852"
                />
                <p className="text-xs text-gray-400 mt-1">Sin código de país ni espacios.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CallMeBot API Key
                </label>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={settings.callmebotApiKey}
                    onChange={(e) => set('callmebotApiKey', e.target.value)}
                    className="input-field w-full pr-10"
                    placeholder="Ej: 1234567"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Para obtenerla: desde el número destino, envía{' '}
                  <code className="bg-gray-100 px-1 rounded text-xs">I allow callmebot to send me messages</code>{' '}
                  al <strong>+34 644 59 11 89</strong> en WhatsApp. Te responderán con tu API key.
                </p>
              </div>
              <div className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg ${settings.callmebotApiKey ? 'bg-green-50 text-green-700' : 'bg-accent-50 text-accent-700'}`}>
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${settings.callmebotApiKey ? 'bg-green-500' : 'bg-accent-500'}`} />
                {settings.callmebotApiKey
                  ? `Activo — las notificaciones llegarán al ${settings.whatsappPhone}`
                  : 'Sin configurar — las notificaciones WhatsApp están desactivadas'}
              </div>
            </div>
          </div>

          {/* Comisión de pedidos cuadrados */}
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Comisión de plataforma</h3>
                <p className="text-sm text-gray-500">Pago en casa y cuadrado con el vendedor</p>
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Porcentaje de comisión por defecto (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={settings.productOrderCommissionRate}
                onChange={(e) => set('productOrderCommissionRate', e.target.value)}
                className="input-field w-full"
                placeholder="10"
              />
              <p className="text-xs text-gray-400 mt-1">
                Estos pedidos quedan "En revisión" hasta que el vendedor paga la comisión con Wompi (o un admin la procesa manualmente) — recién ahí se comparten los datos de contacto.
                Este porcentaje se usa por defecto, pero se puede ajustar manualmente al procesar cada solicitud.
              </p>
            </div>
          </div>

          {/* Recargas de billetera */}
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center">
                <Wallet className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Recargas de billetera</h3>
                <p className="text-sm text-gray-500">Tasa de conversión y método Bre-B</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor de 1 moneda (COP)
                </label>
                <input
                  type="number"
                  min="1"
                  value={settings.walletCoinValueCop}
                  onChange={(e) => set('walletCoinValueCop', e.target.value)}
                  className="input-field w-full"
                  placeholder="3000"
                />
                <p className="text-xs text-gray-400 mt-1">Al aprobar una recarga se acreditan (monto pagado ÷ este valor) monedas.</p>
              </div>
              <div className="border-t border-gray-100 pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Llave Bre-B
                </label>
                <input
                  type="text"
                  value={settings.breBKey}
                  onChange={(e) => set('breBKey', e.target.value)}
                  className="input-field w-full"
                  placeholder="Ej: @tullave o número"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
                  <QrCode className="w-4 h-4" /> QR de Bre-B
                </label>
                <SingleImageUploader
                  value={settings.breBQrImageUrl}
                  onChange={(url) => set('breBQrImageUrl', url)}
                  hint="Imagen del código QR que verán los clientes al elegir Bre-B."
                />
              </div>
              <div className="border-t border-gray-100 pt-4">
                <Toggle
                  label="Wompi habilitado"
                  checked={settings.wompiEnabled}
                  onChange={(v) => set('wompiEnabled', v)}
                />
                <p className="text-xs text-gray-400 mt-1 mb-3">Actívalo cuando tengas la cuenta de Wompi aprobada.</p>
                {settings.wompiEnabled && (
                  <input
                    type="text"
                    value={settings.wompiPublicKey}
                    onChange={(e) => set('wompiPublicKey', e.target.value)}
                    className="input-field w-full"
                    placeholder="Llave pública de Wompi"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Zona de peligro */}
          <div className="card border border-red-100 bg-red-50/50">
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <h3 className="font-semibold text-gray-900">Zona de peligro</h3>
            </div>
            <p className="text-xs text-gray-500 mb-4">Estas acciones son irreversibles. Procede con precaución.</p>
            <button className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-colors">
              Reiniciar plataforma
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex items-center justify-between cursor-pointer">
      <span className="text-sm text-gray-700">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-accent' : 'bg-gray-200'}`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </label>
  );
}
