import { useState, useEffect } from 'react';
import { User, Shield, Bell, Eye, Smartphone, Download, Upload, AlertTriangle } from 'lucide-react';
import api from '../../services/api';

const tabs = [
  { id: 'profile', label: 'Perfil', icon: User },
  { id: 'verification', label: 'Verificación', icon: Shield },
  { id: 'privacy', label: 'Privacidad', icon: Eye },
  { id: 'notifications', label: 'Notificaciones', icon: Bell },
  { id: 'security', label: 'Seguridad', icon: Smartphone },
  { id: 'data', label: 'Mis Datos', icon: Download },
];

export default function UserSettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [activity, setActivity] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [privacy, setPrivacy] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [verification, setVerification] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [profileRes, privacyRes, notifRes, sessionsRes] = await Promise.all([
        api.get('/user/settings'),
        api.get('/user/privacy'),
        api.get('/user/notifications/preferences'),
        api.get('/user/sessions'),
      ]);

      setUser(profileRes.data.data);
      setPrivacy(privacyRes.data.data);
      setNotifications(notifRes.data.data || []);
      setSessions(sessionsRes.data.data || []);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadActivity = async () => {
    try {
      const res = await api.get('/user/activity');
      setActivity(res.data.data || []);
    } catch (error) {
      console.error('Error loading activity:', error);
    }
  };

  const loadVerification = async () => {
    try {
      const res = await api.get('/user/verification-status');
      setVerification(res.data.data);
    } catch (error) {
      console.error('Error loading verification:', error);
    }
  };

  const handleUpdateProfile = async (data) => {
    try {
      await api.put('/user/settings', data);
      toast.success('Perfil actualizado');
      loadData();
    } catch (error) {
      toast.error('Error al actualizar perfil');
    }
  };

  const handleUpdatePrivacy = async (data) => {
    try {
      await api.put('/user/privacy', data);
      toast.success('Privacidad actualizada');
      loadData();
    } catch (error) {
      toast.error('Error al actualizar');
    }
  };

  const handleUpdateNotifications = async (prefs) => {
    try {
      await api.put('/user/notifications/preferences', { preferences: prefs });
      toast.success('Notificaciones actualizadas');
    } catch (error) {
      toast.error('Error al actualizar');
    }
  };

  const handleTerminateSession = async (sessionId) => {
    try {
      await api.delete(`/user/sessions/${sessionId}`);
      toast.success('Sesión terminada');
      loadData();
    } catch (error) {
      toast.error('Error al terminar sesión');
    }
  };

  const handleTerminateAllSessions = async () => {
    if (!confirm('¿Estás seguro de terminate todas las demás sesiones?')) return;
    try {
      await api.delete('/user/sessions');
      toast.success('Todas las sesiones han sido terminadas');
      loadData();
    } catch (error) {
      toast.error('Error al terminar sesiones');
    }
  };

  const handleExportData = async () => {
    try {
      const res = await api.get('/user/export');
      const blob = new Blob([JSON.stringify(res.data.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = res.data.filename;
      a.click();
      toast.success('Datos exportados');
    } catch (error) {
      toast.error('Error al exportar');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#4d3cbb] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pt-20 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-[#4d3cbb] mb-8">Configuración</h1>

        <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition ${
                activeTab === tab.id
                  ? 'bg-[#4d3cbb] text-black'
                  : 'bg-[#1A1A1A] text-gray-400 hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'profile' && (
          <ProfileTab user={user} onSave={handleUpdateProfile} />
        )}

        {activeTab === 'verification' && (
          <VerificationTab onLoad={loadVerification} verification={verification} />
        )}

        {activeTab === 'privacy' && (
          <PrivacyTab privacy={privacy} onSave={handleUpdatePrivacy} />
        )}

        {activeTab === 'notifications' && (
          <NotificationsTab preferences={notifications} onSave={handleUpdateNotifications} />
        )}

        {activeTab === 'security' && (
          <SecurityTab sessions={sessions} onTerminate={handleTerminateSession} onTerminateAll={handleTerminateAllSessions} />
        )}

        {activeTab === 'data' && (
          <DataTab onExport={handleExportData} />
        )}
      </div>
    </div>
  );
}

function ProfileTab({ user, onSave }) {
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    location: user?.location || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="bg-[#1A1A1A] rounded-xl p-6 border border-gray-800">
      <h2 className="text-xl font-semibold mb-6">Información del Perfil</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-400 mb-2">Nombre</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full bg-[#0A0A0A] border border-gray-700 rounded-lg px-4 py-2 text-white"
          />
        </div>
        <div>
          <label className="block text-gray-400 mb-2">Teléfono</label>
          <input
            type="text"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full bg-[#0A0A0A] border border-gray-700 rounded-lg px-4 py-2 text-white"
          />
        </div>
        <div>
          <label className="block text-gray-400 mb-2">Bio</label>
          <textarea
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            className="w-full bg-[#0A0A0A] border border-gray-700 rounded-lg px-4 py-2 text-white"
          />
        </div>
        <div>
          <label className="block text-gray-400 mb-2">Ubicación</label>
          <input
            type="text"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="w-full bg-[#0A0A0A] border border-gray-700 rounded-lg px-4 py-2 text-white"
          />
        </div>
        <button type="submit" className="px-6 py-2 bg-[#4d3cbb] text-black font-medium rounded-lg">
          Guardar Cambios
        </button>
      </form>
    </div>
  );
}

function VerificationTab({ onLoad, verification }) {
  useEffect(() => { onLoad(); }, []);

  if (!verification) {
    return (
      <div className="bg-[#1A1A1A] rounded-xl p-6 border border-gray-800">
        <h2 className="text-xl font-semibold mb-4">Verificación de Identidad</h2>
        <p className="text-gray-400 mb-6">Sube tus documentos para verificar tu identidad.</p>
        <form className="space-y-4">
          <select className="w-full bg-[#0A0A0A] border border-gray-700 rounded-lg px-4 py-2 text-white">
            <option value="cc">Cédula de Ciudadanía</option>
            <option value="ce">Cédula de Extranjería</option>
            <option value="nit">NIT</option>
            <option value="rut">RUT</option>
          </select>
          <input type="text" placeholder="Número de documento" className="w-full bg-[#0A0A0A] border border-gray-700 rounded-lg px-4 py-2 text-white" />
          <input type="file" className="w-full bg-[#0A0A0A] border border-gray-700 rounded-lg px-4 py-2 text-white" />
          <button type="button" className="px-6 py-2 bg-[#4d3cbb] text-black font-medium rounded-lg">
            Enviar Verificación
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-[#1A1A1A] rounded-xl p-6 border border-gray-800">
      <h2 className="text-xl font-semibold mb-4">Estado de Verificación</h2>
      <div className="flex items-center gap-4">
        <span className={`px-4 py-2 rounded-full text-sm font-medium ${
          verification.status === 'approved' ? 'bg-green-900 text-green-400' :
          verification.status === 'pending' ? 'bg-accent-900 text-accent-400' :
          'bg-red-900 text-red-400'
        }`}>
          {verification.status.toUpperCase()}
        </span>
        {verification.status === 'rejected' && verification.rejection_reason && (
          <p className="text-red-400">{verification.rejection_reason}</p>
        )}
      </div>
    </div>
  );
}

function PrivacyTab({ privacy, onSave }) {
  const [form, setForm] = useState(privacy || {
    show_email: false,
    show_phone: false,
    show_location: true,
    show_business_info: true,
    allow_messages_from_non_contacts: true,
    allow_search_indexing: false,
    show_profile_to: 'all',
    show_activity_status: true,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  const toggle = (field) => setForm({ ...form, [field]: !form[field] });

  return (
    <div className="bg-[#1A1A1A] rounded-xl p-6 border border-gray-800">
      <h2 className="text-xl font-semibold mb-6">Configuración de Privacidad</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center justify-between">
          <span>Mostrar email públicamente</span>
          <button type="button" onClick={() => toggle('show_email')} className={`w-12 h-6 rounded-full transition ${form.show_email ? 'bg-[#4d3cbb]' : 'bg-gray-600'}`}>
            <div className={`w-5 h-5 bg-white rounded-full transition ${form.show_email ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
          </button>
        </div>
        <div className="flex items-center justify-between">
          <span>Mostrar teléfono públicamente</span>
          <button type="button" onClick={() => toggle('show_phone')} className={`w-12 h-6 rounded-full transition ${form.show_phone ? 'bg-[#4d3cbb]' : 'bg-gray-600'}`}>
            <div className={`w-5 h-5 bg-white rounded-full transition ${form.show_phone ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
          </button>
        </div>
        <div className="flex items-center justify-between">
          <span>Permitir mensajes de no contactos</span>
          <button type="button" onClick={() => toggle('allow_messages_from_non_contacts')} className={`w-12 h-6 rounded-full transition ${form.allow_messages_from_non_contacts ? 'bg-[#4d3cbb]' : 'bg-gray-600'}`}>
            <div className={`w-5 h-5 bg-white rounded-full transition ${form.allow_messages_from_non_contacts ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
          </button>
        </div>
        <div className="flex items-center justify-between">
          <span>Permitir索引ación en buscadores</span>
          <button type="button" onClick={() => toggle('allow_search_indexing')} className={`w-12 h-6 rounded-full transition ${form.allow_search_indexing ? 'bg-[#4d3cbb]' : 'bg-gray-600'}`}>
            <div className={`w-5 h-5 bg-white rounded-full transition ${form.allow_search_indexing ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
          </button>
        </div>
        <div>
          <label className="block text-gray-400 mb-2">Mostrar perfil a</label>
          <select value={form.show_profile_to} onChange={(e) => setForm({ ...form, show_profile_to: e.target.value })} className="w-full bg-[#0A0A0A] border border-gray-700 rounded-lg px-4 py-2 text-white">
            <option value="all">Todos</option>
            <option value="contacts">Solo contactos</option>
            <option value="nobody">Nadie</option>
          </select>
        </div>
        <button type="submit" className="px-6 py-2 bg-[#4d3cbb] text-black font-medium rounded-lg">
          Guardar Cambios
        </button>
      </form>
    </div>
  );
}

function NotificationsTab({ preferences, onSave }) {
  const [prefs, setPrefs] = useState(preferences);

  const channels = ['email', 'push', 'in_app'];
  const types = ['leads', 'messages', 'orders', 'payments', 'security', 'products'];

  const toggle = (channel, type) => {
    const key = `${channel}_${type}`;
    setPrefs({ ...prefs, [key]: !prefs[key] });
  };

  const handleSave = () => {
    const formatted = types.flatMap(type =>
      channels.map(channel => ({
        channel,
        type,
        enabled: prefs[`${channel}_${type}`] ?? true,
      }))
    );
    onSave(formatted);
  };

  return (
    <div className="bg-[#1A1A1A] rounded-xl p-6 border border-gray-800">
      <h2 className="text-xl font-semibold mb-6">Preferencias de Notificación</h2>
      <div className="space-y-4">
        {types.map(type => (
          <div key={type} className="border-b border-gray-700 pb-4">
            <h3 className="text-white font-medium mb-2 capitalize">{type}</h3>
            <div className="flex gap-4">
              {channels.map(channel => (
                <label key={channel} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={prefs[`${channel}_${type}`] ?? true}
                    onChange={() => toggle(channel, type)}
                    className="w-4 h-4"
                  />
                  <span className="text-gray-400 capitalize">{channel}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button onClick={handleSave} className="mt-6 px-6 py-2 bg-[#4d3cbb] text-black font-medium rounded-lg">
        Guardar Cambios
      </button>
    </div>
  );
}

function SecurityTab({ sessions, onTerminate, onTerminateAll }) {
  return (
    <div className="space-y-6">
      <div className="bg-[#1A1A1A] rounded-xl p-6 border border-gray-800">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Sesiones Activas</h2>
          <button onClick={onTerminateAll} className="text-red-400 text-sm hover:underline">
            Terminar todas las demás
          </button>
        </div>
        <div className="space-y-4">
          {sessions.map(session => (
            <div key={session.id} className="flex items-center justify-between p-4 bg-[#0A0A0A] rounded-lg">
              <div className="flex items-center gap-4">
                <Smartphone className="w-8 h-8 text-gray-500" />
                <div>
                  <p className="text-white">{session.device_name || 'Dispositivo'}</p>
                  <p className="text-gray-500 text-sm">{session.ip_address} • {session.last_activity_at}</p>
                </div>
              </div>
              <button onClick={() => onTerminate(session.id)} className="text-red-400 text-sm hover:underline">
                Terminar
              </button>
            </div>
          ))}
          {sessions.length === 0 && (
            <p className="text-gray-500 text-center py-4">No hay sesiones activas</p>
          )}
        </div>
      </div>

      <div className="bg-[#1A1A1A] rounded-xl p-6 border border-gray-800">
        <h2 className="text-xl font-semibold mb-4">Cambiar Contraseña</h2>
        <form className="space-y-4">
          <input type="password" placeholder="Contraseña actual" className="w-full bg-[#0A0A0A] border border-gray-700 rounded-lg px-4 py-2 text-white" />
          <input type="password" placeholder="Nueva contraseña" className="w-full bg-[#0A0A0A] border border-gray-700 rounded-lg px-4 py-2 text-white" />
          <input type="password" placeholder="Confirmar nueva contraseña" className="w-full bg-[#0A0A0A] border border-gray-700 rounded-lg px-4 py-2 text-white" />
          <button type="button" className="px-6 py-2 bg-[#4d3cbb] text-black font-medium rounded-lg">
            Actualizar Contraseña
          </button>
        </form>
      </div>
    </div>
  );
}

function DataTab({ onExport }) {
  return (
    <div className="bg-[#1A1A1A] rounded-xl p-6 border border-gray-800">
      <h2 className="text-xl font-semibold mb-4">Exportar Mis Datos</h2>
      <p className="text-gray-400 mb-6">
        Descarga una copia de todos tus datos personales incluyendo perfil, actividad y configuraciones.
      </p>
      <button onClick={onExport} className="flex items-center gap-2 px-6 py-2 bg-[#4d3cbb] text-black font-medium rounded-lg">
        <Download className="w-5 h-5" />
        Exportar Datos (JSON)
      </button>

      <hr className="my-8 border-gray-700" />

      <h2 className="text-xl font-semibold mb-4">Importar Usuarios (Admin)</h2>
      <p className="text-gray-400 mb-6">Importa usuarios desde un archivo CSV.</p>
      <div className="flex items-center gap-4">
        <input type="file" accept=".csv" className="text-white" />
        <button type="button" className="flex items-center gap-2 px-4 py-2 bg-[#1A1A1A] border border-gray-700 rounded-lg text-white">
          <Upload className="w-4 h-4" />
          Importar CSV
        </button>
      </div>
    </div>
  );
}