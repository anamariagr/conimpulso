import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Truck, Users, Star, Zap, Globe, Mail, ShoppingBag, MapPin, CheckCircle, X, Store, Wrench, Calendar } from 'lucide-react';
import api from '../../services/api';
import { useAuthStore } from '../../stores/authStore';

// Helper to get category icon
const getCategoryIcon = (name) => {
  const icons = {
    'Alimentos': '🍽️', 'Bebidas': '🥤', 'Textiles': '👕', 'Ropa': '👗',
    'Tecnología': '💻', 'Muebles': '🪑', 'Artesanía': '🎨',
    'Metalurgia': '⚙️', 'Servicios': '🔧', 'default': '📦'
  };
  if (name?.icon) return name.icon;
  for (const [key, icon] of Object.entries(icons)) {
    if (name?.toLowerCase().includes(key.toLowerCase())) return icon;
  }
  return icons.default;
};

// Helper to format price
const formatPrice = (price) => {
  if (!price) return '$0';
  return new Intl.NumberFormat('es-CL').format(price);
};

// Helper to get product image
const getProductImage = (product) => {
  if (!product?.images) return 'https://picsum.photos/seed/default/400/400';
  if (Array.isArray(product.images)) return product.images[0];
  try {
    const parsed = JSON.parse(product.images);
    return Array.isArray(parsed) ? parsed[0] : parsed;
  } catch {
    return product.images;
  }
};

// Get shop logo
const getShopLogo = (shop) => {
  if (!shop?.logo) return 'https://picsum.photos/seed/shop/200/200';
  return shop.logo;
};

// Section renderers
const getYouTubeVideoId = (url) => {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/);
  return match ? match[1] : null;
};

const getYouTubeEmbedUrl = (url) => {
  const videoId = getYouTubeVideoId(url);
  if (!videoId) return null;
  const params = new URLSearchParams({
    autoplay: '1',
    mute: '1',
    loop: '1',
    playlist: videoId,
    controls: '0',
    modestbranding: '1',
    rel: '0',
    vq: 'hd1080',
    hd: '1',
    enablejsapi: '1',
    iv_load_policy: '3',
    disablekb: '1',
  });
  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
};

const HERO_CONTENT = {
  vendor: {
    badge: '✦ Para vendedores',
    title: 'Tu tienda,',
    accent: 'tu precio, tus reglas',
    description: 'Vende directo a compradores reales sin intermediarios. Crea tu tienda gratis, sube tus productos y empieza a vender hoy.',
    cta: { label: 'Crear mi tienda', to: '/dashboard/store/new', icon: <Store className="w-5 h-5" /> },
    secondary: { label: 'Ver mi dashboard', to: '/dashboard' },
  },
  buyer: {
    badge: '✦ Para compradores',
    title: 'Compra directo',
    accent: 'al que lo hace',
    description: 'Descubre productos únicos hechos a mano por emprendedores latinoamericanos. Cada compra apoya un sueño real.',
    cta: { label: 'Explorar productos', to: '/products', icon: <ShoppingBag className="w-5 h-5" /> },
    secondary: { label: 'Ver tiendas', to: '/stores' },
  },
  guest: {
    badge: null,
    title: 'Compra directo',
    accent: 'al que lo hace',
    description: 'Descubre productos únicos hechos a mano por emprendedores latinoamericanos. Cada compra apoya un sueño real.',
    cta: { label: 'Empezar ahora', to: '/register', icon: <ArrowRight className="w-5 h-5" /> },
    secondary: { label: 'Ver tiendas', to: '/stores' },
  },
};

