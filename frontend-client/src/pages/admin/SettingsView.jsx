import { useState } from 'react';
import { Settings as SettingsIcon, Mail, Shield, Bell, Globe, DollarSign, AlertTriangle } from 'lucide-react';

export default function SettingsView() {
  const [settings, setSettings] = useState({
    appName: 'ConImpulso',
    appUrl: 'http://localhost',
    contactEmail: 'contacto@conimpulso.com',
    supportEmail: 'soporte@conimpulso.com',
    currency: 'COP',
    timezone: 'America/Bogota',
    maintenanceMode: false,
    advisorMonetization: false,
    userVerification: true,
    twoFactor: false,
    welcomeEmail: true,
    orderNotifications: true,
  });

  const set = (key, value) => setSettings((prev) => ({ ...prev, [key]: value }));

  const handleSave = () => {
    console.log('Guardando configuración:', settings);
    alert('Configuración guardada (demo)');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
          <p className="text-gray-500">Configura los ajustes generales de la plataforma</p>
        </div>
        <button onClick={handleSave} className="btn-primary">Guardar cambios</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">

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
              <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                <Bell className="w-5 h-5 text-yellow-600" />
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
