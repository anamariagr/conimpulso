import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, MapPin, Shield, MessageSquare, Heart, Package, Loader2, AlertCircle, Plus, ExternalLink, ShieldCheck, Lock } from 'lucide-react';
import api from '../../services/api';
import { useAuthStore } from '../../stores/authStore';

function ShopLogo({ logo, name, size = 'lg' }) {
  const [imgError, setImgError] = useState(false);
  const sizeClass = size === 'lg' ? 'w-32 h-32 text-5xl' : 'w-16 h-16 text-2xl';
  if (logo && !imgError) {
    return (
      <img
        src={logo}
        alt={name}
        onError={() => setImgError(true)}
        className={`${sizeClass} rounded-2xl object-cover border-4 border-white shadow-lg flex-shrink-0`}
      />
    );
  }
  return (
    <div className={`${sizeClass} bg-accent rounded-2xl flex items-center justify-center border-4 border-white shadow-lg flex-shrink-0`}>
      <span className="font-bold text-primary">{name?.charAt(0) || '?'}</span>
    </div>
  );
}

function ProductCard({ product }) {
  const firstImage = product.images?.[0];
  const price = Number(product.price);
  return (
    <Link to={`/products/${product.slug || product.id}`} className="card overflow-hidden hover:shadow-card transition-shadow block">
      <div className="aspect-square bg-gray-100 mb-4 overflow-hidden rounded-lg">
        {firstImage ? (
          <img src={firstImage} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <Package className="w-12 h-12" />
          </div>
        )}
      </div>
      <h3 className="font-semibold text-primary mb-1 line-clamp-2">{product.name}</h3>
      {price > 0 && (
        <p className="text-lg font-bold text-primary">
          ${price.toLocaleString('es-CO')}
        </p>
      )}
    </Link>
  );
}

