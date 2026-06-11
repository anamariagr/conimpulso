import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Archive, ExternalLink, Package, Store, FileText, Loader2, X, Check } from 'lucide-react';
import api from '../../services/api';

const TYPE_LABELS = { product: 'Producto', shop: 'Tienda', article: 'Artículo' };
const STATUS_COLORS = {
  published: 'bg-green-100 text-green-700',
  draft:     'bg-yellow-100 text-yellow-700',
  archived:  'bg-gray-100 text-gray-500',
};

function EditModal({ post, onClose, onSaved }) {
  const [form, setForm] = useState({ title: post.title, excerpt: post.excerpt || '', content: post.content, status: post.status });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put(`/admin/blog/${post.id}`, form);
      onSaved(res.data.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white">
          <h2 className="text-lg font-bold text-gray-900">Editar post</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
            <input type="text" value={form.title} onChange={(e) => setForm(f => ({...f, title: e.target.value}))} className="input-field w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Extracto</label>
            <textarea value={form.excerpt} onChange={(e) => setForm(f => ({...f, excerpt: e.target.value}))} className="input-field w-full" rows={2} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contenido</label>
            <textarea value={form.content} onChange={(e) => setForm(f => ({...f, content: e.target.value}))} className="input-field w-full" rows={8} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select value={form.status} onChange={(e) => setForm(f => ({...f, status: e.target.value}))} className="input-field w-full">
              <option value="published">Publicado</option>
              <option value="draft">Borrador</option>
              <option value="archived">Archivado</option>
            </select>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="btn-outline">Cancelar</button>
            <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function NewArticleModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ title: '', excerpt: '', content: '', status: 'draft' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) { setError('Título y contenido son requeridos'); return; }
    setSaving(true);
    try {
      const res = await api.post('/admin/blog', form);
      onCreated(res.data.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white">
          <h2 className="text-lg font-bold text-gray-900">Nuevo artículo</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título <span className="text-red-500">*</span></label>
            <input type="text" value={form.title} onChange={(e) => setForm(f => ({...f, title: e.target.value}))} className="input-field w-full" placeholder="Título del artículo" autoFocus />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Extracto</label>
            <input type="text" value={form.excerpt} onChange={(e) => setForm(f => ({...f, excerpt: e.target.value}))} className="input-field w-full" placeholder="Una línea que resuma el artículo..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contenido <span className="text-red-500">*</span></label>
            <textarea value={form.content} onChange={(e) => setForm(f => ({...f, content: e.target.value}))} className="input-field w-full" rows={8} placeholder="Escribe el artículo aquí..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select value={form.status} onChange={(e) => setForm(f => ({...f, status: e.target.value}))} className="input-field w-full">
              <option value="draft">Borrador</option>
              <option value="published">Publicar ahora</option>
            </select>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="btn-outline">Cancelar</button>
            <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? 'Creando...' : 'Crear artículo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function BlogView() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState(null);
  const [creating, setCreating] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/blog', { params: { status: statusFilter || undefined, type: typeFilter || undefined } });
      setPosts(res.data.data || []);
    } catch { setPosts([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPosts(); }, [statusFilter, typeFilter]);

  const archivePost = async (id) => {
    if (!window.confirm('¿Archivar este post?')) return;
    try {
      await api.delete(`/admin/blog/${id}`);
      setPosts(prev => prev.map(p => p.id === id ? { ...p, status: 'archived' } : p));
    } catch {}
  };

  const handleSaved = (updated) => setPosts(prev => prev.map(p => p.id === updated.id ? { ...p, ...updated } : p));
  const handleCreated = (newPost) => setPosts(prev => [newPost, ...prev]);

  const TypeIcon = ({ type }) => {
    if (type === 'product') return <Package className="w-3.5 h-3.5" />;
    if (type === 'shop') return <Store className="w-3.5 h-3.5" />;
    return <FileText className="w-3.5 h-3.5" />;
  };

  return (
    <div className="space-y-6">
      {editingPost && <EditModal post={editingPost} onClose={() => setEditingPost(null)} onSaved={handleSaved} />}
      {creating && <NewArticleModal onClose={() => setCreating(false)} onCreated={handleCreated} />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog</h1>
          <p className="text-gray-500">Posts auto-generados y artículos manuales</p>
        </div>
        <button onClick={() => setCreating(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" /> Nuevo artículo
        </button>
      </div>

      {/* Filters */}
      <div className="card flex items-center gap-4 flex-wrap">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field w-36">
          <option value="">Todos los estados</option>
          <option value="published">Publicados</option>
          <option value="draft">Borradores</option>
          <option value="archived">Archivados</option>
        </select>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="input-field w-36">
          <option value="">Todos los tipos</option>
          <option value="product">Producto</option>
          <option value="shop">Tienda</option>
          <option value="article">Artículo</option>
        </select>
        <span className="text-sm text-gray-400 ml-auto">{posts.length} posts</span>
      </div>

      <div className="card">
        {loading ? (
          <div className="text-center py-10 text-gray-400"><Loader2 className="w-7 h-7 animate-spin mx-auto" /></div>
        ) : posts.length === 0 ? (
          <div className="text-center py-10 text-gray-400">No hay posts todavía. Se crean automáticamente cuando los vendors suben productos o tiendas.</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {posts.map((post) => (
              <div key={post.id} className="flex items-center gap-4 py-4">
                {/* Cover thumb */}
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-900 flex-shrink-0">
                  {post.cover_image
                    ? <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-accent font-bold text-lg">{post.title.charAt(0)}</div>
                  }
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[post.status]}`}>
                      {post.status === 'published' && <Check className="w-3 h-3" />}
                      {post.status}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-500">
                      <TypeIcon type={post.type} />
                      {TYPE_LABELS[post.type] || post.type}
                    </span>
                  </div>
                  <p className="font-semibold text-gray-900 truncate">{post.title}</p>
                  {post.excerpt && <p className="text-sm text-gray-400 truncate">{post.excerpt}</p>}
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  {post.status === 'published' && (
                    <a href={`/blog/${post.slug}`} target="_blank" rel="noreferrer" className="p-2 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-accent" title="Ver post">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  <button onClick={() => setEditingPost(post)} className="p-2 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-accent" title="Editar">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  {post.status !== 'archived' && (
                    <button onClick={() => archivePost(post.id)} className="p-2 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-red-500" title="Archivar">
                      <Archive className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
