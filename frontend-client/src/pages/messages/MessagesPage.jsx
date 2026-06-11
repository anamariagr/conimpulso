import { useState, useEffect } from 'react';
import { MessageSquare, Send, Mail, AlertCircle, X, Search, CheckCircle, Inbox } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function MessagesPage() {
  const [activeTab, setActiveTab] = useState('inbox');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCompose, setShowCompose] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [composeData, setComposeData] = useState({ receiver_id: '', subject: '', body: '' });
  const [availableUsers, setAvailableUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [myMessagingEnabled, setMyMessagingEnabled] = useState(true);
  const [myDisabledReason, setMyDisabledReason] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchMessages();
    fetchMyInfo();
    // eslint-disable-next-line react-hooks/exhaust-deps
  }, [activeTab]);

  const fetchMyInfo = async () => {
    try {
      const res = await api.get('/auth/me', { headers: { Accept: 'application/json' } });
      const user = res.data.data?.user || res.data.data;
      setMyMessagingEnabled(user?.messaging_enabled !== false);
      setMyDisabledReason(user?.messaging_disabled_reason || null);
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const endpoint = activeTab === 'inbox' ? '/messages/inbox' : '/messages/sent';
      const [messagesRes, unreadRes] = await Promise.allSettled([
        api.get(endpoint, { headers: { Accept: 'application/json' } }),
        activeTab === 'inbox'
          ? api.get('/messages/unread-count', { headers: { Accept: 'application/json' } })
          : Promise.resolve({ status: 'rejected' }),
      ]);

      if (messagesRes.status === 'fulfilled') {
        setMessages(messagesRes.value.data.data || []);
      } else {
        setMessages([]);
      }

      if (unreadRes.status === 'fulfilled') {
        setUnreadCount(unreadRes.value.data.data?.unread_count || 0);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableUsers = async (search = '') => {
    try {
      const res = await api.get('/auth/users/available', {
        params: search ? { search } : {},
        headers: { Accept: 'application/json' },
      });
      setAvailableUsers(res.data.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setAvailableUsers([]);
    }
  };

  const openCompose = () => {
    if (!myMessagingEnabled) {
      toast.error('Tu mensajería está deshabilitada. Contacta al administrador.');
      return;
    }
    setShowCompose(true);
    fetchAvailableUsers(userSearch);
  };

  const handleSearchUsers = (e) => {
    const v = e.target.value;
    setUserSearch(v);
    fetchAvailableUsers(v);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!composeData.receiver_id) {
      toast.error('Selecciona un destinatario');
      return;
    }
    try {
      const res = await api.post('/messages', composeData, {
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      });
      if (res.data.success) {
        toast.success('Mensaje enviado');
        setShowCompose(false);
        setComposeData({ receiver_id: '', subject: '', body: '' });
        setActiveTab('sent');
        fetchMessages();
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Error al enviar mensaje';
      toast.error(msg);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.post(`/messages/${id}/read`, {}, { headers: { Accept: 'application/json' } });
      fetchMessages();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllRead = async () => {
    try {
      await api.post('/messages/read-all', {}, { headers: { Accept: 'application/json' } });
      toast.success('Todos los mensajes marcados como leídos');
      fetchMessages();
    } catch (error) {
      toast.error('Error al marcar mensajes');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este mensaje?')) return;
    try {
      await api.delete(`/messages/${id}`, { headers: { Accept: 'application/json' } });
      toast.success('Mensaje eliminado');
      setSelectedMessage(null);
      fetchMessages();
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  const handleMessageClick = (message) => {
    setSelectedMessage(message);
    if (!message.is_read && activeTab === 'inbox') {
      markAsRead(message.id);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">Mensajes</h1>
          <p className="text-gray-500">Sistema de comunicación protegido</p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'inbox' && unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Marcar todo leído
            </button>
          )}
          <button
            onClick={openCompose}
            disabled={!myMessagingEnabled}
            className="flex items-center gap-2 px-4 py-2 bg-accent text-primary font-semibold rounded-lg hover:bg-yellow-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
            title={!myMessagingEnabled ? 'Tu mensajería está deshabilitada' : ''}
          >
            <Send className="w-5 h-5" />
            Nuevo Mensaje
          </button>
        </div>
      </div>

      {/* Disabled Warning */}
      {!myMessagingEnabled && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-red-800">
            <p className="font-semibold">Tu mensajería está deshabilitada</p>
            <p className="mt-1">
              {myDisabledReason
                ? `Motivo: ${myDisabledReason}`
                : 'Contacta al administrador para rehabilitar tu cuenta.'}
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('inbox')}
          className={`px-4 py-2 font-medium flex items-center gap-2 border-b-2 ${
            activeTab === 'inbox'
              ? 'border-accent text-primary'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Inbox className="w-4 h-4" />
          Recibidos
          {unreadCount > 0 && (
            <span className="bg-accent text-primary text-xs font-bold rounded-full px-2 py-0.5">
              {unreadCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('sent')}
          className={`px-4 py-2 font-medium flex items-center gap-2 border-b-2 ${
            activeTab === 'sent'
              ? 'border-accent text-primary'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Send className="w-4 h-4" />
          Enviados
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : messages.length === 0 ? (
        <div className="card text-center py-12">
          <MessageSquare className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">
            {activeTab === 'inbox' ? 'No tienes mensajes recibidos' : 'No has enviado mensajes aún'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {messages.map((message) => (
            <div
              key={message.id}
              onClick={() => handleMessageClick(message)}
              className={`card cursor-pointer hover:shadow-md transition ${
                !message.is_read && activeTab === 'inbox' ? 'border-l-4 border-l-accent' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                    {(message.sender?.name || message.receiver?.name || '?').charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900 truncate">
                        {activeTab === 'inbox'
                          ? message.sender?.name || 'Remitente desconocido'
                          : message.receiver?.name || 'Destinatario desconocido'}
                      </p>
                      {!message.is_read && activeTab === 'inbox' && (
                        <span className="w-2 h-2 bg-accent rounded-full flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {message.subject ? <strong>{message.subject}</strong> : '(sin asunto)'} — {message.body}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-3">
                  <p className="text-xs text-gray-500">
                    {new Date(message.created_at).toLocaleDateString('es-CL', {
                      day: '2-digit', month: 'short',
                    })}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(message.created_at).toLocaleTimeString('es-CL', {
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Compose Modal */}
      {showCompose && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Nuevo Mensaje</h3>
              <button onClick={() => setShowCompose(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSend} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Para</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar usuario por nombre o email..."
                    value={userSearch}
                    onChange={handleSearchUsers}
                    className="input-field pl-10 w-full"
                  />
                </div>
                {availableUsers.length > 0 ? (
                  <div className="mt-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
                    {availableUsers.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => setComposeData({ ...composeData, receiver_id: user.id })}
                        className={`w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-gray-50 ${
                          composeData.receiver_id === user.id ? 'bg-accent/10' : ''
                        }`}
                      >
                        <div className="w-7 h-7 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-xs text-gray-500">
                    {userSearch ? 'Sin resultados' : 'Cargando usuarios disponibles...'}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Asunto</label>
                <input
                  type="text"
                  value={composeData.subject}
                  onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })}
                  className="input-field w-full"
                  maxLength={255}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mensaje</label>
                <textarea
                  value={composeData.body}
                  onChange={(e) => setComposeData({ ...composeData, body: e.target.value })}
                  rows={6}
                  className="input-field w-full"
                  required
                  maxLength={10000}
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCompose(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button type="submit" className="flex-1 px-4 py-2 bg-accent text-primary font-semibold rounded-lg hover:bg-yellow-400">
                  Enviar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Message Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 truncate">
                {selectedMessage.subject || '(sin asunto)'}
              </h3>
              <button onClick={() => setSelectedMessage(null)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-4 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="font-semibold text-gray-900">
                  {activeTab === 'inbox'
                    ? selectedMessage.sender?.name
                    : selectedMessage.receiver?.name}
                </span>
                <span className="text-gray-500">({selectedMessage.sender?.email || selectedMessage.receiver?.email})</span>
              </div>
              <p className="text-xs text-gray-500 mt-1 ml-6">
                {new Date(selectedMessage.created_at).toLocaleString('es-CL')}
              </p>
            </div>
            <div className="text-gray-700 whitespace-pre-wrap mb-4">
              {selectedMessage.body}
            </div>
            {activeTab === 'sent' && (
              <div className="flex justify-end">
                <button
                  onClick={() => handleDelete(selectedMessage.id)}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Eliminar mensaje
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