const HeroSection = ({ heroBanner }) => {
  const { isAuthenticated, isVendor } = useAuthStore();
  const [hasShop, setHasShop] = useState(null); // null = loading, true/false = resolved
  const videoId = heroBanner?.media_type === 'video' ? getYouTubeVideoId(heroBanner?.media_url) : null;
  const youtubeEmbed = videoId ? getYouTubeEmbedUrl(heroBanner?.media_url) : null;
  const youtubeThumbnail = videoId
    ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    : null;
  const iframeRef = useRef(null);

  const roleKey = !isAuthenticated ? 'guest' : isVendor() ? 'vendor' : 'buyer';

  // Check if vendor already has a shop to show the right CTA
  useEffect(() => {
    if (roleKey !== 'vendor') return;
    api.get('/my/shops')
      .then((res) => setHasShop((res.data.data?.length ?? 0) > 0))
      .catch(() => setHasShop(false));
  }, [roleKey]);

  const vendorCta = hasShop
    ? { label: 'Crear nuevo producto', to: '/dashboard/products/new', icon: <ShoppingBag className="w-5 h-5" /> }
    : { label: 'Crear mi tienda', to: '/dashboard/store/new', icon: <Store className="w-5 h-5" /> };

  const content = {
    ...HERO_CONTENT[roleKey],
    ...(roleKey === 'vendor' && hasShop !== null ? { cta: vendorCta } : {}),
  };

  const title = (roleKey === 'vendor' ? heroBanner?.vendor_title : heroBanner?.buyer_title)
    || heroBanner?.title
    || content.title;
  const accent = title === content.title ? content.accent : '';
  const description = (roleKey === 'vendor' ? heroBanner?.vendor_description : heroBanner?.buyer_description)
    || heroBanner?.description
    || content.description;

  // Force 1080p: escucha los eventos reales del player y responde cuando está listo
  useEffect(() => {
    if (!youtubeEmbed) return;
    const forceQuality = () => {
      try {
        iframeRef.current?.contentWindow?.postMessage(
          JSON.stringify({ event: 'command', func: 'setPlaybackQuality', args: ['hd1080'] }),
          'https://www.youtube.com'
        );
      } catch (_) {}
    };
    const onMessage = (e) => {
      if (e.origin !== 'https://www.youtube.com') return;
      try {
        const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        // El player avisa cuando está listo o cambia de estado
        if (data.event === 'onReady' || data.event === 'onStateChange') forceQuality();
      } catch (_) {}
    };
    window.addEventListener('message', onMessage);
    // Fallback por si el player no manda eventos (algunos navegadores bloquean)
    const t = setTimeout(forceQuality, 2000);
    return () => { window.removeEventListener('message', onMessage); clearTimeout(t); };
  }, [youtubeEmbed]);

  return (
  <section className="relative bg-primary min-h-[500px] md:min-h-[600px] flex items-center">
    <div className="absolute inset-0 overflow-hidden">
      {/* Overlay gradient — más opaco en mobile para que el texto se lea mejor */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-primary/40 md:from-primary/80 md:via-primary/50 md:to-transparent z-10" />

      {heroBanner?.media_url ? (
        youtubeEmbed ? (
          <>
            {/* Mobile: thumbnail del video (YouTube bloquea autoplay en iframe en iOS/Android) */}
            <img
              src={youtubeThumbnail}
              alt=""
              className="md:hidden absolute inset-0 w-full h-full object-cover object-center"
              onError={(e) => {
                // maxresdefault no siempre existe — cae a hqdefault (480p)
                if (e.target.src.includes('maxresdefault')) {
                  e.target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                }
              }}
            />
            {/* Desktop: iframe con video en loop */}
            <iframe
              ref={iframeRef}
              src={youtubeEmbed}
              title="banner"
              allow="autoplay; encrypted-media; picture-in-picture"
              className="hidden md:block"
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: 'max(100%, 177.78vh)',
                height: 'max(56.25vw, 100%)',
                transform: 'translate(-50%, -50%)',
                border: 'none',
                pointerEvents: 'none',
              }}
            />
          </>
        ) : heroBanner.media_type === 'video' ? (
          <video src={heroBanner.media_url} autoPlay muted loop playsInline className="w-full h-full object-cover" />
        ) : (
          <img src={heroBanner.media_url} alt={title} className="w-full h-full object-cover" />
        )
      ) : (
        <img src="https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=1920&q=80" alt="" className="w-full h-full object-cover" />
      )}
    </div>

    <div className="relative z-20 max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-16 md:py-20">
      <div className="max-w-2xl">
        {content.badge && (
          <div className="inline-flex items-center gap-2 bg-accent/20 text-yellow-300 border border-accent/30 rounded-full px-3 py-1 text-xs md:px-4 md:py-1.5 md:text-sm font-medium mb-4 md:mb-5">
            {content.badge}
          </div>
        )}
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-white mb-4 md:mb-6 leading-tight">
          {title} {accent && <span className="text-accent">{accent}</span>}
        </h1>
        <p className="text-base md:text-xl text-gray-300 mb-6 md:mb-8 leading-relaxed">{description}</p>
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
          {heroBanner?.link_url ? (
            <a href={heroBanner.link_url} className="btn-primary flex items-center justify-center gap-2">
              {heroBanner.link_text || content.cta.label} <ArrowRight className="w-5 h-5" />
            </a>
          ) : (
            <Link to={content.cta.to} className="btn-primary flex items-center justify-center gap-2">
              {content.cta.label} {content.cta.icon}
            </Link>
          )}
          <Link to={content.secondary.to} className="btn-outline border-white text-white hover:bg-white hover:text-primary flex items-center justify-center gap-2">
            {content.secondary.label} <Globe className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  </section>
  );
};

