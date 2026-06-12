import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, MapPin, Clock, Phone, Mail, Shield, ShoppingBag, MessageSquare, Heart } from 'lucide-react';

const mockShop = {
  id: 1,
  name: 'Cervecería Norteña',
  slug: 'cerveceria-nortena',
  description: 'Somos una cervecería artesanal fundada en 2015, dedicada a crear cerveza de alta calidad con ingredientes locales y procesos tradicionales. Nuestra misión es ofrecer productos únicos que reflejen la cultura y tradición de nuestra región.',
  history: 'Fundada en 2015 por un grupo de amigos apasionados por la cerveza artesanal. Comenzamos en un pequeño garage y hoy somos una de las cervecerías más reconocidas de la región.',
  logo: null,
  banner: 'https://images.unsplash.com/photo-1436076863939-06870fe779c2?w=1200&q=80',
  video: null,
  gallery: [
    'https://images.unsplash.com/photo-1566633806327-68e152aaf26d?w=400&q=80',
    'https://images.unsplash.com/photo-1571613316887-6f8d5cbf7ef7?w=400&q=80',
    'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=400&q=80',
  ],
  phone: '+57 300 123 4567',
  email: 'contacto@cervecerianortena.com',
  address: 'Calle 123 #45-67',
  city: 'Bogotá',
  country: 'Colombia',
  schedule: {
    mon: { open: '09:00', close: '18:00' },
    tue: { open: '09:00', close: '18:00' },
    wed: { open: '09:00', close: '18:00' },
    thu: { open: '09:00', close: '18:00' },
    fri: { open: '09:00', close: '20:00' },
    sat: { open: '10:00', close: '20:00' },
    sun: { open: '10:00', close: '16:00' },
  },
  social_media: {
    facebook: 'cervecerianortena',
    instagram: '@cervecerianortena',
  },
  certifications: ['Registro INVIMA', 'Certificación artesanal'],
  payment_methods: ['cash', 'transfer', 'card'],
  shipping_methods: ['local', 'courier'],
  is_verified: true,
  is_featured: true,
  status: 'active',
  views: 1234,
  followers: 567,
  rating: 4.8,
  total_reviews: 89,
  created_at: '2024-01-15',
};

const mockProducts = [
  { id: 1, name: 'IPA Artesanal', price: '$8,500', originalPrice: '$10,000', images: ['https://images.unsplash.com/photo-1566633806327-68e152aaf26d?w=400&q=80'], rating: 4.9, reviews: 45, sales: 234 },
  { id: 2, name: 'Stout Premium', price: '$9,000', images: ['https://images.unsplash.com/photo-1571613316887-6f8d5cbf7ef7?w=400&q=80'], rating: 4.7, reviews: 32, sales: 189 },
  { id: 3, name: 'Lager Clásica', price: '$7,500', images: ['https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=400&q=80'], rating: 4.5, reviews: 28, sales: 156 },
  { id: 4, name: 'Pack Cerveza Artesanal x6', price: '$45,000', images: ['https://images.unsplash.com/photo-1566633806327-68e152aaf26d?w=400&q=80'], rating: 5.0, reviews: 15, sales: 98 },
];

const mockReviews = [
  { id: 1, user: 'María García', rating: 5, comment: 'Excelente calidad, las mejores artesanales de Bogotá!', date: '2024-03-15' },
  { id: 2, user: 'Juan Rodríguez', rating: 4, comment: 'Muy buena cerveza, delivery un poco lento pero el producto es genial.', date: '2024-03-10' },
  { id: 3, user: 'Ana López', rating: 5, comment: 'Me encanta la IPA, ya es mi cerveza favorita.', date: '2024-03-05' },
];

