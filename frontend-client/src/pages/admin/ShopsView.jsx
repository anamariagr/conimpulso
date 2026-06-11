import { useState, useEffect, useRef } from 'react';
import { Search, Plus, Filter, MoreVertical, Check, X, Star, Shield, Edit2 } from 'lucide-react';
import api from '../../services/api';

const STATUS_COLORS = {
  active: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  suspended: 'bg-red-100 text-red-700',
  rejected: 'bg-red-100 text-red-700',
  draft: 'bg-gray-100 text-gray-700',
  inactive: 'bg-gray-100 text-gray-600',
};

const STATUS_LABELS = {
  active: 'Activa',
  pending: 'Pendiente',
  suspended: 'Suspendida',
  rejected: 'Rechazada',
  draft: 'Borrador',
  inactive: 'Inactiva',
};

const MOCK_SHOPS = [
  { id: 1, name: 'Cervecería Norteña', user: { name: 'Juan Pérez' }, city: 'Bogotá', status: 'active', is_verified: true, is_featured: true, products_count: 24 },
  { id: 2, name: 'Cuero y Craft', user: { name: 'María García' }, city: 'Medellín', status: 'pending', is_verified: false, is_featured: false, products_count: 18 },
];

// ---- User search component used in modals ----
function UserSearch({ value, onChange }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef(null);

  const search = async (q) => {
    if (!q.trim()) { setResults([]); return; }
    setSearching(true);
    try {
      const res = await api.get('/admin/wallet/users', { params: { search: q } });
      setResults(res.data.data || []);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleChange = (e) => {
    const q = e.target.value;
    setQuery(q);
    setOpen(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(q), 300);
  };

  const select = (user) => {
    onChange(user);
    setQuery(`${user.name} (${user.email})`);
    setOpen(false);
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={value ? `${value.name} (${value.email})` : query}
        onChange={value ? undefined : handleChange}
        onFocus={() => !value && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        readOnly={!!value}
        placeholder="Buscar usuario por nombre o email..."
        className="input-field w-full"
      />
      {value && (
        <button
          type="button"
          onClick={() => { onChange(null); setQuery(''); }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>
      )}
      {open && !value && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
          {searching && <div className="px-4 py-2 text-sm text-gray-500">Buscando...</div>}
          {!searching && results.length === 0 && query && (
            <div className="px-4 py-2 text-sm text-gray-500">Sin resultados</div>
          )}
          {results.map((u) => (
            <button
              key={u.id}
              type="button"
              onMouseDown={() => select(u)}
              className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
            >
              <span className="font-medium">{u.name}</span>
              <span className="text-gray-400 ml-2">{u.email}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ---- Create modal ----
function CreateModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    name: '',
    description: '',
    city: '',
    phone: '',
    email: '',
    status: 'active',
    is_featured: false,
    is_verified: false,
  });
  const [owner, setOwner] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('El nombre es requerido'); return; }
    if (!owner) { setError('Debes seleccionar un propietario'); return; }
    setSaving(true);
    setError('');
    try {
      const res = await api.post('/admin/shops', { ...form, user_id: owner.id });
      onCreated(res.data.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear la tienda');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white">
          <h2 className="text-lg font-bold text-gray-900">Nueva tienda</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Propietario <span className="text-red-500">*</span>
            </label>
            <UserSearch value={owner} onChange={setOwner} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              className="input-field w-full"
              placeholder="Nombre de la tienda"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              className="input-field w-full"
              rows={2}
              placeholder="Descripción de la tienda"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => set('city', e.target.value)}
                className="input-field w-full"
                placeholder="Ciudad"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado inicial</label>
              <select
                value={form.status}
                onChange={(e) => set('status', e.target.value)}
                className="input-field w-full"
              >
                <option value="active">Activa</option>
                <option value="pending">Pendiente</option>
                <option value="inactive">Inactiva</option>
                <option value="draft">Borrador</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => set('phone', e.target.value)}
                className="input-field w-full"
                placeholder="+57 300 000 0000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                className="input-field w-full"
                placeholder="contacto@tienda.com"
              />
            </div>
          </div>

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <div
                onClick={() => set('is_featured', !form.is_featured)}
                className={`w-10 h-6 rounded-full transition-colors flex items-center px-1 ${form.is_featured ? 'bg-yellow-400' : 'bg-gray-200'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${form.is_featured ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
              <span className="text-sm font-medium text-gray-700">Destacada</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <div
                onClick={() => set('is_verified', !form.is_verified)}
                className={`w-10 h-6 rounded-full transition-colors flex items-center px-1 ${form.is_verified ? 'bg-blue-500' : 'bg-gray-200'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${form.is_verified ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
              <span className="text-sm font-medium text-gray-700">Verificada</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-outline">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Creando...' : 'Crear tienda'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---- Edit modal ----
function EditModal({ shop, onClose, onSave }) {
  const [form, setForm] = useState({
    name: shop.name || '',
    description: shop.description || '',
    city: shop.city || '',
    status: shop.status || 'pending',
    is_featured: shop.is_featured || false,
    is_verified: shop.is_verified || false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('El nombre es requerido'); return; }
    setSaving(true);
    setError('');
    try {
      const res = await api.put(`/admin/shops/${shop.id}`, form);
      onSave(res.data.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar los cambios');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Editar tienda</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              className="input-field w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              className="input-field w-full"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => set('city', e.target.value)}
                className="input-field w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select
                value={form.status}
                onChange={(e) => set('status', e.target.value)}
                className="input-field w-full"
              >
                <option value="active">Activa</option>
                <option value="pending">Pendiente</option>
                <option value="suspended">Suspendida</option>
                <option value="rejected">Rechazada</option>
                <option value="inactive">Inactiva</option>
                <option value="draft">Borrador</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <div
                onClick={() => set('is_featured', !form.is_featured)}
                className={`w-10 h-6 rounded-full transition-colors flex items-center px-1 ${form.is_featured ? 'bg-yellow-400' : 'bg-gray-200'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${form.is_featured ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
              <span className="text-sm font-medium text-gray-700">Destacada</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <div
                onClick={() => set('is_verified', !form.is_verified)}
                className={`w-10 h-6 rounded-full transition-colors flex items-center px-1 ${form.is_verified ? 'bg-blue-500' : 'bg-gray-200'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${form.is_verified ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
              <span className="text-sm font-medium text-gray-700">Verificada</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-outline">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---- Main view ----
export default function ShopsView() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editingShop, setEditingShop] = useState(null);
  const [creating, setCreating] = useState(false);

  const fetchShops = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/shops', {
        params: {
          search: searchQuery || undefined,
          status: statusFilter || undefined,
        },
      });
      setShops(res.data.data || []);
    } catch {
      setShops(MOCK_SHOPS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchShops(); }, []);

  const approveShop = async (id) => {
    try {
      await api.put(`/admin/shops/${id}/approve`);
      setShops((prev) => prev.map((s) => s.id === id ? { ...s, status: 'active' } : s));
    } catch (e) { console.error(e); }
  };

  const rejectShop = async (id) => {
    const reason = window.prompt('Razón del rechazo:');
    if (!reason) return;
    try {
      await api.put(`/admin/shops/${id}/reject`, { reason });
      setShops((prev) => prev.map((s) => s.id === id ? { ...s, status: 'rejected' } : s));
    } catch (e) { console.error(e); }
  };

  const toggleFeatured = async (id) => {
    try {
      await api.put(`/admin/shops/${id}/featured`);
      setShops((prev) => prev.map((s) => s.id === id ? { ...s, is_featured: !s.is_featured } : s));
    } catch (e) { console.error(e); }
  };

  const toggleVerified = async (id) => {
    try {
      await api.put(`/admin/shops/${id}/verified`);
      setShops((prev) => prev.map((s) => s.id === id ? { ...s, is_verified: !s.is_verified } : s));
    } catch (e) { console.error(e); }
  };

  const handleSaved = (updated) => {
    setShops((prev) => prev.map((s) => s.id === updated.id ? { ...s, ...updated } : s));
  };

  const handleCreated = (newShop) => {
    setShops((prev) => [newShop, ...prev]);
  };

  return (
    <div className="space-y-6">
      {creating && (
        <CreateModal onClose={() => setCreating(false)} onCreated={handleCreated} />
      )}
      {editingShop && (
        <EditModal
          shop={editingShop}
          onClose={() => setEditingShop(null)}
          onSave={handleSaved}
        />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tiendas</h1>
          <p className="text-gray-500">Gestionar tiendas de la plataforma</p>
        </div>
        <button onClick={() => setCreating(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" /> Nueva tienda
        </button>
      </div>

      <div className="card">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchShops()}
              placeholder="Buscar tiendas..."
              className="input-field pl-10 w-full"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field w-40"
          >
            <option value="">Todos</option>
            <option value="pending">Pendientes</option>
            <option value="active">Activas</option>
            <option value="suspended">Suspendidas</option>
            <option value="rejected">Rechazadas</option>
          </select>
          <button onClick={fetchShops} className="btn-outline flex items-center gap-2">
            <Filter className="w-5 h-5" /> Filtrar
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500">Cargando tiendas...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {shops.map((shop) => (
              <div key={shop.id} className="p-4 border border-gray-100 rounded-xl hover:border-accent transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-gray-900 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {shop.logo ? (
                        <img src={shop.logo} alt={shop.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-yellow-400 font-bold text-xl">
                          {shop.name?.charAt(0) || 'S'}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{shop.name}</h3>
                        {shop.is_verified && <Shield className="w-4 h-4 text-blue-500" title="Verificada" />}
                        {shop.is_featured && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" title="Destacada" />}
                      </div>
                      <p className="text-sm text-gray-500">
                        {shop.user?.name || 'Sin dueño'} · {shop.city || 'Sin ciudad'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[shop.status] || 'bg-gray-100 text-gray-600'}`}>
                      {STATUS_LABELS[shop.status] || shop.status}
                    </span>
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <MoreVertical className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                  <span className="text-sm text-gray-500">{shop.products_count || 0} productos</span>
                  <div className="flex items-center gap-1">
                    {shop.status === 'pending' && (
                      <>
                        <button
                          onClick={() => approveShop(shop.id)}
                          className="p-2 hover:bg-green-50 rounded text-green-600"
                          title="Aprobar"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => rejectShop(shop.id)}
                          className="p-2 hover:bg-red-50 rounded text-red-600"
                          title="Rechazar"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => toggleFeatured(shop.id)}
                      className={`p-2 rounded transition-colors ${shop.is_featured ? 'text-yellow-500 hover:bg-yellow-50' : 'text-gray-400 hover:bg-gray-50'}`}
                      title={shop.is_featured ? 'Quitar destacado' : 'Destacar'}
                    >
                      <Star className={`w-4 h-4 ${shop.is_featured ? 'fill-yellow-500' : ''}`} />
                    </button>
                    <button
                      onClick={() => toggleVerified(shop.id)}
                      className={`p-2 rounded transition-colors ${shop.is_verified ? 'text-blue-500 hover:bg-blue-50' : 'text-gray-400 hover:bg-gray-50'}`}
                      title={shop.is_verified ? 'Quitar verificación' : 'Verificar'}
                    >
                      <Shield className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingShop(shop)}
                      className="p-2 rounded text-gray-500 hover:bg-gray-50 hover:text-accent transition-colors"
                      title="Editar tienda"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {shops.length === 0 && !loading && (
              <div className="col-span-2 text-center py-8 text-gray-500">
                No se encontraron tiendas
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
