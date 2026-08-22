import { useState, useEffect } from 'react';
import { MessageSquare, Search, X, Mail, Send } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function MessagesView() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  // Compose state
  const [showCompose, setShowCompose] = useState(false);
  const [composeData, setComposeData] = useState({ receiver_id: '', subject: '', body: '' });
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [showUserList, setShowUserList] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async (q = '') => {
    try {
      setLoading(true);
      const res = await api.get('/admin/messages', { params: q ? { search: q } : {} });
      setMessages(res.data.data || []);
    } catch {
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const v = e.target.value;
    setSearch(v);
    fetchMessages(v);
  };

  const fetchAvailableUsers = async (q = '') => {
    try {
      const res = await api.get('/auth/users/available', { params: q ? { search: q } : {} });
      setAvailableUsers(res.data.data || []);
    } catch {
      setAvailableUsers([]);
    }
  };

  const openCompose = () => {
    setComposeData({ receiver_id: '', subject: '', body: '' });
    setSelectedRecipient(null);
    setUserSearch('');
    setShowUserList(false);
    fetchAvailableUsers('');
    setShowCompose(true);
  };

  const handleSelectRecipient = (user) => {
    setSelectedRecipient(user);
    setComposeData((d) => ({ ...d, receiver_id: user.id }));
    setShowUserList(false);
    setUserSearch('');
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!composeData.receiver_id) { toast.error('Selecciona un destinatario'); return; }
    if (!composeData.body.trim()) { toast.error('Escribe un mensaje'); return; }
    if (sending) return;
    setSending(true);
    try {
      await api.post('/messages', composeData);
      toast.success('Mensaje enviado');
      setShowCompose(false);
      fetchMessages(search);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al enviar');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mensajes</h1>
          <p className="text-gray-500">Todos los mensajes del sistema</p>
        </div>
        <button
          onClick={openCompose}
          className="flex items-center gap-2 px-4 py-2 bg-accent text-white font-semibold rounded-lg hover:bg-accent-400 transition"
        >
          <Send className="w-4 h-4" />
          Nuevo mensaje
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por asunto o contenido..."
          value={search}
          onChange={handleSearch}
          className="input-field pl-10 w-full"
        />
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-16">
            <MessageSquare className="w-10 h-10 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No hay mensajes</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr className="text-left text-gray-500 text-xs font-medium uppercase tracking-wide">
                <th className="px-4 py-3">De</th>
                <th className="px-4 py-3">Para</th>
                <th className="px-4 py-3">Asunto / Mensaje</th>
                <th className="px-4 py-3">Leído</th>
                <th className="px-4 py-3">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {messages.map((msg) => (
                <tr key={msg.id} onClick={() => setSelected(msg)} className="hover:bg-gray-50 cursor-pointer">
                  <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                    {msg.sender?.name || '—'}
                    <p className="text-xs text-gray-400 font-normal">{msg.sender?.email}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                    {msg.receiver?.name || '—'}
                    <p className="text-xs text-gray-400">{msg.receiver?.email}</p>
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    {msg.subject && <p className="font-medium text-gray-800 truncate">{msg.subject}</p>}
                    <p className="text-gray-500 truncate">{msg.body}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      msg.is_read ? 'bg-green-100 text-green-700' : 'bg-accent-100 text-accent-700'
                    }`}>
                      {msg.is_read ? 'Leído' : 'No leído'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 whitespace-nowrap text-xs">
                    {new Date(msg.created_at).toLocaleString('es-CO', {
                      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 pr-4">{selected.subject || '(sin asunto)'}</h3>
              <button onClick={() => setSelected(null)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-4 pb-4 border-b border-gray-100 space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="font-medium">De:</span>
                {selected.sender?.name} ({selected.sender?.email})
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 ml-6">
                <span className="font-medium">Para:</span>
                {selected.receiver?.name} ({selected.receiver?.email})
              </div>
              <p className="text-xs text-gray-400 ml-6">
                {new Date(selected.created_at).toLocaleString('es-CO')}
              </p>
            </div>
            <p className="text-gray-700 whitespace-pre-wrap text-sm">{selected.body}</p>
          </div>
        </div>
      )}

      {/* Compose modal */}
      {showCompose && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Nuevo Mensaje</h3>
              <button onClick={() => setShowCompose(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSend} className="space-y-4">
              {/* Recipient */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Para</label>
                {selectedRecipient ? (
                  <div className="flex items-center gap-2 px-3 py-2 bg-accent/10 border border-accent/30 rounded-lg">
                    <div className="w-7 h-7 bg-gradient-to-br from-accent-400 to-accent-600 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                      {selectedRecipient.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{selectedRecipient.name}</p>
                      <p className="text-xs text-gray-500 truncate">{selectedRecipient.email}</p>
                    </div>
                    <button type="button" onClick={() => { setSelectedRecipient(null); setComposeData((d) => ({ ...d, receiver_id: '' })); }} className="p-1 hover:bg-accent/20 rounded-full">
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar usuario..."
                      value={userSearch}
                      onChange={(e) => { setUserSearch(e.target.value); setShowUserList(true); fetchAvailableUsers(e.target.value); }}
                      onFocus={() => { setShowUserList(true); if (!userSearch) fetchAvailableUsers(''); }}
                      className="input-field pl-10 w-full"
                      autoComplete="off"
                    />
                    {showUserList && (
                      <div className="absolute z-10 w-full mt-1 max-h-48 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg">
                        {availableUsers.length > 0 ? availableUsers.map((u) => (
                          <button key={u.id} type="button"
                            onMouseDown={(e) => { e.preventDefault(); handleSelectRecipient(u); }}
                            className="w-full px-3 py-2.5 text-left flex items-center gap-2 hover:bg-gray-50 border-b border-gray-50 last:border-0"
                          >
                            <div className="w-7 h-7 bg-gradient-to-br from-accent-400 to-accent-600 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{u.name}</p>
                              <p className="text-xs text-gray-500 truncate">{u.email}</p>
                            </div>
                          </button>
                        )) : (
                          <p className="px-3 py-3 text-xs text-gray-500 text-center">
                            {userSearch ? 'Sin resultados' : 'Cargando...'}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Asunto</label>
                <input
                  type="text"
                  value={composeData.subject}
                  onChange={(e) => setComposeData((d) => ({ ...d, subject: e.target.value }))}
                  className="input-field w-full"
                  maxLength={255}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mensaje</label>
                <textarea
                  value={composeData.body}
                  onChange={(e) => setComposeData((d) => ({ ...d, body: e.target.value }))}
                  rows={5}
                  className="input-field w-full"
                  required
                />
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setShowCompose(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                  Cancelar
                </button>
                <button type="submit" disabled={sending}
                  className="flex-1 px-4 py-2 bg-accent text-white font-semibold rounded-lg hover:bg-accent-400 disabled:opacity-60 disabled:cursor-not-allowed">
                  {sending ? 'Enviando...' : 'Enviar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
