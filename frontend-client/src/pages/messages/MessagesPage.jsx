import { useState, useEffect } from 'react';
import { MessageSquare, Send, Mail } from 'lucide-react';
import api from '../../services/api';

export default function MessagesPage() {
  const [activeTab, setActiveTab] = useState('inbox');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCompose, setShowCompose] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [composeData, setComposeData] = useState({ receiver_id: '', subject: '', body: '' });
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchMessages();
    fetchUsers();
  }, [activeTab]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const endpoint = activeTab === 'inbox' ? '/messages/inbox' : '/messages/sent';
      const response = await api.get(endpoint);
      setMessages(response.data.data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    try {
      await api.post('/messages', composeData);
      setShowCompose(false);
      setComposeData({ receiver_id: '', subject: '', body: '' });
      fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.post(`/messages/${id}/read`);
      fetchMessages();
    } catch (error) {
      console.error('Error marking as read:', error);
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
        <h1 className="text-2xl font-bold text-primary">Mensajes</h1>
        <button
          onClick={() => setShowCompose(!showCompose)}
          className="flex items-center gap-2 px-4 py-2 bg-accent text-primary font-semibold rounded-lg hover:bg-yellow-400 transition"
        >
          <Send className="w-5 h-5" />
          {showCompose ? 'Cancelar' : 'Nuevo Mensaje'}
        </button>
      </div>

      {showCompose && (
        <form onSubmit={handleSend} className="bg-white rounded-xl p-6 mb-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-primary mb-4">Nuevo Mensaje</h3>
          <select
            required
            value={composeData.receiver_id}
            onChange={(e) => setComposeData({ ...composeData, receiver_id: e.target.value })}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-primary mb-4 focus:border-accent focus:outline-none"
          >
            <option value="">Seleccionar destinatario...</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Asunto"
            value={composeData.subject}
            onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-primary mb-4 placeholder-gray-400 focus:border-accent focus:outline-none"
          />
          <textarea
            placeholder="Mensaje..."
            required
            rows="5"
            value={composeData.body}
            onChange={(e) => setComposeData({ ...composeData, body: e.target.value })}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-primary mb-4 placeholder-gray-400 focus:border-accent focus:outline-none"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-accent text-primary font-semibold rounded-lg hover:bg-yellow-400 transition"
          >
            Enviar
          </button>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full"></div>
        </div>
      ) : messages.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-primary mb-2">
            {activeTab === 'inbox' ? 'No hay mensajes en tu bandeja de entrada' : 'No has enviado mensajes aún'}
          </h2>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            {activeTab === 'inbox'
              ? 'Cuando recibas mensajes de otros usuarios, aparecerán aquí.'
              : 'Los mensajes que envíes aparecerán en esta sección.'}
          </p>
          {!showCompose && (
            <button
              onClick={() => setShowCompose(true)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-accent text-primary font-semibold rounded-lg hover:bg-yellow-400 transition mx-auto"
            >
              <Mail className="w-5 h-5" />
              Enviar tu primer mensaje
            </button>
          )}
        </div>
      ) : (
        /* Messages List */
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex gap-2 p-4 bg-gray-50 border-b border-gray-200">
            <button
              onClick={() => { setActiveTab('inbox'); setSelectedMessage(null); }}
              className={`px-4 py-2 rounded-lg ${activeTab === 'inbox' ? 'bg-accent text-primary font-semibold' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
            >
              Bandeja de Entrada
            </button>
            <button
              onClick={() => { setActiveTab('sent'); setSelectedMessage(null); }}
              className={`px-4 py-2 rounded-lg ${activeTab === 'sent' ? 'bg-accent text-primary font-semibold' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
            >
              Enviados
            </button>
          </div>

          <div className="divide-y divide-gray-100">
            {messages.map((msg) => (
              <div
                key={msg.id}
                onClick={() => handleMessageClick(msg)}
                className={`p-4 cursor-pointer hover:bg-gray-50 ${!msg.is_read && activeTab === 'inbox' ? 'border-l-4 border-accent' : ''}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-primary">
                    {activeTab === 'inbox' ? msg.sender?.name || 'Usuario' : msg.receiver?.name || 'Usuario'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(msg.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-sm text-gray-500 truncate">{msg.subject || '(Sin asunto)'}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}