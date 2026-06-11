import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Truck, Users, Star, Zap, Globe, Mail, ShoppingBag, MapPin, CheckCircle, X, Store } from 'lucide-react';
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
const getYouTubeEmbedUrl = (url) => {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  if (!match) return null;
  return `https://www.youtube.com/embed/${match[1]}?autoplay=1&mute=1&loop=1&playlist=${match[1]}&controls=0&modestbranding=1&showinfo=0`;
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
  const youtubeEmbed = heroBanner?.media_type === 'video' ? getYouTubeEmbedUrl(heroBanner?.media_url) : null;

  const roleKey = !isAuthenticated ? 'guest' : isVendor() ? 'vendor' : 'buyer';
  const content = HERO_CONTENT[roleKey];

  // Role-specific text from DB takes priority, then generic banner title, then hardcoded default
  const title = (roleKey === 'vendor' ? heroBanner?.vendor_title : heroBanner?.buyer_title)
    || heroBanner?.title
    || content.title;
  const accent = title === content.title ? content.accent : '';
  const description = (roleKey === 'vendor' ? heroBanner?.vendor_description : heroBanner?.buyer_description)
    || heroBanner?.description
    || content.description;

  return (
  <section className="relative bg-primary min-h-[600px] flex items-center">
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/50 to-transparent z-10"></div>
      {heroBanner?.media_url ? (
        youtubeEmbed ? (
          <iframe
            src={youtubeEmbed}
            className="absolute inset-0 w-full h-full"
            style={{ border: 'none', pointerEvents: 'none', transform: 'scale(1.1)' }}
            allow="autoplay; muted"
            title="banner"
          />
        ) : heroBanner.media_type === 'video' ? (
          <video src={heroBanner.media_url} autoPlay muted loop className="w-full h-full object-cover" />
        ) : (
          <img src={heroBanner.media_url} alt={title} className="w-full h-full object-cover" />
        )
      ) : (
        <img src="https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=1920&q=80" alt="" className="w-full h-full object-cover" />
      )}
    </div>
    <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="max-w-2xl">
        {content.badge && (
          <div className="inline-flex items-center gap-2 bg-accent/20 text-yellow-300 border border-accent/30 rounded-full px-4 py-1.5 text-sm font-medium mb-5">
            {content.badge}
          </div>
        )}
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
          {title} {accent && <span className="text-accent">{accent}</span>}
        </h1>
        <p className="text-xl text-gray-300 mb-8">{description}</p>
        <div className="flex flex-col sm:flex-row gap-4">
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

const FeaturedProductsSection = ({ products, section }) => (
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
        {(products || []).slice(0, 8).map((product) => (
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
    featured_shops: []
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

  const { banners, sections, featured_products, categories, featured_shops } = homepageData;

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
      {sections?.filter(s => s.is_active).sort((a, b) => a.order - b.order).map((section) =>
        renderSection(section, { featured_products, categories, featured_shops, banners })
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