const StatsSection = () => (
  <section className="bg-accent py-8">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {[
          { value: '10,000+', label: 'Productores' },
          { value: '50,000+', label: 'Productos' },
          { value: '25,000+', label: 'Clientes' },
          { value: '98%', label: 'Satisfacción' },
        ].map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-primary">{stat.value}</div>
            <div className="text-sm text-primary/70 font-medium">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const getSectionStyle = (section, fallbackBackground) => ({
  backgroundColor: section?.background_color || fallbackBackground,
  paddingTop: `${section?.padding_top ?? 64}px`,
  paddingBottom: `${section?.padding_bottom ?? 64}px`,
});

const CategoriesSection = ({ categories, section }) => (
  <section style={getSectionStyle(section, '#f9fafb')}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-primary mb-4">{section?.title || 'Explorar Categorías'}</h2>
        <p className="text-text-secondary">{section?.subtitle || 'Navega por nuestras categorías principales'}</p>
      </div>
      <div className={`grid ${getGridClass(section, 6)} gap-4`}>
        {(categories || []).slice(0, 12).map((category) => (
          <Link
            key={category.id || category.name}
            to={category.slug === 'servicios' ? '/services' : `/products?category=${category.slug}`}
            className="card hover:shadow-card transition-shadow cursor-pointer text-center"
          >
            <div className="text-4xl mb-3">{getCategoryIcon(category)}</div>
            <h3 className="font-semibold text-primary text-sm mb-1">{category.name}</h3>
            <p className="text-xs text-text-secondary">Explorar</p>
          </Link>
        ))}
      </div>
    </div>
  </section>
);

const getGridClass = (section, fallback = 4) => {
  const columns = Number(section?.columns || fallback);
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-5',
    6: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
  };

  return gridClasses[columns] || gridClasses[fallback] || gridClasses[4];
};

const getLayoutClass = (section, fallbackColumns = 4) => {
  const layout = section?.layout || 'grid';

  if (layout === 'list') {
    return 'grid grid-cols-1 gap-4';
  }

  if (layout === 'slider') {
    return 'flex gap-6 overflow-x-auto pb-3 snap-x';
  }

  if (layout === 'masonry') {
    return `columns-1 sm:columns-2 lg:columns-${Math.min(Number(section?.columns || fallbackColumns), 4)} gap-6 space-y-6`;
  }

  return `grid ${getGridClass(section, fallbackColumns)} gap-6`;
};

const getLayoutItemClass = (section) => {
  if (section?.layout === 'slider') return 'min-w-[260px] sm:min-w-[300px] snap-start';
  if (section?.layout === 'masonry') return 'mb-6 break-inside-avoid';
  return '';
};

const FeaturedProductsSection = ({ products, section }) => {
  const picked = section?.picked_products;
  const list = picked?.length ? picked : (products || []).slice(0, 8);

  return (
  <section style={getSectionStyle(section, '#ffffff')}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-primary mb-2">{section?.title || 'Productos Destacados'}</h2>
          <p className="text-text-secondary">{section?.subtitle || 'Los mejores productos de nuestros vendedores'}</p>
        </div>
        <Link to="/products" className="text-accent hover:text-accent-hover font-medium flex items-center gap-1">
          Ver todos <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      <div className={getLayoutClass(section, 4)}>
        {list.map((product) => (
          <Link
            key={product.id}
            to={`/products/${product.slug}`}
            className={`card overflow-hidden hover:shadow-card transition-shadow ${getLayoutItemClass(section)}`}
          >
            <div className="aspect-square bg-gray-100 mb-4">
              <img src={getProductImage(product)} alt={product.name} className="w-full h-full object-cover" />
            </div>
            <h3 className="font-semibold text-primary mb-1">{product.name}</h3>
            <p className="text-sm text-text-secondary mb-2">{product.shop?.name || 'Tienda'}</p>
            <div className="flex flex-col gap-1">
              <span className="text-lg font-bold text-accent">${formatPrice(product.price)}</span>
              {product.price_wholesale && (
                <span className="text-xs text-green-600">Mayor: ${formatPrice(product.price_wholesale)}</span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  </section>
  );
};

const StoresSection = ({ shops, section }) => (
  <section style={getSectionStyle(section, '#f9fafb')}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-primary mb-2">{section?.title || 'Tiendas Destacadas'}</h2>
          <p className="text-text-secondary">{section?.subtitle || 'Las mejores tiendas en nuestra plataforma'}</p>
        </div>
        <Link to="/stores" className="text-accent hover:text-accent-hover font-medium flex items-center gap-1">
          Ver todas <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      <div className={getLayoutClass(section, 3)}>
        {(shops || []).slice(0, 6).map((shop) => (
          <Link
            key={shop.id}
            to={`/stores/${shop.slug}`}
            className={`card p-6 hover:shadow-card transition-shadow ${getLayoutItemClass(section)}`}
          >
            <div className="flex items-center gap-4 mb-4">
              <img src={getShopLogo(shop)} alt={shop.name} className="w-16 h-16 rounded-xl object-cover" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-primary">{shop.name}</h3>
                  {shop.is_verified && <CheckCircle className="w-4 h-4 text-blue-500" />}
                </div>
                <p className="text-sm text-text-secondary">{shop.city}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-text-secondary">
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {shop.city}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  </section>
);

const BannerSection = ({ section, banners }) => {
  // For banner section type, find banner by position (between_sections for promo banners)
  const bannerPosition = section.key === 'promo_banner' ? 'between_sections' : 'between_sections';
  const banner = banners?.find(b => b.position === bannerPosition && b.is_active);
  const bannerMedia = banner || section; // fallback to section data for title/subtitle

  return (
    <section style={getSectionStyle(section, '#fef3c7')}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to={bannerMedia.link_url || '/products'} className="block relative rounded-2xl overflow-hidden">
          {bannerMedia.media_url ? (
            <img src={bannerMedia.media_url} alt={bannerMedia.title} className="w-full h-48 object-cover" />
          ) : (
            <div className="w-full h-48 bg-gradient-to-r from-yellow-400 to-yellow-600 flex items-center justify-center">
              <h3 className="text-2xl font-bold text-white">{bannerMedia.title || 'Promoción'}</h3>
            </div>
          )}
        </Link>
      </div>
    </section>
  );
};

const SliderContentSection = ({ section }) => {
  const items = section?.items || [];
  return (
    <section style={getSectionStyle(section, '#ffffff')}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {(section?.title || section?.subtitle) && (
          <div className="text-center mb-8">
            {section?.title && <h2 className="text-3xl font-bold text-primary mb-2">{section.title}</h2>}
            {section?.subtitle && <p className="text-text-secondary">{section.subtitle}</p>}
          </div>
        )}
        {items.length > 0 ? (
          <div className="flex gap-6 overflow-x-auto pb-3 snap-x">
            {items.map((item, i) => (
              <div key={i} className="min-w-[260px] sm:min-w-[300px] snap-start card overflow-hidden">
                {item.image && <img src={item.image} alt={item.title || ''} className="w-full h-40 object-cover" />}
                {item.title && <h3 className="font-semibold text-primary mt-2 px-1">{item.title}</h3>}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
};

const CardsGridSection = ({ section }) => {
  const items = section?.items || [];
  return (
    <section style={getSectionStyle(section, '#ffffff')}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {(section?.title || section?.subtitle) && (
          <div className="text-center mb-8">
            {section?.title && <h2 className="text-3xl font-bold text-primary mb-2">{section.title}</h2>}
            {section?.subtitle && <p className="text-text-secondary">{section.subtitle}</p>}
          </div>
        )}
        {items.length > 0 && (
          <div className={`grid ${getGridClass(section, 3)} gap-6`}>
            {items.map((item, i) => (
              <div key={i} className="card overflow-hidden">
                {item.image && <img src={item.image} alt={item.title || ''} className="w-full h-32 object-cover" />}
                {item.title && <h3 className="font-semibold text-primary mt-2 px-1">{item.title}</h3>}
                {item.description && <p className="text-sm text-text-secondary px-1 pb-2">{item.description}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

const TestimonialsSection = ({ section }) => {
  const items = section?.items || [];
  return (
    <section style={getSectionStyle(section, '#f9fafb')}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-primary mb-2">{section?.title || 'Lo que dicen nuestros clientes'}</h2>
          {section?.subtitle && <p className="text-text-secondary">{section.subtitle}</p>}
        </div>
        {items.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {items.map((item, i) => (
              <div key={i} className="card">
                <p className="text-text-secondary italic mb-3">"{item.quote}"</p>
                <p className="font-semibold text-primary text-sm">{item.author}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

const CustomHtmlSection = ({ section }) => {
  const html = section?.configuration?.html;
  if (!html) return null;
  return (
    <section style={getSectionStyle(section, '#ffffff')}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" dangerouslySetInnerHTML={{ __html: html }} />
    </section>
  );
};

const NewsletterSection = ({ section }) => (
  <section className="text-white" style={getSectionStyle(section, '#0A0A0A')}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-4">{section?.title || 'Suscríbete a nuestro newsletter'}</h2>
        <p className="text-gray-400 mb-8">{section?.subtitle || 'Recibe las mejores ofertas y novedades'}</p>
        <form className="flex flex-col sm:flex-row gap-3" onSubmit={(e) => e.preventDefault()}>
          <div className="flex-1 relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              placeholder="tu@correo.com"
              className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-accent"
            />
          </div>
          <button type="submit" className="btn-primary">
            Suscribirse
          </button>
        </form>
      </div>
    </div>
  </section>
);

const FloatingBanner = ({ banner, side }) => {
  if (!banner) return null;

  const positionClass = side === 'left' ? 'left-4' : 'right-4';

  return (
    <a
      href={banner.link_url || '#'}
      className={`hidden xl:block fixed ${positionClass} top-1/2 -translate-y-1/2 z-40 w-40 overflow-hidden rounded-lg border border-white/20 bg-white shadow-xl`}
      aria-label={banner.title}
    >
      {banner.media_type === 'video' ? (
        <video src={banner.media_url} autoPlay muted loop className="h-56 w-full object-cover" />
      ) : (
        <img src={banner.media_url} alt={banner.title || ''} className="h-56 w-full object-cover" />
      )}
      <div className="p-3">
        <p className="text-sm font-bold text-primary">{banner.title}</p>
        {banner.subtitle && <p className="mt-1 text-xs text-text-secondary">{banner.subtitle}</p>}
      </div>
    </a>
  );
};

const SidebarBannerSection = ({ banner }) => {
  if (!banner) return null;

  return (
    <section className="bg-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <a href={banner.link_url || '#'} className="block overflow-hidden rounded-lg border border-gray-100 shadow-sm">
          {banner.media_type === 'video' ? (
            <video src={banner.media_url} autoPlay muted loop className="h-40 w-full object-cover" />
          ) : (
            <img src={banner.media_url} alt={banner.title || ''} className="h-40 w-full object-cover" />
          )}
        </a>
      </div>
    </section>
  );
};

const PopupBanner = ({ banner }) => {
  const [isOpen, setIsOpen] = useState(Boolean(banner));

  useEffect(() => {
    setIsOpen(Boolean(banner));
  }, [banner?.id]);

  if (!banner || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="relative w-full max-w-lg overflow-hidden rounded-lg bg-white shadow-2xl">
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="absolute right-3 top-3 z-10 rounded-full bg-black/70 p-2 text-white hover:bg-black"
          aria-label="Cerrar popup"
        >
          <X className="h-5 w-5" />
        </button>
        <a href={banner.link_url || '#'} className="block">
          {banner.media_type === 'video' ? (
            <video src={banner.media_url} autoPlay muted loop className="max-h-[70vh] w-full object-cover" />
          ) : (
            <img src={banner.media_url} alt={banner.title || ''} className="max-h-[70vh] w-full object-cover" />
          )}
          <div className="p-5">
            <h2 className="text-xl font-bold text-primary">{banner.title}</h2>
            {banner.subtitle && <p className="mt-2 text-text-secondary">{banner.subtitle}</p>}
            {banner.link_text && <p className="mt-4 font-semibold text-accent">{banner.link_text}</p>}
          </div>
        </a>
      </div>
    </div>
  );
};

const FeaturesSection = () => (
  <section className="py-16 bg-primary text-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">¿Por qué elegir ConImpulso?</h2>
        <p className="text-gray-400">La plataforma diseñada para productores reales</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { icon: Shield, title: 'Compra Directa', desc: 'Sin intermediarios. Hablas directo con el fabricante.' },
          { icon: Truck, title: 'Envíos Seguros', desc: 'Seguimiento en tiempo real y protección al comprador.' },
          { icon: Users, title: 'Comunidad', desc: 'Miles de productores y clientes en una sola plataforma.' },
        ].map((f) => (
          <div key={f.title} className="card-dark text-center">
            <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center mx-auto mb-4">
              <f.icon className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
            <p className="text-gray-400 text-sm">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const CTASection = () => (
  <section className="py-16 bg-accent">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <h2 className="text-3xl font-bold text-primary mb-4">¿Tienes un negocio o fabricas productos?</h2>
      <p className="text-primary/70 text-lg mb-8">
        Únete a miles de productores que ya están vendiendo en ConImpulso.
        Sin comisiones el primer mes.
      </p>
      <Link to="/register" className="btn-secondary inline-flex items-center gap-2">
        Crear mi tienda gratis <ArrowRight className="w-5 h-5" />
      </Link>
    </div>
  </section>
);

const ServicesSection = ({ services }) => {
  if (!services?.length) return null;

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-primary mb-2">Servicios disponibles</h2>
            <p className="text-text-secondary">Encuentra profesionales y soluciones para tu negocio.</p>
          </div>
          <Link to="/services" className="text-accent hover:text-accent-hover font-medium flex items-center gap-1">Ver todos <ArrowRight className="w-4 h-4" /></Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Link key={service.id} to="/services" className="card p-6 hover:shadow-card transition-shadow">
              <div className="w-11 h-11 rounded-xl bg-accent/15 text-accent flex items-center justify-center mb-4"><Wrench className="w-5 h-5" /></div>
              <h3 className="font-semibold text-primary mb-1">{service.name}</h3>
              <p className="text-sm text-text-secondary line-clamp-2 mb-4">{service.description || 'Servicio disponible para cotizar.'}</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-secondary">{service.shop?.name || 'Proveedor'}</span>
                <span className="font-semibold text-accent">{service.price_type === 'quote' ? 'Cotizar' : `$${formatPrice(service.base_price)}`}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

const BlogSection = ({ posts }) => {
  if (!posts?.length) return null;

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-primary mb-2">Historias de la comunidad</h2>
            <p className="text-text-secondary">Conoce productos y emprendimientos que impulsan nuestra comunidad.</p>
          </div>
          <Link to="/blog" className="text-accent hover:text-accent-hover font-medium flex items-center gap-1">Ver blog <ArrowRight className="w-4 h-4" /></Link>
        </div>
        <div className="flex gap-6 overflow-x-auto pb-3 snap-x">
          {posts.map((post) => (
            <Link key={post.id} to={`/blog/${post.slug}`} className="card overflow-hidden min-w-[280px] sm:min-w-[340px] max-w-[340px] snap-start hover:shadow-card transition-shadow">
              <div className="aspect-[16/9] bg-primary/90">
                {post.cover_image ? <img src={post.cover_image} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-accent text-4xl"><Calendar /></div>}
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-primary line-clamp-2">{post.title}</h3>
                {post.excerpt && <p className="mt-2 text-sm text-text-secondary line-clamp-2">{post.excerpt}</p>}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

const DefaultHomepageSections = ({ products, shops, services, posts }) => (
  <>
    {products?.length > 0 && <FeaturedProductsSection products={products} section={{ title: 'Productos recientes', subtitle: 'Nuevos productos publicados por nuestra comunidad', layout: 'slider' }} />}
    {shops?.length > 0 && <StoresSection shops={shops} section={{ title: 'Tiendas recientes', subtitle: 'Conoce los negocios que ya hacen parte de ConImpulso', layout: 'slider' }} />}
    <ServicesSection services={services} />
    <BlogSection posts={posts} />
  </>
);

// Render section based on type
const renderSection = (section, data) => {
  const { type } = section;
  switch (type) {
    case 'featured_products':
      return <FeaturedProductsSection key={section.id} products={data.featured_products} section={section} />;
    case 'categories':
      return <CategoriesSection key={section.id} categories={data.categories} section={section} />;
    case 'stores':
      return <StoresSection key={section.id} shops={data.featured_shops} section={section} />;
    case 'banner':
      return <BannerSection key={section.id} section={section} banners={data.banners} />;
    case 'newsletter':
      return <NewsletterSection key={section.id} section={section} />;
    case 'slider':
      return <SliderContentSection key={section.id} section={section} />;
    case 'cards_grid':
      return <CardsGridSection key={section.id} section={section} />;
    case 'testimonials':
      return <TestimonialsSection key={section.id} section={section} />;
    case 'custom_html':
      return <CustomHtmlSection key={section.id} section={section} />;
    default:
      return null;
  }
};

export default function HomePage() {
  const [homepageData, setHomepageData] = useState({
    banners: [],
    sections: [],
    featured_products: [],
    categories: [],
    featured_shops: [],
    use_default_homepage: false,
    default_products: [],
    default_shops: [],
    default_services: [],
    default_posts: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchHomepageData = async () => {
      try {
        const response = await api.get('/homepage/active');
        if (response.data?.success) {
          setHomepageData(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching homepage data:', error);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchHomepageData();

    const refreshOnFocus = () => fetchHomepageData();
    const refreshOnVisibility = () => {
      if (!document.hidden) fetchHomepageData();
    };
    const refreshOnStorage = (event) => {
      if (event.key === 'homepage_updated_at') fetchHomepageData();
    };

    window.addEventListener('focus', refreshOnFocus);
    document.addEventListener('visibilitychange', refreshOnVisibility);
    window.addEventListener('storage', refreshOnStorage);

    return () => {
      window.removeEventListener('focus', refreshOnFocus);
      document.removeEventListener('visibilitychange', refreshOnVisibility);
      window.removeEventListener('storage', refreshOnStorage);
    };
  }, []);

  const {
    banners, sections, featured_products, categories, featured_shops,
    use_default_homepage, default_products, default_shops, default_services, default_posts,
  } = homepageData;

  // Get hero banner
  const heroBanner = banners?.find(b => b.position === 'hero' && b.is_active);
  const floatingLeftBanner = banners?.find(b => b.position === 'floating_left' && b.is_active);
  const floatingRightBanner = banners?.find(b => b.position === 'floating_right' && b.is_active);
  const sidebarBanner = banners?.find(b => b.position === 'sidebar' && b.is_active);
  const popupBanner = banners?.find(b => b.position === 'popup' && b.is_active);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section - Always first */}
      <HeroSection heroBanner={heroBanner} />

      {/* Static Stats */}
      <StatsSection />

      <SidebarBannerSection banner={sidebarBanner} />

      {/* Dynamic Sections from Editor */}
      {use_default_homepage ? (
        <DefaultHomepageSections
          products={default_products}
          shops={default_shops}
          services={default_services}
          posts={default_posts}
        />
      ) : (
        sections?.filter(s => s.is_active).sort((a, b) => a.order - b.order).map((section) =>
          renderSection(section, { featured_products, categories, featured_shops, banners })
        )
      )}

      {/* Static Features (shown at end) */}
      <FeaturesSection />

      {/* Static CTA */}
      <CTASection />

      <FloatingBanner banner={floatingLeftBanner} side="left" />
      <FloatingBanner banner={floatingRightBanner} side="right" />
      <PopupBanner banner={popupBanner} />
    </div>
  );
}