export default function StoreProfilePage() {
  const { slug } = useParams();
  const { user } = useAuthStore();
  const [shop, setShop] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [products, setProducts] = useState([]);
  const [rating, setRating] = useState(null);
  const [loadingShop, setLoadingShop] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('products');

  useEffect(() => {
    setLoadingShop(true);
    setError('');
    api.get(`/shops/${slug}`)
      .then((res) => {
        const d = res.data.data;
        setShop(d.shop);
        setIsOwner(d.is_owner || false);
        setRating(d.rating);
      })
      .catch(() => setError('No se encontró esta tienda.'))
      .finally(() => setLoadingShop(false));
  }, [slug]);

  useEffect(() => {
    if (!shop?.id) return;
    setLoadingProducts(true);
    api.get('/products', { params: { shop_id: shop.id, per_page: 20 } })
      .then((res) => setProducts(res.data.data || []))
      .catch(() => setProducts([]))
      .finally(() => setLoadingProducts(false));
  }, [shop?.id]);

  if (loadingShop) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-accent" />
      </div>
    );
  }

  if (error || !shop) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
        <AlertCircle className="w-14 h-14 text-gray-300" />
        <h2 className="text-xl font-bold text-primary">Tienda no encontrada</h2>
        <p className="text-gray-500">{error || 'Esta tienda no existe o no está disponible.'}</p>
        <Link to="/stores" className="btn-primary mt-2">Ver todas las tiendas</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Owner banner */}
      {isOwner && (
        <div className="bg-accent text-white text-sm font-medium px-4 py-2.5 text-center flex items-center justify-center gap-3">
          <span>Estás viendo tu tienda como la ven los compradores</span>
          <Link to="/dashboard/store" className="underline font-semibold hover:no-underline">
            Ir a mi panel
          </Link>
        </div>
      )}

      {/* Banner */}
      <div className="h-52 md:h-72 bg-primary relative overflow-hidden">
        {(() => {
          const heroImg = shop.banner || (Array.isArray(shop.gallery) && shop.gallery[0]) || null;
          return heroImg ? (
            <img src={heroImg} alt={shop.name} className="w-full h-full object-cover opacity-60" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary to-gray-800" />
          );
        })()}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent" />
      </div>

      {/* Profile header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 bg-black/60 backdrop-blur-sm p-5 rounded-2xl">
          <ShopLogo logo={shop.logo} name={shop.name} size="lg" />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-bold text-white">{shop.name}</h1>
              {shop.is_verified && <Shield className="w-5 h-5 text-blue-400 flex-shrink-0" />}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-gray-300 text-sm">
              {shop.city && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> {shop.city}
                </span>
              )}
              {rating > 0 && (
                <span className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-accent" /> {Number(rating).toFixed(1)}
                </span>
              )}
              <span className="text-gray-400">{shop.products_count ?? 0} productos</span>
            </div>
            {shop.description && (
              <p className="text-gray-300 text-sm mt-2 line-clamp-2">{shop.description}</p>
            )}
          </div>

          <div className="flex gap-2 flex-shrink-0">
            {isOwner ? (
              <Link
                to="/dashboard/store/edit"
                className="flex items-center gap-2 px-4 py-2 bg-accent text-white text-sm font-semibold rounded-lg hover:bg-accent-400 transition"
              >
                Editar tienda
              </Link>
            ) : (
              <>
                <button className="flex items-center gap-2 px-4 py-2 border border-white/30 text-white text-sm rounded-lg hover:bg-white/10 transition">
                  <Heart className="w-4 h-4" /> Seguir
                </button>
                {shop.phone && (
                  <a
                    href={`https://wa.me/${shop.phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-accent text-white text-sm font-semibold rounded-lg hover:bg-accent-400 transition"
                  >
                    <MessageSquare className="w-4 h-4" /> Contactar
                  </a>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="space-y-5">
            {/* Info */}
            <div className="card space-y-3">
              <h3 className="font-semibold text-primary mb-1">Información</h3>

              {shop.city && (
                <span className="flex items-center gap-3 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 flex-shrink-0 text-gray-400" />
                  {shop.city}{shop.country ? `, ${shop.country}` : ''}
                </span>
              )}

              {shop.is_verified ? (
                <div className="flex items-center gap-2 text-sm text-blue-700 bg-blue-50 rounded-xl px-3 py-2">
                  <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                  <span className="font-medium">Tienda verificada</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-gray-400 bg-gray-50 rounded-xl px-3 py-2">
                  <Shield className="w-4 h-4 flex-shrink-0" />
                  <span>Sin verificar</span>
                </div>
              )}

              <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 rounded-xl px-3 py-2">
                <Lock className="w-4 h-4 flex-shrink-0" />
                <span className="font-medium">Compra segura garantizada</span>
              </div>
            </div>

            {/* Certifications */}
            {shop.certifications?.length > 0 && (
              <div className="card">
                <h3 className="font-semibold text-primary mb-3">Certificaciones</h3>
                <div className="flex flex-wrap gap-2">
                  {shop.certifications.map((cert, i) => (
                    <span key={i} className="px-3 py-1 bg-accent/10 text-accent rounded-full text-xs font-medium">
                      ✓ {cert}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Main */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="flex gap-1 border-b border-gray-200 mb-6">
              {[
                { key: 'products', label: 'Productos' },
                { key: 'about', label: 'Nosotros' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`pb-3 px-4 text-sm font-medium transition-colors border-b-2 -mb-px ${
                    activeTab === key
                      ? 'text-accent border-accent'
                      : 'text-gray-500 border-transparent hover:text-primary'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Products tab */}
            {activeTab === 'products' && (
              <div>
                {loadingProducts ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin text-accent" />
                  </div>
                ) : products.length > 0 ? (
                  <>
                    <p className="text-sm text-gray-500 mb-4">{products.length} producto{products.length !== 1 ? 's' : ''}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {products.map((p) => <ProductCard key={p.id} product={p} />)}
                    </div>
                  </>
                ) : isOwner ? (
                  /* Owner sees "add products" CTA */
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-4">
                      <Package className="w-8 h-8 text-accent" />
                    </div>
                    <h3 className="text-lg font-bold text-primary mb-2">Aún no tienes productos publicados</h3>
                    <p className="text-gray-500 max-w-sm mb-6">
                      Los compradores ven esta sección vacía. Agrega tus primeros productos para empezar a vender.
                    </p>
                    <Link
                      to="/dashboard/products/new"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white font-semibold rounded-lg hover:bg-accent-400 transition"
                    >
                      <Plus className="w-5 h-5" />
                      Agregar mi primer producto
                    </Link>
                    <Link to="/dashboard/store" className="mt-3 text-sm text-gray-500 hover:text-accent underline">
                      Ir al panel de mi tienda
                    </Link>
                  </div>
                ) : (
                  /* Public visitor sees empty state */
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Package className="w-12 h-12 text-gray-300 mb-3" />
                    <p className="text-gray-500">Esta tienda aún no tiene productos publicados.</p>
                  </div>
                )}
              </div>
            )}

            {/* About tab */}
            {activeTab === 'about' && (
              <div className="space-y-5">
                {shop.description && (
                  <div className="card">
                    <h3 className="font-semibold text-primary mb-3">Descripción</h3>
                    <p className="text-gray-600 leading-relaxed">{shop.description}</p>
                  </div>
                )}

                {shop.story && Object.keys(shop.story).length > 0 && (
                  <div className="card space-y-3">
                    <h3 className="font-semibold text-primary mb-1">Nuestra historia</h3>
                    {shop.story.what_we_do && (
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Qué hacemos</p>
                        <p className="text-gray-600 text-sm">{shop.story.what_we_do}</p>
                      </div>
                    )}
                    {shop.story.why_started && (
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Por qué empezamos</p>
                        <p className="text-gray-600 text-sm">{shop.story.why_started}</p>
                      </div>
                    )}
                    {shop.story.differentiator && (
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Qué nos hace únicos</p>
                        <p className="text-gray-600 text-sm">{shop.story.differentiator}</p>
                      </div>
                    )}
                    {shop.story.founded_year && (
                      <p className="text-xs text-gray-400">Fundado en {shop.story.founded_year}</p>
                    )}
                  </div>
                )}

                {shop.gallery?.length > 0 && (
                  <div className="card">
                    <h3 className="font-semibold text-primary mb-3">Galería</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {shop.gallery.map((img, i) => (
                        <img
                          key={i}
                          src={img}
                          alt={`${shop.name} ${i + 1}`}
                          className="w-full aspect-square object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {!shop.description && !shop.story && shop.gallery?.length === 0 && (
                  <div className="text-center py-10 text-gray-400">
                    <p>Esta tienda aún no ha completado su sección "Sobre nosotros".</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
