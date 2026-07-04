import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Package, Loader2, CheckCircle, Store, Sparkles } from 'lucide-react';
import api from '../../services/api';
import ProductStoryForm from '../../components/forms/ProductStoryForm';
import { GalleryUploader } from '../../components/forms/ImageUploader';

const STATUSES = [
  { value: 'draft', label: 'Borrador (no visible al público)' },
  { value: 'active', label: 'Activo (visible al público)' },
  { value: 'inactive', label: 'Inactivo' },
];

function storyComplete(story) {
  return !!(story.materials && story.process && story.time && story.ideal_for && story.unique);
}

export default function CreateProductPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const shopId = searchParams.get('shop_id');

  const [shop, setShop] = useState(null);
  const [loadingShop, setLoadingShop] = useState(true);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    price_wholesale: '',
    stock: '',
    minimum_quantity: '',
    status: 'draft',
    allow_quotation: false,
  });
  const [images, setImages] = useState([]);
  const [story, setStory] = useState({});
  const [storyErrors, setStoryErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!shopId) { navigate('/dashboard/products/new'); return; }
    api.get('/my/shops')
      .then((res) => {
        const found = (res.data.data || []).find((s) => String(s.id) === String(shopId));
        setShop(found || null);
      })
      .catch(() => {})
      .finally(() => setLoadingShop(false));
  }, [shopId]);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const validateStory = () => {
    const errs = {};
    if (!story.materials?.trim()) errs.materials = 'Requerido';
    if (!story.process?.trim())   errs.process   = 'Requerido';
    if (!story.time?.trim())      errs.time       = 'Requerido';
    if (!story.ideal_for?.trim()) errs.ideal_for  = 'Requerido';
    if (!story.unique?.trim())    errs.unique     = 'Requerido';
    setStoryErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('El nombre del producto es requerido'); return; }
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) < 0) {
      setError('El precio debe ser un número válido'); return;
    }
    if (!validateStory()) {
      setError('Completa la historia del producto para continuar (son solo 5 preguntas rápidas)');
      document.getElementById('story-section')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = {
        shop_id:          Number(shopId),
        name:             form.name,
        description:      form.description || undefined,
        price:            Number(form.price),
        price_wholesale:  form.price_wholesale ? Number(form.price_wholesale) : undefined,
        stock:            form.stock !== '' ? Number(form.stock) : undefined,
        minimum_quantity: form.minimum_quantity ? Number(form.minimum_quantity) : undefined,
        status:           form.status,
        allow_quotation:  form.allow_quotation,
        images:           images.length > 0 ? images : undefined,
        story,
      };
      await api.post('/products', payload);
      setSuccess(true);
      setTimeout(() => navigate('/dashboard/products'), 1800);
    } catch (err) {
      const msgs = err.response?.data?.errors;
      setError(msgs ? Object.values(msgs).flat().join(' ') : err.response?.data?.message || 'Error al crear el producto');
    } finally {
      setSaving(false);
    }
  };

  if (loadingShop) {
    return <div className="flex items-center justify-center min-h-96"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>;
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 gap-4">
        <CheckCircle className="w-16 h-16 text-green-500" />
        <p className="text-xl font-semibold text-primary">¡Producto creado!</p>
        <p className="text-gray-500 text-center">Tu producto fue publicado y se está generando el post del blog automáticamente ✨</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pt-8 px-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
          <Package className="w-6 h-6 text-accent" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-primary">Nuevo producto</h1>
          <p className="text-gray-500 text-sm">Se publicará un post en el blog automáticamente</p>
        </div>
      </div>

      {/* Shop context */}
      {shop && (
        <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3 mb-6">
          <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
            {shop.logo
              ? <img src={shop.logo} alt={shop.name} className="w-full h-full object-cover rounded-lg" />
              : <span className="text-accent font-bold">{shop.name.charAt(0)}</span>
            }
          </div>
          <p className="text-sm font-medium text-primary flex-1">Publicando en: <strong>{shop.name}</strong></p>
          <button type="button" onClick={() => navigate('/dashboard/products/new')} className="text-xs text-accent hover:underline flex items-center gap-1">
            <Store className="w-3.5 h-3.5" /> Cambiar
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>
        )}

        {/* Basic info */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400">Información del producto</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre <span className="text-red-500">*</span></label>
            <input type="text" value={form.name} onChange={(e) => set('name', e.target.value)} className="input-field w-full" placeholder="Ej: Camiseta de algodón premium" autoFocus />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Descripción corta</label>
            <textarea value={form.description} onChange={(e) => set('description', e.target.value)} className="input-field w-full" rows={2} placeholder="Descripción breve visible en el catálogo..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Estado</label>
            <select value={form.status} onChange={(e) => set('status', e.target.value)} className="input-field w-full">
              {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <GalleryUploader
            value={images}
            onChange={setImages}
            min={0}
            label="Fotos del producto"
            hint="Agrega hasta 10 fotos. La primera imagen será la portada."
          />
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400">Precios e inventario</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Precio detal <span className="text-red-500">*</span></label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                <input type="number" min="0" step="any" value={form.price} onChange={(e) => set('price', e.target.value)} className="input-field w-full pl-7" placeholder="0" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Precio mayoreo</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                <input type="number" min="0" step="any" value={form.price_wholesale} onChange={(e) => set('price_wholesale', e.target.value)} className="input-field w-full pl-7" placeholder="Opcional" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Unidades disponibles</label>
              <input type="number" min="0" value={form.stock} onChange={(e) => set('stock', e.target.value)} className="input-field w-full" placeholder="Dejar en blanco = ilimitado" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Cantidad mínima</label>
              <input type="number" min="1" value={form.minimum_quantity} onChange={(e) => set('minimum_quantity', e.target.value)} className="input-field w-full" placeholder="1" />
            </div>
          </div>
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div onClick={() => set('allow_quotation', !form.allow_quotation)} className={`w-10 h-6 rounded-full transition-colors flex items-center px-1 ${form.allow_quotation ? 'bg-accent' : 'bg-gray-200'}`}>
              <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${form.allow_quotation ? 'translate-x-4' : 'translate-x-0'}`} />
            </div>
            <span className="text-sm text-gray-700">Permitir cotizaciones</span>
          </label>
        </div>

        {/* Story – blog section */}
        <div id="story-section" className="bg-white rounded-xl border-2 border-accent/30 p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="font-bold text-primary">Historia del producto <span className="text-red-500">*</span></h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Con estas respuestas generamos automáticamente un post en el blog para atraer compradores.
                Son 5 preguntas rápidas — ¡menos de 3 minutos!
              </p>
            </div>
          </div>

          {storyComplete(story) && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-lg text-sm">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              ¡Listo! Tu post del blog se generará automáticamente con IA al guardar
            </div>
          )}

          <ProductStoryForm value={story} onChange={setStory} errors={storyErrors} />
        </div>

        <div className="flex justify-end gap-3 pb-8">
          <button type="button" onClick={() => navigate('/dashboard/products')} className="btn-outline">Cancelar</button>
          <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? 'Creando...' : 'Crear producto'}
          </button>
        </div>
      </form>
    </div>
  );
}
