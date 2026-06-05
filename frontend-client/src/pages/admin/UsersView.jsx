import { useState, useEffect } from 'react';
import { Search, Plus, Pencil, Trash2, Eye, Filter } from 'lucide-react';
import api from '../../services/api';

export default function UsersView() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      // This would normally fetch from API
      // For now, set sample data
      setUsers([
        { id: 1, name: 'Super Admin', email: 'admin@nexuslab.com', roles: ['super_admin'], status: 'active' },
        { id: 2, name: 'Juan Pérez', email: 'juan@test.com', roles: ['vendor'], status: 'active' },
        { id: 3, name: 'María García', email: 'maria@test.com', roles: ['client'], status: 'active' },
        { id: 4, name: 'Carlos López', email: 'carlos@test.com', roles: ['advisor'], status: 'active' },
      ]);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (roles) => {
    if (roles.includes('super_admin')) return 'bg-red-100 text-red-700';
    if (roles.includes('vendor')) return 'bg-green-100 text-green-700';
    if (roles.includes('advisor')) return 'bg-blue-100 text-blue-700';
    return 'bg-gray-100 text-gray-700';
  };

  const getRoleLabel = (roles) => {
    if (roles.includes('super_admin')) return 'Super Admin';
    if (roles.includes('vendor')) return 'Vendedor';
    if (roles.includes('advisor')) return 'Asesor';
    if (roles.includes('client')) return 'Cliente';
    return 'Usuario';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
          <p className="text-gray-500">Gestiona los usuarios de la plataforma</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Nuevo Usuario
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar usuarios..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10 w-full"
          />
        </div>
        <button className="btn-outline flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Filtros
        </button>
      </div>

      {/* Users Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b border-gray-100">
                <th className="pb-3 font-medium">Nombre</th>
                <th className="pb-3 font-medium">Email</th>
                <th className="pb-3 font-medium">Rol</th>
                <th className="pb-3 font-medium">Estado</th>
                <th className="pb-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((user) => (
                <tr key={user.id} className="text-sm">
                  <td className="py-3 font-medium text-gray-900">{user.name}</td>
                  <td className="py-3 text-gray-500">{user.email}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.roles)}`}>
                      {getRoleLabel(user.roles)}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      <button className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg" title="Ver">
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
                      <button className="p-1.5 bg-blue-100 hover:bg-blue-200 rounded-lg" title="Editar">
                        <Pencil className="w-4 h-4 text-blue-600" />
                      </button>
                      <button className="p-1.5 bg-red-100 hover:bg-red-200 rounded-lg" title="Eliminar">
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}