import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Star, Store, Tag, Clock, Package, ShoppingCart, MessageSquare, Wrench, ChevronLeft, ChevronRight, Share2, Pencil, X, Send, Home, MessageCircle } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useCartStore } from '../../stores/cartStore';
import { useSiteStore } from '../../stores/siteStore';
import { useAuthStore } from '../../stores/authStore';

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
          <Star key={s} className={`w-4 h-4 ${s <= Math.round(value) ? 'fill-accent-400 text-accent-400' : 'text-gray-300'}`} />
        ))}
      </div>
      <span className="text-sm text-gray-500">{value?.toFixed(1)} ({count} reseñas)</span>
    </div>
  );
}

export default function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { wompiEnabled, fetchSettings } = useSiteStore();
  const { user } = useAuthStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactType, setContactType] = useState('contact'); // 'contact' | 'quote'
  const [contactForm, setContactForm] = useState({ message: '', contact_phone: '', quantity: 1, delivery_address: '' });
  const [codForm, setCodForm] = useState({ full_name: '', document_id: '', contact_phone: '', delivery_address: '' });
  const [sending, setSending] = useState(false);
  const [paymentStep, setPaymentStep] = useState('method'); // 'method' | 'form'
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [checkingWompi, setCheckingWompi] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  // Pre-fill "pago en casa" with whatever is already on file — only the missing fields stay empty.
  useEffect(() => {
    if (paymentMethod !== 'cod' || paymentStep !== 'form') return;
    setCodForm((f) => ({
      full_name: f.full_name || user?.name || '',
      document_id: f.document_id || user?.document_id || '',
      contact_phone: f.contact_phone || user?.phone || '',
      delivery_address: f.delivery_address || user?.address || '',
    }));
  }, [paymentMethod, paymentStep, user]);

  useEffect(() => { fetchSettings(); }, []);

  // After returning from the Wompi checkout redirect (?wompi=1&id=<transaction_id>)
  useEffect(() => {
    const transactionId = searchParams.get('id');
    if (!searchParams.get('wompi') || !transactionId) return;

    setCheckingWompi(true);
    api.get(`/products/wompi/status/${transactionId}`)
      .then((res) => {
        const status = res.data?.data?.status;
        if (status === 'paid') {
          toast.success('¡Pago confirmado! Ya avisamos al vendedor para que coordine la entrega.');
        } else if (status === 'failed') {
          toast.error('El pago no se completó con Wompi.');
        } else {
          toast('Tu pago sigue en proceso. Te avisaremos cuando se confirme.', { icon: '⏳' });
        }
      })
      .catch(() => toast.error('No pudimos confirmar el estado del pago con Wompi.'))
      .finally(() => {
        setCheckingWompi(false);
        searchParams.delete('wompi');
        searchParams.delete('id');
        setSearchParams(searchParams, { replace: true });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const isWholesale = product.price_wholesale && quantity >= (product.minimum_wholesale_quantity || 5);
  const displayPrice = isWholesale ? product.price_wholesale : product.price;
  const wholesaleDiscount = product.price_wholesale
    ? Math.round(((product.price - product.price_wholesale) / product.price) * 100)
    : null;

  const openContact = (type = 'contact') => {
    setContactType(type);
    setContactForm({ message: '', contact_phone: '', quantity });
    setPaymentStep('method');
    setPaymentMethod(null);
    setShowContactModal(true);
  };

  const handleContact = () => openContact('contact');
  const handleQuote = () => openContact('quote');

  const handleSendRequest = async (e) => {
    e.preventDefault();
    if (!contactForm.message.trim()) { toast.error('Escribe un mensaje'); return; }
    if (sending) return;
    setSending(true);
    try {
      const res = await api.post('/purchase-requests', {
        product_id: product.id,
        message: contactForm.message,
        contact_phone: contactForm.contact_phone,
        quantity: contactForm.quantity || 1,
      });
      toast.success('¡Solicitud enviada! Te llevamos a tu conversación con el vendedor.');
      setShowContactModal(false);
      const messageId = res.data?.data?.message_id;
      navigate(`/dashboard/messages?tab=sent${messageId ? `&open=${messageId}` : ''}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al enviar solicitud');
    } finally {
      setSending(false);
    }
  };

  const handlePayWithWompi = async (e) => {
    e.preventDefault();
    const qty = parseInt(contactForm.quantity);
    if (!qty || qty < 1) { toast.error('Ingresa una cantidad válida'); return; }
    if (sending) return;
    setSending(true);
    try {
      const res = await api.post('/products/wompi/init', {
        product_id: product.id,
        quantity: qty,
        contact_phone: contactForm.contact_phone,
        delivery_address: contactForm.delivery_address,
      });
      const { checkout_url, params } = res.data.data;
      const url = new URL(checkout_url);
      Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
      window.location.href = url.toString();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al iniciar el pago con Wompi');
      setSending(false);
    }
  };

  const handleCodOrder = async (e) => {
    e.preventDefault();
    const qty = parseInt(contactForm.quantity);
    if (!qty || qty < 1) { toast.error('Ingresa una cantidad válida'); return; }
    if (!codForm.full_name.trim() || !codForm.document_id.trim() || !codForm.contact_phone.trim() || !codForm.delivery_address.trim()) {
      toast.error('Completa todos los datos para el pago en casa');
      return;
    }
    if (sending) return;
    setSending(true);
    try {
      await api.post('/products/orders/cod', {
        product_id: product.id,
        quantity: qty,
        full_name: codForm.full_name,
        document_id: codForm.document_id,
        contact_phone: codForm.contact_phone,
        delivery_address: codForm.delivery_address,
      });
      toast.success('¡Pedido registrado! El vendedor coordinará la entrega y el pago en efectivo.');
      setShowContactModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al registrar el pedido');
    } finally {
      setSending(false);
    }
  };

  const handleSendQuote = async (e) => {
    e.preventDefault();
    const qty = parseInt(contactForm.quantity);
    if (!qty || qty < 1) { toast.error('Ingresa una cantidad válida'); return; }
    if (sending) return;
    setSending(true);
    try {
      await api.post('/quote-requests', {
        product_id: product.id,
        quantity: qty,
      });
      toast.success('¡Cotización enviada al vendedor!');
      setShowContactModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al enviar cotización');
    } finally {
      setSending(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    toast.success('Enlace copiado');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <a
        href="https://wa.me/573170999213?text=Hola%2C%20quiero%20consultar%20por%20este%20producto."
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-5 right-5 z-50 flex h-[120px] w-[120px] items-center justify-center rounded-full padding-color transition-transform hover:scale-105"
        aria-label="WhatsApp"
      >
        <div className="relative flex h-full w-full items-center justify-center rounded-[46%] padding-color">
          <div className="flex h-full w-full items-center justify-center rounded-[42%] bg-[#1EBE4B]">
            <i className="bi bi-whatsapp text-[64px] leading-none text-white" aria-hidden="true" />
          </div>
        </div>
      </a>

      {checkingWompi && (
        <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-xl flex items-center gap-3 text-sm text-purple-700">
          <div className="w-5 h-5 border-2 border-[#7B2FBE] border-t-transparent rounded-full animate-spin flex-shrink-0" />
          Confirmando tu pago con Wompi...
        </div>
      )}

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
                ${parseFloat(displayPrice).toLocaleString('es-CO', { maximumFractionDigits: 0 })}
              </span>
              {isWholesale && (
                <span className="text-sm text-gray-400 line-through">
                  ${parseFloat(product.price).toLocaleString('es-CO', { maximumFractionDigits: 0 })}
                </span>
              )}
            </div>
            {product.price_wholesale && (
              <div className="flex flex-wrap gap-2 text-sm">
                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                  -{wholesaleDiscount}% mayoreo
                </span>
                <span className="text-gray-500">
                  Precio mayoreo: ${parseFloat(product.price_wholesale).toLocaleString('es-CO', { maximumFractionDigits: 0 })}
                  (mín. {product.minimum_wholesale_quantity || 5} unidades)
                </span>
              </div>
            )}
          </div>

          {/* Stock & Status */}
          <div className="flex flex-wrap gap-3">
            {product.stock !== null && (
              <div className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full ${
                product.stock > 10 ? 'bg-green-100 text-green-700' :
                product.stock > 0 ? 'bg-accent-100 text-accent-700' :
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
              <div className="flex items-center gap-1.5 text-sm text-accent-700 bg-accent-100 px-3 py-1.5 rounded-full">
                <Star className="w-4 h-4 fill-accent-500" />
                Destacado
              </div>
            )}
          </div>

          {/* Quantity & Actions */}
          <div className="space-y-3">
            {is_owner ? (
              /* Owner view: only edit button */
              <div className="bg-accent-50 border border-accent-200 rounded-xl p-4 flex items-center justify-between gap-3">
                <p className="text-sm text-accent-700 font-medium">Estás viendo tu producto como lo ven los compradores</p>
                <Link
                  to={`/dashboard/products/${product.slug || product.id}/edit`}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors text-sm flex-shrink-0"
                >
                  <Pencil className="w-4 h-4" />
                  Editar producto
                </Link>
              </div>
            ) : (
              /* Buyer view: contact + quotation */
              <>
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
                  <ShoppingCart className="w-5 h-5" />
                  Comprar
                </button>

                <button
                  onClick={() => {
                    addItem(product, quantity);
                    toast.success(`"${product.name}" agregado al carrito`, { icon: '🛒' });
                  }}
                  className="w-full flex items-center justify-center gap-2 border-2 border-primary text-primary font-semibold py-3 rounded-xl hover:bg-primary/5 transition-colors"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Agregar al carrito
                </button>

                <a
                  href={`https://wa.me/573170999213?text=${encodeURIComponent(`Hola, quiero consultar por el producto: ${product.name}. Quiero ${quantity} unidad(es).`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-[#25D366] text-white font-semibold py-3 rounded-xl hover:bg-[#20bd5a] transition-colors"
                >
                  <MessageSquare className="w-5 h-5" />
                  Llevar a WhatsApp 3170999213
                </a>

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
              </>
            )}
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
                    {v.price && <span className="font-medium">${parseFloat(v.price).toLocaleString('es-CO', { maximumFractionDigits: 0 })}</span>}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Comprar / Cotizar modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto scrollbar-accent">

            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                {contactType === 'contact' && paymentStep === 'form' && (
                  <button onClick={() => setPaymentStep('method')} className="p-1 hover:bg-gray-100 rounded-lg mr-1">
                    <ChevronLeft className="w-5 h-5 text-gray-500" />
                  </button>
                )}
                <h3 className="text-lg font-bold text-gray-900">
                  {contactType === 'quote' ? 'Solicitar cotización' : 'Comprar'}
                </h3>
              </div>
              <button onClick={() => setShowContactModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* ── COTIZACIÓN: solo cantidad ── */}
            {contactType === 'quote' && (
              <form onSubmit={handleSendQuote} className="space-y-5">
                {/* Badge por mayor */}
                <div className="flex items-center justify-center">
                  <span className="inline-flex items-center gap-1.5 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full tracking-wide uppercase">
                    <Package className="w-3.5 h-3.5" />
                    Compra por mayor
                  </span>
                </div>

                <div className="p-3 bg-accent-50 border border-accent-200 rounded-xl text-sm text-accent-800">
                  El vendedor recibirá tu solicitud y te responderá con el precio unitario y el total.
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ¿Cuántas unidades necesitas?
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={contactForm.quantity}
                    onChange={(e) => setContactForm((f) => ({ ...f, quantity: parseInt(e.target.value) || 1 }))}
                    className="input-field w-full text-lg font-semibold text-center"
                    autoFocus
                  />
                  <p className="text-xs text-gray-400 mt-1 text-center">Solo números — sin mensajes ni datos de contacto</p>
                </div>

                {product?.price && (
                  <div className="bg-gray-50 rounded-xl p-3 text-sm text-center text-gray-500">
                    Precio referencia: <strong className="text-gray-900">${parseFloat(product.price).toLocaleString('es-CO')}</strong> c/u
                  </div>
                )}

                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowContactModal(false)}
                    className="flex-1 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 font-medium text-sm">
                    Cancelar
                  </button>
                  <button type="submit" disabled={sending}
                    className="flex-1 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 text-sm">
                    <Send className="w-4 h-4" />
                    {sending ? 'Enviando...' : 'Solicitar cotización'}
                  </button>
                </div>
              </form>
            )}

            {/* ── COMPRAR paso 1: método de pago ── */}
            {contactType === 'contact' && paymentStep === 'method' && (
              <div className="space-y-3">
                <p className="text-sm text-gray-500 mb-4">Selecciona cómo quieres pagar</p>

                <button
                  onClick={() => { if (wompiEnabled) { setPaymentMethod('wompi'); setPaymentStep('form'); } }}
                  disabled={!wompiEnabled}
                  className="w-full flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-primary/40 hover:bg-gray-50 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:bg-transparent"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#7B2FBE]/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-[#7B2FBE] font-bold text-sm">W</span>
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">Wompi</p>
                    <p className="text-xs text-gray-400">Tarjeta crédito / débito, Nequi, Bancolombia</p>
                  </div>
                  {!wompiEnabled && (
                    <span className="ml-auto text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">Próximamente</span>
                  )}
                </button>

                <button
                  onClick={() => { setPaymentMethod('cod'); setPaymentStep('form'); }}
                  className="w-full flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-primary/40 hover:bg-gray-50 transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Home className="w-5 h-5 text-green-700" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">Pago en casa</p>
                    <p className="text-xs text-gray-400">Pagas en efectivo cuando te llega el pedido</p>
                  </div>
                </button>

                <button
                  onClick={() => { setPaymentMethod('vendor'); setPaymentStep('form'); }}
                  className="w-full flex items-center gap-4 p-4 border-2 border-accent rounded-xl bg-accent/5 hover:bg-accent/10 transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">Cuadrar pago con el vendedor</p>
                    <p className="text-xs text-gray-500">El equipo te contacta para coordinar el pago</p>
                  </div>
                </button>
              </div>
            )}

            {/* ── COMPRAR paso 2: formulario solicitud ── */}
            {contactType === 'contact' && paymentStep === 'form' && paymentMethod === 'vendor' && (
              <form onSubmit={handleSendRequest} className="space-y-4">
                <div className="p-3 bg-blue-50 rounded-xl text-sm text-blue-700">
                  Tu solicitud será revisada y el equipo se pondrá en contacto contigo a la brevedad.
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
                  <input
                    type="number"
                    min="1"
                    value={contactForm.quantity}
                    onChange={(e) => setContactForm((f) => ({ ...f, quantity: parseInt(e.target.value) || 1 }))}
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tu teléfono (opcional)</label>
                  <input
                    type="tel"
                    placeholder="Ej: 3001234567"
                    value={contactForm.contact_phone}
                    onChange={(e) => setContactForm((f) => ({ ...f, contact_phone: e.target.value }))}
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mensaje *</label>
                  <textarea
                    rows={3}
                    placeholder={contactType === 'quote'
                      ? 'Describe lo que necesitas: especificaciones, plazos, condiciones...'
                      : '¿Qué te gustaría saber o coordinar con el vendedor?'}
                    value={contactForm.message}
                    onChange={(e) => setContactForm((f) => ({ ...f, message: e.target.value }))}
                    className="input-field w-full"
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowContactModal(false)}
                    className="flex-1 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 font-medium text-sm">
                    Cancelar
                  </button>
                  <button type="submit" disabled={sending}
                    className="flex-1 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 text-sm">
                    <Send className="w-4 h-4" />
                    {sending ? 'Enviando...' : 'Enviar solicitud'}
                  </button>
                </div>
              </form>
            )}

            {/* ── COMPRAR paso 2: pagar con Wompi ── */}
            {contactType === 'contact' && paymentStep === 'form' && paymentMethod === 'wompi' && (
              <form onSubmit={handlePayWithWompi} className="space-y-4">
                <div className="p-3 bg-purple-50 rounded-xl text-sm text-purple-700">
                  Pagas ahora con Wompi. Al confirmarse el pago, el vendedor recibe tus datos para coordinar la entrega directamente contigo.
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
                  <input
                    type="number"
                    min="1"
                    value={contactForm.quantity}
                    onChange={(e) => setContactForm((f) => ({ ...f, quantity: parseInt(e.target.value) || 1 }))}
                    className="input-field w-full"
                  />
                </div>
                {product?.price && (
                  <div className="bg-gray-50 rounded-xl p-3 text-sm text-center text-gray-700">
                    Total a pagar: <strong className="text-gray-900">
                      ${(parseFloat(product.price) * (contactForm.quantity || 1)).toLocaleString('es-CO')}
                    </strong>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tu teléfono</label>
                  <input
                    type="tel"
                    placeholder="Ej: 3001234567"
                    value={contactForm.contact_phone}
                    onChange={(e) => setContactForm((f) => ({ ...f, contact_phone: e.target.value }))}
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dirección de entrega</label>
                  <input
                    type="text"
                    placeholder="Calle, número, ciudad"
                    value={contactForm.delivery_address}
                    onChange={(e) => setContactForm((f) => ({ ...f, delivery_address: e.target.value }))}
                    className="input-field w-full"
                  />
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setPaymentStep('method')}
                    className="flex-1 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 font-medium text-sm">
                    Atrás
                  </button>
                  <button type="submit" disabled={sending}
                    className="flex-1 py-2.5 bg-[#7B2FBE] text-white font-semibold rounded-xl hover:bg-[#6a279f] transition-colors flex items-center justify-center gap-2 disabled:opacity-60 text-sm">
                    {sending ? 'Redirigiendo...' : 'Pagar con Wompi'}
                  </button>
                </div>
              </form>
            )}

            {/* ── COMPRAR paso 2: pago en casa (contra entrega) ── */}
            {contactType === 'contact' && paymentStep === 'form' && paymentMethod === 'cod' && (
              <form onSubmit={handleCodOrder} className="space-y-4">
                <div className="p-3 bg-green-50 rounded-xl text-sm text-green-700">
                  Pagas en efectivo cuando te llega el pedido. Completa (o corrige) tus datos de entrega — la próxima vez ya quedan guardados.
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
                  <input
                    type="number"
                    min="1"
                    value={contactForm.quantity}
                    onChange={(e) => setContactForm((f) => ({ ...f, quantity: parseInt(e.target.value) || 1 }))}
                    className="input-field w-full"
                  />
                </div>
                {product?.price && (
                  <div className="bg-gray-50 rounded-xl p-3 text-sm text-center text-gray-700">
                    Total a pagar en efectivo: <strong className="text-gray-900">
                      ${(parseFloat(product.price) * (contactForm.quantity || 1)).toLocaleString('es-CO')}
                    </strong>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
                  <input
                    type="text"
                    value={codForm.full_name}
                    onChange={(e) => setCodForm((f) => ({ ...f, full_name: e.target.value }))}
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cédula</label>
                  <input
                    type="text"
                    value={codForm.document_id}
                    onChange={(e) => setCodForm((f) => ({ ...f, document_id: e.target.value }))}
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <input
                    type="tel"
                    placeholder="Ej: 3001234567"
                    value={codForm.contact_phone}
                    onChange={(e) => setCodForm((f) => ({ ...f, contact_phone: e.target.value }))}
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dirección de entrega</label>
                  <input
                    type="text"
                    placeholder="Calle, número, ciudad"
                    value={codForm.delivery_address}
                    onChange={(e) => setCodForm((f) => ({ ...f, delivery_address: e.target.value }))}
                    className="input-field w-full"
                  />
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setPaymentStep('method')}
                    className="flex-1 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 font-medium text-sm">
                    Atrás
                  </button>
                  <button type="submit" disabled={sending}
                    className="flex-1 py-2.5 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 text-sm">
                    {sending ? 'Enviando...' : 'Confirmar pedido'}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
