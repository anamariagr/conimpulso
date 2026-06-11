import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Store, Package, ArrowLeft, MapPin, Tag, MessageSquare } from 'lucide-react';
import api from '../../services/api';

const STOCK_BADGE = (stock) => {
  if (stock === null || stock === undefined) return null;
  if (stock === 0) return { label: 'Agotado', color: 'bg-red-100 text-red-700' };
  if (stock <= 5) return { label: `¡Solo ${stock} disponibles!`, color: 'bg-orange-100 text-orange-700' };
  return { label: `${stock} disponibles`, color: 'bg-green-100 text-green-700' };
};

export default function BlogPostPage() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [related, setRelated] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/blog/${slug}`)
      .then((res) => {
        setPost(res.data.data);
        setRelated(res.data.related);
      })
      .catch((err) => {
        if (err.response?.status === 404) setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24">
        <div className="max-w-3xl mx-auto px-4 animate-pulse space-y-6">
          <div className="aspect-[16/7] bg-gray-200 rounded-2xl" />
          <div className="h-8 bg-gray-200 rounded w-3/4" />
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900 mb-2">Post no encontrado</p>
          <Link to="/blog" className="text-accent hover:underline">Volver al blog</Link>
        </div>
      </div>
    );
  }

  const isProduct = post.type === 'product';
  const date = post.published_at
    ? new Date(post.published_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';
  const stockBadge = isProduct && related ? STOCK_BADGE(related.stock) : null;

  const paragraphs = (post.content || '').split('\n\n').filter(Boolean);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 pt-24 pb-16">
        {/* Back */}
        <Link to="/blog" className="inline-flex items-center gap-2 text-gray-500 hover:text-accent text-sm font-medium mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Volver al blog
        </Link>

        {/* Cover */}
        {post.cover_image && (
          <div className="aspect-[16/7] rounded-2xl overflow-hidden mb-8 bg-gray-900">
            <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Meta badges */}
        <div className="flex flex-wrap items-center gap-2 mb-5">
          <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${isProduct ? 'bg-accent/10 text-yellow-700' : 'bg-blue-50 text-blue-700'}`}>
            {isProduct ? <Package className="w-3 h-3" /> : <Store className="w-3 h-3" />}
            {isProduct ? 'Nuevo producto' : 'Nueva tienda'}
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <Calendar className="w-3.5 h-3.5" /> {date}
          </span>
          {stockBadge && (
            <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${stockBadge.color}`}>
              <Tag className="w-3 h-3" /> {stockBadge.label}
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-4">
          {post.title}
        </h1>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-xl text-gray-500 leading-relaxed mb-8 border-l-4 border-accent pl-4">
            {post.excerpt}
          </p>
        )}

        {/* Content */}
        <div className="prose prose-gray max-w-none space-y-5 mb-10">
          {paragraphs.map((p, i) => (
            <p key={i} className="text-gray-700 leading-relaxed text-base">{p}</p>
          ))}
        </div>

        {/* ConImpulso badge */}
        <div className="bg-[#0A0A0A] rounded-2xl p-5 mb-8 flex items-center gap-3">
          <span className="text-2xl">✦</span>
          <p className="text-gray-300 text-sm leading-relaxed">
            <strong className="text-accent">Emprendimiento local · Hecho a mano · Directo del creador</strong><br />
            En ConImpulso conectamos compradores directamente con artesanos y emprendedores, sin intermediarios.
          </p>
        </div>

        {/* CTA card */}
        {related && (
          <div className="bg-white rounded-2xl border-2 border-accent/20 p-6 flex items-center gap-5 shadow-sm">
            {/* Thumb */}
            <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-900 flex-shrink-0">
              {post.cover_image ? (
                <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-accent">{related.name?.charAt(0)}</span>
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-900 truncate">{related.name}</p>
              {isProduct && related.price && (
                <p className="text-accent font-semibold text-lg">
                  ${Number(related.price).toLocaleString('es-CO')}
                </p>
              )}
              {isProduct && related.shop && (
                <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                  <Store className="w-3 h-3" /> {related.shop.name}
                  {related.shop.city && <><MapPin className="w-3 h-3 ml-1" /> {related.shop.city}</>}
                </p>
              )}
              {!isProduct && related.city && (
                <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3" /> {related.city}
                </p>
              )}
            </div>

            <div className="flex-shrink-0">
              {isProduct ? (
                <Link
                  to={`/products`}
                  className="flex items-center gap-2 px-5 py-2.5 bg-accent text-primary font-semibold rounded-xl hover:bg-yellow-400 transition text-sm"
                >
                  <Package className="w-4 h-4" /> Ver producto
                </Link>
              ) : (
                <Link
                  to={`/stores/${related.slug}`}
                  className="flex items-center gap-2 px-5 py-2.5 bg-accent text-primary font-semibold rounded-xl hover:bg-yellow-400 transition text-sm"
                >
                  <Store className="w-4 h-4" /> Visitar tienda
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Request change note */}
        <div className="mt-8 flex items-start gap-3 bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-500">
          <MessageSquare className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <p>¿Eres el creador de este post y quieres solicitar un cambio? Escríbenos a <strong>soporte@conimpulso.co</strong> con el enlace de este post.</p>
        </div>
      </div>
    </div>
  );
}