export default function StoreProfilePage() {
  const { slug } = useParams();
  const [activeTab, setActiveTab] = useState('products');
  const [selectedImage, setSelectedImage] = useState(0);

  const shop = mockShop;

  const dayNames = {
    mon: 'Lunes', tue: 'Martes', wed: 'Miércoles', thu: 'Jueves', fri: 'Viernes', sat: 'Sábado', sun: 'Domingo'
  };

  return (
    <div className="min-h-screen">
      {/* Banner */}
      <div className="h-64 md:h-80 bg-primary relative">
        <img
          src={shop.banner}
          alt={shop.name}
          className="w-full h-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent" />
      </div>

      {/* Profile Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
        <div className="flex flex-col md:flex-row items-start md:items-end gap-6" style={{ background: '#00000099', padding: '21px', borderRadius: '7px' }}>
          <div className="w-32 h-32 bg-accent rounded-2xl flex items-center justify-center border-4 border-white shadow-card">
            <span className="text-5xl font-bold text-primary">{shop.name.charAt(0)}</span>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-white">{shop.name}</h1>
              {shop.is_verified && <Shield className="w-6 h-6 text-blue-400" />}
              {shop.is_featured && <Star className="w-6 h-6 text-accent" />}
            </div>
            <div className="flex flex-wrap items-center gap-4 text-gray-300 text-sm">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" /> {shop.city}, {shop.country}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" /> Abierto ahora
              </span>
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 text-accent" /> {shop.rating} ({shop.total_reviews} reseñas)
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <button className="btn-outline border-white text-white hover:bg-white hover:text-primary">
              <Heart className="w-5 h-5 mr-2" /> Seguir
            </button>
            <button className="btn-primary">
              <MessageSquare className="w-5 h-5 mr-2" /> Contactar
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Info */}
          <div className="space-y-6">
            {/* Quick Info */}
            <div className="card">
              <h3 className="font-semibold text-primary mb-4">Información</h3>
              <div className="space-y-3 text-sm">
                {shop.phone && (
                  <a href={`tel:${shop.phone}`} className="flex items-center gap-3 text-text-secondary hover:text-accent">
                    <Phone className="w-4 h-4" /> {shop.phone}
                  </a>
                )}
                {shop.email && (
                  <a href={`mailto:${shop.email}`} className="flex items-center gap-3 text-text-secondary hover:text-accent">
                    <Mail className="w-4 h-4" /> {shop.email}
                  </a>
                )}
                <div className="flex items-center gap-3 text-text-secondary">
                  <MapPin className="w-4 h-4" /> {shop.address}, {shop.city}
                </div>
              </div>

              {/* Social Media */}
              {shop.social_media && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm text-text-secondary mb-2">Redes sociales</p>
                  <div className="flex gap-3">
                    {shop.social_media.facebook && (
                      <a href={`https://facebook.com/${shop.social_media.facebook}`} target="_blank" rel="noopener" className="text-2xl hover:opacity-70">📘</a>
                    )}
                    {shop.social_media.instagram && (
                      <a href={`https://instagram.com/${shop.social_media.instagram.replace('@', '')}`} target="_blank" rel="noopener" className="text-2xl hover:opacity-70">📷</a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Schedule */}
            <div className="card">
              <h3 className="font-semibold text-primary mb-4">Horario</h3>
              <div className="space-y-2 text-sm">
                {Object.entries(shop.schedule).map(([day, hours]) => (
                  <div key={day} className="flex justify-between">
                    <span className="text-text-secondary">{dayNames[day]}</span>
                    <span className="text-primary">{hours.open} - {hours.close}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Certifications */}
            {shop.certifications && shop.certifications.length > 0 && (
              <div className="card">
                <h3 className="font-semibold text-primary mb-4">Certificaciones</h3>
                <div className="flex flex-wrap gap-2">
                  {shop.certifications.map((cert, i) => (
                    <span key={i} className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm">
                      ✓ {cert}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Tabs */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="flex gap-4 border-b border-gray-200 mb-6">
              {['products', 'about', 'reviews'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 px-1 font-medium transition-colors ${
                    activeTab === tab
                      ? 'text-accent border-b-2 border-accent'
                      : 'text-text-secondary hover:text-primary'
                  }`}
                >
                  {tab === 'products' ? 'Productos' : tab === 'about' ? 'Nosotros' : 'Reseñas'}
                </button>
              ))}
            </div>

            {/* Products Tab */}
            {activeTab === 'products' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-primary">{mockProducts.length} productos</h2>
                  <select className="input-field w-40">
                    <option>Más recientes</option>
                    <option>Precio: menor</option>
                    <option>Precio: mayor</option>
                    <option>Más vendidos</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {mockProducts.map((product) => (
                    <div key={product.id} className="card overflow-hidden hover:shadow-card transition-shadow">
                      <div className="aspect-square bg-gray-100 mb-4 relative">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                        {product.originalPrice && (
                          <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                            -{Math.round((1 - parseFloat(product.price.replace(/[$,]/g, '')) / parseFloat(product.originalPrice.replace(/[$,]/g, ''))) * 100)}%
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-primary mb-1">{product.name}</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="flex items-center gap-1 text-sm">
                          <Star className="w-4 h-4 text-accent" /> {product.rating}
                        </span>
                        <span className="text-text-secondary text-sm">({product.reviews})</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-lg font-bold text-primary">{product.price}</span>
                          {product.originalPrice && (
                            <span className="text-sm text-text-secondary line-through ml-2">{product.originalPrice}</span>
                          )}
                        </div>
                        <button className="btn-primary text-sm py-2">Agregar</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* About Tab */}
            {activeTab === 'about' && (
              <div className="space-y-6">
                <div className="card">
                  <h3 className="font-semibold text-primary mb-4">Descripción</h3>
                  <p className="text-text-secondary leading-relaxed">{shop.description}</p>
                </div>

                <div className="card">
                  <h3 className="font-semibold text-primary mb-4">Nuestra Historia</h3>
                  <p className="text-text-secondary leading-relaxed">{shop.history}</p>
                </div>

                {/* Gallery */}
                {shop.gallery && shop.gallery.length > 0 && (
                  <div className="card">
                    <h3 className="font-semibold text-primary mb-4">Galería</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {shop.gallery.map((img, i) => (
                        <img key={i} src={img} alt="" className="w-full aspect-square object-cover rounded-lg" />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div className="space-y-6">
                {/* Rating Summary */}
                <div className="card flex items-center gap-8">
                  <div className="text-center">
                    <p className="text-5xl font-bold text-accent">{shop.rating}</p>
                    <div className="flex items-center justify-center gap-1 mt-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className={`w-5 h-5 ${star <= shop.rating ? 'text-accent' : 'text-gray-300'}`} />
                      ))}
                    </div>
                    <p className="text-sm text-text-secondary mt-1">{shop.total_reviews} reseñas</p>
                  </div>
                  <div className="flex-1">
                    {[5, 4, 3, 2, 1].map((stars) => (
                      <div key={stars} className="flex items-center gap-2 mb-1">
                        <span className="text-sm text-text-secondary w-8">{stars}★</span>
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-accent rounded-full"
                            style={{ width: `${stars * 20}%` }}
                          />
                        </div>
                        <span className="text-xs text-text-secondary w-8">{Math.round(100 - stars * 15)}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Review List */}
                <div className="space-y-4">
                  {mockReviews.map((review) => (
                    <div key={review.id} className="card">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center">
                            <span className="font-bold text-primary">{review.user.charAt(0)}</span>
                          </div>
                          <div>
                            <p className="font-medium text-primary">{review.user}</p>
                            <p className="text-xs text-text-secondary">{review.date}</p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className={`w-4 h-4 ${star <= review.rating ? 'text-accent' : 'text-gray-300'}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-text-secondary">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}