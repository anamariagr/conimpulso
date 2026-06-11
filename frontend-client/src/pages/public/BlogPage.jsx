import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Store, Package, Search } from 'lucide-react';
import api from '../../services/api';

const TYPE_BADGE = {
  product: { label: 'Nuevo producto', icon: Package, color: 'bg-accent/10 text-yellow-700' },
  shop:    { label: 'Nueva tienda',   icon: Store,   color: 'bg-blue-50 text-blue-700' },
  article: { label: 'Artículo',       icon: null,    color: 'bg-gray-100 text-gray-600' },
};

const TYPE_FILTER = [
  { value: '', label: 'Todo' },
  { value: 'product', label: 'Productos' },
  { value: 'shop', label: 'Tiendas' },
  { value: 'article', label: 'Artículos' },
];

function PostCard({ post }) {
  const badge = TYPE_BADGE[post.type] || TYPE_BADGE.article;
  const BadgeIcon = badge.icon;
  const date = post.published_at
    ? new Date(post.published_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  return (
    <Link
      to={`/blog/${post.slug}`}
      className="group flex flex-col bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-accent/30 transition-all duration-200"
    >
      {/* Cover */}
      <div className="aspect-[16/9] bg-gradient-to-br from-gray-900 to-gray-700 overflow-hidden relative">
        {post.cover_image ? (
          <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-5xl font-bold text-yellow-400 opacity-30">{post.title.charAt(0)}</span>
          </div>
        )}
        {/* Badge */}
        <div className={`absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${badge.color} backdrop-blur-sm`}>
          {BadgeIcon && <BadgeIcon className="w-3 h-3" />}
          {badge.label}
        </div>
      </div>

      {/* Body */}
      <div className="p-5 flex-1 flex flex-col">
        <h2 className="font-bold text-gray-900 text-lg leading-snug group-hover:text-accent transition-colors line-clamp-2 mb-2">
          {post.title}
        </h2>
        {post.excerpt && (
          <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 flex-1">{post.excerpt}</p>
        )}
        <div className="flex items-center gap-2 mt-4 text-xs text-gray-400">
          <Calendar className="w-3.5 h-3.5" />
          {date}
        </div>
      </div>
    </Link>
  );
}

export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1 });

  const fetchPosts = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get('/blog', {
        params: { search: search || undefined, type: typeFilter || undefined, page, per_page: 12 },
      });
      if (page === 1) setPosts(res.data.data || []);
      else setPosts((prev) => [...prev, ...(res.data.data || [])]);
      setMeta(res.data.meta || { current_page: 1, last_page: 1 });
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPosts(1); }, [typeFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPosts(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-[#0A0A0A] text-white pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-accent/10 text-yellow-400 border border-accent/20 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            ✦ Emprendimiento local · Hecho a mano · Directo del creador
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Blog <span className="text-accent">ConImpulso</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Conoce los productos y emprendimientos que se suman a nuestra comunidad. Compra directo al artesano, sin intermediarios.
          </p>

          {/* Search */}
          <form onSubmit={handleSearch} className="mt-8 flex gap-2 max-w-md mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar en el blog..."
                className="w-full bg-white/10 border border-white/20 rounded-xl pl-9 pr-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:border-accent"
              />
            </div>
            <button type="submit" className="px-4 py-2.5 bg-accent text-primary font-semibold rounded-xl hover:bg-yellow-400 transition">
              Buscar
            </button>
          </form>
        </div>
      </div>

      {/* Filters */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3">
        <div className="max-w-5xl mx-auto flex gap-2 overflow-x-auto">
          {TYPE_FILTER.map((f) => (
            <button
              key={f.value}
              onClick={() => setTypeFilter(f.value)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                typeFilter === f.value
                  ? 'bg-accent text-primary'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Posts grid */}
      <div className="max-w-5xl mx-auto px-4 py-10">
        {loading && posts.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                <div className="aspect-[16/9] bg-gray-100" />
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-gray-100 rounded w-3/4" />
                  <div className="h-4 bg-gray-100 rounded w-full" />
                  <div className="h-4 bg-gray-100 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Package className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg">No hay posts todavía. ¡Sé el primero en publicar un producto!</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => <PostCard key={post.id} post={post} />)}
            </div>
            {meta.current_page < meta.last_page && (
              <div className="text-center mt-10">
                <button
                  onClick={() => fetchPosts(meta.current_page + 1)}
                  disabled={loading}
                  className="px-8 py-3 bg-white border-2 border-gray-200 hover:border-accent rounded-xl font-semibold text-gray-700 hover:text-accent transition"
                >
                  {loading ? 'Cargando...' : 'Ver más posts'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
