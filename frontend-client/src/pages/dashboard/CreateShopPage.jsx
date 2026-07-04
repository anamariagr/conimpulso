import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { Store, Loader2, CheckCircle, Sparkles } from 'lucide-react';
import api from '../../services/api';
import ShopStoryForm from '../../components/forms/ShopStoryForm';
import { SingleImageUploader, GalleryUploader } from '../../components/forms/ImageUploader';

const GALLERY_MIN = 3;

function storyComplete(s) {
  return !!(s.what_we_do && s.founded_year && s.why_started && s.location && s.differentiator);
}

export default function CreateShopPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const isEditMode = location.pathname === '/dashboard/store/edit';
  const nextParam = searchParams.get('next');

  const [form, setForm] = useState({ name: '', description: '', city: '', phone: '', email: '' });
  const [logo, setLogo] = useState('');
  const [gallery, setGallery] = useState([]);
  const [story, setStory] = useState({});
  const [storyErrors, setStoryErrors] = useState({});
  const [shopId, setShopId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    api.get('/my/shops')
      .then((res) => {
        const shop = (res.data.data || [])[0];
        if (isEditMode) {
          if (shop) {
            setShopId(shop.id);
            setForm({ name: shop.name || '', description: shop.description || '', city: shop.city || '', phone: shop.phone || '', email: shop.email || '' });
            if (shop.logo) setLogo(shop.logo);
            if (shop.gallery?.length) setGallery(shop.gallery);
            if (shop.story) setStory(shop.story);
          } else {
            navigate('/dashboard/store/new', { replace: true });
          }
        } else if (shop) {
          // Already has a shop (pending/active/rejected/suspended) — show its status instead of the create form
          navigate('/dashboard/store', { replace: true });
        }
      })
      .catch(() => {
        if (isEditMode) navigate('/dashboard/store/new', { replace: true });
      })
      .finally(() => setLoading(false));
  }, [isEditMode, navigate]);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const validateStory = () => {
    const errs = {};
    if (!story.what_we_do?.trim())     errs.what_we_do     = 'Requerido';
    if (!story.founded_year?.trim())   errs.founded_year   = 'Requerido';
    if (!story.why_started?.trim())    errs.why_started    = 'Requerido';
    if (!story.location?.trim())       errs.location       = 'Requerido';
    if (!story.differentiator?.trim()) errs.differentiator = 'Requerido';
    setStoryErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('El nombre de la tienda es requerido'); return; }
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) {
      setError('El correo electrónico de contacto no es válido');
      return;
    }
    if (!logo) {
      setError('El logo de la tienda es obligatorio');
      document.getElementById('section-images')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    if (!isEditMode && gallery.length < GALLERY_MIN) {
      setError(`Debes subir al menos ${GALLERY_MIN} imágenes de tus productos o tienda`);
      document.getElementById('section-images')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    if (!isEditMode && !validateStory()) {
      setError('Completa la historia de tu emprendimiento para continuar');
      document.getElementById('shop-story-section')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    if (isEditMode && !shopId) {
      navigate('/dashboard/store/new', { replace: true });
      return;
    }
    setSaving(true);
    setError('');
    try {
      const base = { ...form, logo, gallery };
      const payload = isEditMode ? base : { ...base, story };
      if (isEditMode) {
        await api.put(`/shops/${shopId}`, payload);
      } else {
        await api.post('/shops', payload);
      }
      setSuccess(true);
      setTimeout(() => {
        if (nextParam === 'products') navigate('/dashboard/products/new');
        else navigate('/dashboard/store');
      }, 1500);
    } catch (err) {
      const msgs = err.response?.data?.errors;
      setError(msgs ? Object.values(msgs).flat().join(' ') : err.response?.data?.message || 'Error al guardar la tienda');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-96"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>;

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 gap-4">
        <CheckCircle className="w-16 h-16 text-green-500" />
        <p className="text-xl font-semibold text-primary">{isEditMode ? 'Tienda actualizada' : '¡Tienda creada!'}</p>
        <p className="text-gray-500 text-center">
          {!isEditMode && 'Se está generando el post del blog de tu tienda automáticamente ✨'}
          {nextParam === 'products' ? ' Redirigiendo a crear producto...' : ''}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pt-8 px-4">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
          <Store className="w-6 h-6 text-accent" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-primary">{isEditMode ? 'Editar tienda' : 'Crear mi tienda'}</h1>
          <p className="text-gray-500 text-sm">
            {isEditMode ? 'Actualiza los datos de tu tienda' : 'Completa los datos y se publicará un post en el blog automáticamente'}
          </p>
        </div>
      </div>

      {!isEditMode && (
        <div className="bg-accent/5 border border-accent/20 rounded-xl p-4 mb-6 text-sm text-gray-700">
          Tu tienda quedará <strong>pendiente de aprobación</strong>. Podrás crear productos inmediatamente.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}

        {/* Basic info */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400">Información básica</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre de la tienda <span className="text-red-500">*</span></label>
            <input type="text" value={form.name} onChange={(e) => set('name', e.target.value)} className="input-field w-full" placeholder="Ej: Artesanías El Sol" autoFocus />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Descripción</label>
            <textarea value={form.description} onChange={(e) => set('description', e.target.value)} className="input-field w-full" rows={2} placeholder="Cuéntale a tus clientes qué vendes..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Ciudad</label>
            <input type="text" value={form.city} onChange={(e) => set('city', e.target.value)} className="input-field w-full" placeholder="Ej: Bogotá, Medellín, Cali..." />
          </div>
        </div>

        {/* Images */}
        <div id="section-images" className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400">Imágenes</h2>

          <SingleImageUploader
            value={logo}
            onChange={setLogo}
            label="Logo de la tienda"
            hint="Imagen cuadrada recomendada. Formatos: JPG, PNG, WebP. Máx. 5 MB."
            required
          />

          <GalleryUploader
            value={gallery}
            onChange={setGallery}
            min={GALLERY_MIN}
            label="Fotos de productos o tienda"
            required
          />
        </div>

        {/* Contact */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400">Contacto</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Teléfono</label>
              <input type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} className="input-field w-full" placeholder="+57 300 000 0000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Correo electrónico</label>
              <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className="input-field w-full" placeholder="contacto@mitienda.com" />
            </div>
          </div>
        </div>

        {/* Story – only on create */}
        {!isEditMode && (
          <div id="shop-story-section" className="bg-white rounded-xl border-2 border-accent/30 p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h2 className="font-bold text-primary">Historia de tu emprendimiento <span className="text-red-500">*</span></h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  4 preguntas rápidas que usamos para crear un post en el blog y presentar tu tienda a los compradores.
                </p>
              </div>
            </div>

            {storyComplete(story) && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-lg text-sm">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                ¡Listo! El post del blog se generará automáticamente con IA al crear tu tienda
              </div>
            )}

            <ShopStoryForm value={story} onChange={setStory} errors={storyErrors} />
          </div>
        )}

        <div className="flex justify-end gap-3 pb-8">
          <button type="button" onClick={() => navigate(nextParam === 'products' ? '/dashboard/products/new' : '/dashboard/store')} className="btn-outline">
            Cancelar
          </button>
          <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? 'Guardando...' : isEditMode ? 'Guardar cambios' : 'Crear tienda'}
          </button>
        </div>
      </form>
    </div>
  );
}
