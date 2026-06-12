import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Store, Tag, Clock, Package, ShoppingCart, MessageSquare, Wrench, ChevronLeft, ChevronRight, Share2 } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

function ImageGallery({ images }) {
  const [current, setCurrent] = useState(0);
  if (!images || images.length === 0) {
    return (
      <div className="aspect-square bg-gray-100 rounded-2xl flex items-center justify-center">
        <span className="text-8xl text-gray-300">📦</span>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      <div className="relative aspect-square bg-gray-100 rounded-2xl overflow-hidden group">
        <img src={images[current]} alt="" className="w-full h-full object-cover" />
        {images.length > 1 && (
          <>
            <button
              onClick={() => setCurrent(i => (i - 1 + images.length) % images.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrent(i => (i + 1) % images.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${current === i ? 'border-primary' : 'border-transparent'}`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function StarRating({ value, count }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex">
        {[1, 2, 3, 4, 5].map(s => (
          <Star key={s} className={`w-4 h-4 ${s <= Math.round(value) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
        ))}
      </div>
      <span className="text-sm text-gray-500">{value?.toFixed(1)} ({count} reseñas)</span>
    </div>
  );
}

export default function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/products/${slug}`);
        setData(res.data.data);
      } catch {
        toast.error('Producto no encontrado');
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-6 w-32 bg-gray-200 rounded" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="aspect-square bg-gray-200 rounded-2xl" />
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4" />
              <div className="h-6 bg-gray-200 rounded w-1/3" />
              <div className="h-4 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded w-5/6" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { product, rating, is_owner } = data;
  const images = (() => {
    try {
      if (Array.isArray(product.images)) return product.images;
      if (typeof product.images === 'string') return JSON.parse(product.images);
    } catch {}
    return [];
  })();

  const isWholesale = product.price_wholesale && quantity >= (product.minimum_wholesale_quantity || 10);
  const displayPrice = isWholesale ? product.price_wholesale : product.price;
  const wholesaleDiscount = product.price_wholesale
    ? Math.round(((product.price - product.price_wholesale) / product.price) * 100)
    : null;

  const handleContact = () => {
    toast('Función de mensajería disponible próximamente', { icon: '💬' });
  };

  const handleQuote = () => {
    toast('Solicitud de cotización disponible próximamente', { icon: '📋' });
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    toast.success('Enlace copiado');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-sm text-gray-500">
        <Link to="/products" className="flex items-center gap-1 hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Productos
        </Link>
        {product.categories?.length > 0 && (
          <>
            <span>/</span>
            <span>{product.categories[0].name}</span>
          </>
        )}
        <span>/</span>
        <span className="text-gray-900 font-medium truncate max-w-xs">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left: Images */}
        <ImageGallery images={images} />

        {/* Right: Info */}
        <div className="space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-2xl font-bold text-gray-900 leading-tight">{product.name}</h1>
              <button onClick={handleShare} className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0">
                <Share2 className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            {(product.rating_count > 0) && (
              <div className="mt-2">
                <StarRating value={rating} count={product.rating_count} />
              </div>
            )}
          </div>

          {/* Price */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-primary">
                ${parseFloat(displayPrice).toLocaleString('es', { minimumFractionDigits: 2 })}
              </span>
              {isWholesale && (
                <span className="text-sm text-gray-400 line-through">
                  ${parseFloat(product.price).toLocaleString('es', { minimumFractionDigits: 2 })}
                </span>
              )}
            </div>
            {product.price_wholesale && (
              <div className="flex flex-wrap gap-2 text-sm">
                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                  -{wholesaleDiscount}% mayoreo
                </span>
                <span className="text-gray-500">
                  Precio mayoreo: ${parseFloat(product.price_wholesale).toLocaleString('es', { minimumFractionDigits: 2 })}
                  (mín. {product.minimum_wholesale_quantity || 10} unidades)
                </span>
              </div>
            )}
          </div>

          {/* Stock & Status */}
          <div className="flex flex-wrap gap-3">
            {product.stock !== null && (
              <div className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full ${
                product.stock > 10 ? 'bg-green-100 text-green-700' :
                product.stock > 0 ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                <Package className="w-4 h-4" />
                {product.stock > 10 ? 'En stock' : product.stock > 0 ? `Solo ${product.stock} disponibles` : 'Sin stock'}
              </div>
            )}
            {product.fabrication_time && (
              <div className="flex items-center gap-1.5 text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
                <Clock className="w-4 h-4" />
                {product.fabrication_time} días de fabricación
              </div>
            )}
            {product.is_featured && (
              <div className="flex items-center gap-1.5 text-sm text-yellow-700 bg-yellow-100 px-3 py-1.5 rounded-full">
                <Star className="w-4 h-4 fill-yellow-500" />
                Destacado
              </div>
            )}
          </div>

          {/* Quantity & Actions */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700">Cantidad</label>
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setQuantity(q => Math.max(product.minimum_quantity || 1, q - 1))}
                  className="px-3 py-2 hover:bg-gray-100 transition-colors text-gray-600 font-bold"
                >−</button>
                <input
                  type="number"
                  value={quantity}
                  min={product.minimum_quantity || 1}
                  onChange={e => setQuantity(Math.max(product.minimum_quantity || 1, parseInt(e.target.value) || 1))}
                  className="w-16 text-center py-2 border-x border-gray-300 focus:outline-none"
                />
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  className="px-3 py-2 hover:bg-gray-100 transition-colors text-gray-600 font-bold"
                >+</button>
              </div>
              {product.minimum_quantity > 1 && (
                <span className="text-xs text-gray-400">Mín. {product.minimum_quantity}</span>
              )}
            </div>

            <button
              onClick={handleContact}
              className="w-full flex items-center justify-center gap-2 bg-primary text-white font-semibold py-3 rounded-xl hover:bg-primary/90 transition-colors"
            >
              <MessageSquare className="w-5 h-5" />
              Contactar al vendedor
            </button>

            <div className="grid grid-cols-2 gap-3">
              {product.allow_quotation && (
                <button
                  onClick={handleQuote}
                  className="flex items-center justify-center gap-2 border border-primary text-primary font-semibold py-2.5 rounded-xl hover:bg-primary/5 transition-colors text-sm"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Solicitar cotización
                </button>
              )}
              {product.allow_custom_order && (
                <button
                  onClick={handleQuote}
                  className="flex items-center justify-center gap-2 border border-gray-300 text-gray-700 font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm"
                >
                  <Wrench className="w-4 h-4" />
                  Orden personalizada
                </button>
              )}
            </div>
          </div>

          {/* Store */}
          {product.shop && (
            <Link
              to={`/stores/${product.shop.slug}`}
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:border-primary/30 hover:bg-gray-50 transition-all group"
            >
              {product.shop.logo ? (
                <img src={product.shop.logo} alt={product.shop.name} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Store className="w-6 h-6 text-primary" />
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs text-gray-400 mb-0.5">Vendido por</p>
                <p className="font-semibold text-gray-900 group-hover:text-primary transition-colors">{product.shop.name}</p>
                {product.shop.city && (
                  <p className="text-xs text-gray-400">{product.shop.city}</p>
                )}
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300 ml-auto flex-shrink-0" />
            </Link>
          )}
        </div>
      </div>

      {/* Description & Details */}
      <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Description */}
          {product.description && (
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">Descripción</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">{product.description}</p>
            </section>
          )}

          {/* Story */}
          {product.story?.content && (
            <section className="bg-amber-50 border border-amber-200 rounded-xl p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-3">Historia del producto</h2>
              <p className="text-gray-700 leading-relaxed">{product.story.content}</p>
            </section>
          )}

          {/* Reviews */}
          {product.reviews?.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Reseñas ({product.reviews_count})</h2>
              <div className="space-y-4">
                {product.reviews.map((review, i) => (
                  <div key={i} className="border border-gray-100 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <StarRating value={review.rating} count={null} />
                      <span className="text-sm text-gray-400 ml-auto">{new Date(review.created_at).toLocaleDateString('es')}</span>
                    </div>
                    {review.comment && <p className="text-gray-600 text-sm">{review.comment}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar: attributes, tags */}
        <div className="space-y-6">
          {/* Attributes */}
          {product.attributes && Object.keys(product.attributes).length > 0 && (
            <section className="bg-gray-50 rounded-xl p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Especificaciones</h3>
              <dl className="space-y-2">
                {Object.entries(product.attributes).map(([k, v]) => (
                  <div key={k} className="flex justify-between text-sm">
                    <dt className="text-gray-500 capitalize">{k}</dt>
                    <dd className="font-medium text-gray-900">{String(v)}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          {/* Tags */}
          {product.tags?.length > 0 && (
            <section>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Etiquetas
              </h3>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, i) => (
                  <Link
                    key={i}
                    to={`/products?tag=${tag}`}
                    className="px-3 py-1 bg-gray-100 hover:bg-primary/10 hover:text-primary text-gray-600 rounded-full text-sm transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Variants */}
          {product.variants?.length > 0 && (
            <section className="bg-gray-50 rounded-xl p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Variantes disponibles</h3>
              <div className="space-y-2">
                {product.variants.map((v, i) => (
                  <div key={i} className="flex justify-between items-center text-sm">
                    <span className="text-gray-700">{v.name || v.sku}</span>
                    {v.price && <span className="font-medium">${parseFloat(v.price).toLocaleString('es', { minimumFractionDigits: 2 })}</span>}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
