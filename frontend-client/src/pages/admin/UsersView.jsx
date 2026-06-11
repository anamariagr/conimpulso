import { useState, useEffect } from 'react';
import { Search, Plus, Pencil, Trash2, Eye, Filter, MessageSquare, MessageSquareOff, Shield, X, AlertTriangle, CheckCircle } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function UsersView() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [messagingFilter, setMessagingFilter] = useState('');
  const [meta, setMeta] = useState({ total: 0, current_page: 1, last_page: 1 });
  const [stats, setStats] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null); // 'view' | 'disable'
  const [disableReason, setDisableReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const loadUsers = async (page = 1) => {
    try {
      setLoading(true);
      const params = { page, per_page: 25 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (messagingFilter) params.messaging_enabled = messagingFilter;

      const [usersRes, statsRes] = await Promise.allSettled([
        api.get('/admin/users', { params, headers: { Accept: 'application/json' } }),
        api.get('/admin/users/messaging-stats', { headers: { Accept: 'application/json' } }),
      ]);

      if (usersRes.status === 'fulfilled') {
        setUsers(usersRes.value.data.data || []);
        setMeta(usersRes.value.data.meta || { total: 0, current_page: 1, last_page: 1 });
      } else {
        toast.error('Error al cargar usuarios');
      }

      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value.data.data);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const res = await api.get('/admin/users/messaging-stats', { headers: { Accept: 'application/json' } });
      setStats(res.data.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaust-deps
  }, [statusFilter, messagingFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadUsers();
  };

  const openDisableModal = (user) => {
    setSelectedUser(user);
    setModalType('disable');
    setDisableReason('');
    setShowModal(true);
  };

  const openViewModal = async (user) => {
    setModalType('view');
    setShowModal(true);
    try {
      const res = await api.get(`/admin/users/${user.id}`, { headers: { Accept: 'application/json' } });
      setSelectedUser(res.data.data);
    } catch (error) {
      setSelectedUser(user);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setModalType(null);
    setDisableReason('');
  };

  const handleToggleMessaging = async (user) => {
    const newState = !user.messaging_enabled;
    const action = newState ? 'enable-messaging' : 'disable-messaging';
    const body = newState ? {} : { reason: 'Deshabilitado por administrador' };

    if (!newState && !confirm(`¿Deshabilitar la mensajería de ${user.name}?`)) return;

    try {
      setActionLoading(true);
      const res = await api.post(`/admin/users/${user.id}/${action}`, body, {
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      });
      if (res.data.success) {
        toast.success(newState ? 'Mensajería habilitada' : 'Mensajería deshabilitada');
        loadUsers(meta.current_page);
        loadStats();
      }
    } catch (error) {
      toast.error('Error al cambiar estado de mensajería');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDisableWithReason = async () => {
    if (!selectedUser) return;
    try {
      setActionLoading(true);
      const res = await api.post(
        `/admin/users/${selectedUser.id}/disable-messaging`,
        { reason: disableReason || 'Deshabilitado por administrador' },
        { headers: { Accept: 'application/json', 'Content-Type': 'application/json' } }
      );
      if (res.data.success) {
        toast.success('Mensajería deshabilitada con motivo');
        closeModal();
        loadUsers(meta.current_page);
        loadStats();
      }
    } catch (error) {
      toast.error('Error al deshabilitar mensajería');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusChange = async (user, newStatus) => {
    try {
      setActionLoading(true);
      const res = await api.put(`/admin/users/${user.id}`, { status: newStatus }, {
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      });
      if (res.data.success) {
        toast.success(`Estado actualizado a ${newStatus}`);
        loadUsers(meta.current_page);
      }
    } catch (error) {
      toast.error('Error al cambiar estado');
    } finally {
      setActionLoading(false);
    }
  };

  const getRoleBadgeColor = (roles) => {
    if (!roles || roles.length === 0) return 'bg-gray-100 text-gray-600';
    if (roles.includes('super_admin')) return 'bg-red-100 text-red-700';
    if (roles.includes('admin')) return 'bg-orange-100 text-orange-700';
    if (roles.includes('vendor')) return 'bg-green-100 text-green-700';
    if (roles.includes('advisor')) return 'bg-blue-100 text-blue-700';
    if (roles.includes('moderator')) return 'bg-purple-100 text-purple-700';
    return 'bg-gray-100 text-gray-600';
  };

  const getRoleLabel = (roles) => {
    if (!roles || roles.length === 0) return 'Sin rol';
    if (roles.includes('super_admin')) return 'Super Admin';
    if (roles.includes('admin')) return 'Admin';
    if (roles.includes('vendor')) return 'Vendedor';
    if (roles.includes('advisor')) return 'Asesor';
    if (roles.includes('moderator')) return 'Moderador';
    if (roles.includes('client')) return 'Cliente';
    return roles[0];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
          <p className="text-gray-500">Gestiona los usuarios y sus permisos de mensajería</p>
        </div>
      </div>

      {/* Messaging Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Usuarios</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total_users || 0}</p>
              </div>
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Mensajería Activa</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{stats.messaging_enabled || 0}</p>
              </div>
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Mensajería Bloqueada</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{stats.messaging_disabled || 0}</p>
              </div>
              <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                <MessageSquareOff className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Activos y Habilitados</p>
                <p className="text-2xl font-bold text-accent mt-1">{stats.active_and_enabled || 0}</p>
              </div>
              <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-accent" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10 w-full"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field"
        >
          <option value="">Todos los estados</option>
          <option value="active">Activo</option>
          <option value="inactive">Inactivo</option>
          <option value="suspended">Suspendido</option>
          <option value="pending">Pendiente</option>
        </select>
        <select
          value={messagingFilter}
          onChange={(e) => setMessagingFilter(e.target.value)}
          className="input-field"
        >
          <option value="">Toda mensajería</option>
          <option value="true">Habilitada</option>
          <option value="false">Deshabilitada</option>
        </select>
        <button type="submit" className="btn-primary flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Filtrar
        </button>
      </form>

      {/* Users Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b border-gray-100">
                <th className="pb-3 font-medium">Usuario</th>
                <th className="pb-3 font-medium">Rol</th>
                <th className="pb-3 font-medium">Estado</th>
                <th className="pb-3 font-medium">Mensajería</th>
                <th className="pb-3 font-medium">Registro</th>
                <th className="pb-3 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-gray-500">
                    <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-gray-500">
                    No se encontraron usuarios
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="text-sm hover:bg-gray-50">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                          {user.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate">{user.name}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.roles)}`}>
                        {getRoleLabel(user.roles)}
                      </span>
                    </td>
                    <td className="py-3">
                      <select
                        value={user.status}
                        onChange={(e) => handleStatusChange(user, e.target.value)}
                        disabled={actionLoading || user.roles?.includes('super_admin')}
                        className={`px-2 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${
                          user.status === 'active' ? 'bg-green-100 text-green-700' :
                          user.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          user.status === 'suspended' ? 'bg-orange-100 text-orange-700' :
                          'bg-gray-100 text-gray-600'
                        }`}
                      >
                        <option value="active">Activo</option>
                        <option value="inactive">Inactivo</option>
                        <option value="suspended">Suspendido</option>
                        <option value="pending">Pendiente</option>
                      </select>
                    </td>
                    <td className="py-3">
                      {user.messaging_enabled ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          <MessageSquare className="w-3 h-3" />
                          Activa
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700" title={user.messaging_disabled_reason || ''}>
                          <MessageSquareOff className="w-3 h-3" />
                          Bloqueada
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-xs text-gray-500">
                      {new Date(user.created_at).toLocaleDateString('es-CL', {
                        day: '2-digit', month: 'short', year: 'numeric',
                      })}
                    </td>
                    <td className="py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => openViewModal(user)}
                          className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4 text-gray-600" />
                        </button>
                        {user.messaging_enabled ? (
                          <button
                            onClick={() => openDisableModal(user)}
                            disabled={actionLoading}
                            className="p-1.5 bg-red-100 hover:bg-red-200 rounded-lg transition-colors disabled:opacity-50"
                            title="Deshabilitar mensajería"
                          >
                            <MessageSquareOff className="w-4 h-4 text-red-600" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggleMessaging(user)}
                            disabled={actionLoading}
                            className="p-1.5 bg-green-100 hover:bg-green-200 rounded-lg transition-colors disabled:opacity-50"
                            title="Habilitar mensajería"
                          >
                            <MessageSquare className="w-4 h-4 text-green-600" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta.last_page > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Mostrando {users.length} de {meta.total} usuarios
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => loadUsers(meta.current_page - 1)}
                disabled={meta.current_page <= 1}
                className="px-3 py-1 border border-gray-200 rounded text-sm disabled:opacity-50 hover:bg-gray-50"
              >
                Anterior
              </button>
              <span className="px-3 py-1 text-sm">
                Página {meta.current_page} de {meta.last_page}
              </span>
              <button
                onClick={() => loadUsers(meta.current_page + 1)}
                disabled={meta.current_page >= meta.last_page}
                className="px-3 py-1 border border-gray-200 rounded text-sm disabled:opacity-50 hover:bg-gray-50"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                {modalType === 'disable' ? 'Deshabilitar Mensajería' : 'Detalles del Usuario'}
              </h3>
              <button onClick={closeModal} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalType === 'view' && (
              <div className="space-y-3">
                <div className="flex items-center gap-3 pb-3 border-b">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {selectedUser.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{selectedUser.name}</p>
                    <p className="text-sm text-gray-500">{selectedUser.email}</p>
                  </div>
                </div>
                <DetailRow label="ID" value={`#${selectedUser.id}`} />
                <DetailRow label="Rol" value={getRoleLabel(selectedUser.roles)} />
                <DetailRow label="Estado" value={selectedUser.status} />
                <DetailRow label="Email verificado" value={selectedUser.email_verified_at ? 'Sí' : 'No'} />
                <DetailRow label="Mensajería" value={selectedUser.messaging_enabled ? 'Habilitada' : 'Deshabilitada'} />
                {selectedUser.messaging_disabled_reason && (
                  <DetailRow label="Motivo" value={selectedUser.messaging_disabled_reason} />
                )}
                {selectedUser.messaging_disabled_at && (
                  <DetailRow label="Fecha bloqueo" value={new Date(selectedUser.messaging_disabled_at).toLocaleString('es-CL')} />
                )}
                <DetailRow label="Registrado" value={new Date(selectedUser.created_at).toLocaleString('es-CL')} />
              </div>
            )}

            {modalType === 'disable' && (
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-yellow-800">
                    Vas a deshabilitar la mensajería de <strong>{selectedUser.name}</strong>. El usuario no podrá enviar ni recibir mensajes hasta que sea rehabilitado.
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Motivo (opcional)
                  </label>
                  <textarea
                    value={disableReason}
                    onChange={(e) => setDisableReason(e.target.value)}
                    rows={3}
                    placeholder="Ej: Reportes de spam, comportamiento inadecuado..."
                    className="input-field w-full"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={closeModal}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDisableWithReason}
                    disabled={actionLoading}
                    className="flex-1 px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 disabled:opacity-50"
                  >
                    {actionLoading ? 'Procesando...' : 'Deshabilitar'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-500">{label}:</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  );
}
