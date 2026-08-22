import { useState } from 'react';
import { Truck, Save, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const DEFAULT_BANNER = {
  active: true,
  title: '¿Buscas una empresa de envíos confiable?',
  body: 'Inter Bochica ofrece soluciones de logística para tu negocio al mejor precio. Entregamos a tiempo y con cuidado.',
  address: 'Calle 1F 35B-35',
  phone: '',
  cta: 'Conocer más',
  ctaUrl: '',
  bgColor: '#4d3cbb',
  textColor: '#0A0A0A',
};

function loadBanner() {
  try {
    const stored = localStorage.getItem('inter_bochica_banner');
    return stored ? { ...DEFAULT_BANNER, ...JSON.parse(stored) } : { ...DEFAULT_BANNER };
  } catch {
    return { ...DEFAULT_BANNER };
  }
}

export default function LogisticsBannerView() {
  const [form, setForm] = useState(loadBanner);
  const [preview, setPreview] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSave = () => {
    localStorage.setItem('inter_bochica_banner', JSON.stringify(form));
    toast.success('Banner guardado correctamente');
  };

  const handleReset = () => {
    setForm({ ...DEFAULT_BANNER });
    localStorage.removeItem('inter_bochica_banner');
    toast.success('Banner restablecido a valores por defecto');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Banner Publicitario — Inter Bochica</h1>
          <p className="text-gray-500 text-sm mt-1">
            Este banner aparece en el dashboard de vendedores que eligieron recogida en local u otra empresa logística.
          </p>
        </div>
        <button
          onClick={() => setPreview(!preview)}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition"
        >
          {preview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {preview ? 'Editar' : 'Vista previa'}
        </button>
      </div>

      {/* Preview */}
      {preview && (
        <div
          className="rounded-xl p-5 mb-6 flex items-start gap-4 shadow-md"
          style={{ backgroundColor: form.bgColor, color: form.textColor }}
        >
          <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center bg-black/10">
            <Truck className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-lg">{form.title || 'Título del banner'}</p>
            <p className="text-sm mt-1 opacity-80">{form.body || 'Descripción del banner'}</p>
            {form.address && <p className="text-xs mt-1 font-semibold opacity-70">📍 {form.address}</p>}
            {form.phone && <p className="text-xs opacity-70">📞 {form.phone}</p>}
            {form.cta && (
              <span className="inline-block mt-3 px-4 py-1.5 rounded-lg text-sm font-semibold bg-black/15">
                {form.cta}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        {/* Active toggle */}
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
          <input
            type="checkbox"
            id="active"
            name="active"
            checked={form.active}
            onChange={handleChange}
            className="w-5 h-5 rounded border-gray-300 text-accent focus:ring-accent"
          />
          <label htmlFor="active" className="font-medium text-gray-700">
            Banner activo (visible para vendedores)
          </label>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              className="input-field w-full"
              placeholder="¿Buscas una empresa de envíos confiable?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              name="body"
              value={form.body}
              onChange={handleChange}
              rows={3}
              className="input-field w-full resize-none"
              placeholder="Texto descriptivo del banner..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                className="input-field w-full"
                placeholder="Calle 1F 35B-35"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="input-field w-full"
                placeholder="+57 300 123 4567"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Texto del botón</label>
              <input
                type="text"
                name="cta"
                value={form.cta}
                onChange={handleChange}
                className="input-field w-full"
                placeholder="Conocer más"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL del botón</label>
              <input
                type="url"
                name="ctaUrl"
                value={form.ctaUrl}
                onChange={handleChange}
                className="input-field w-full"
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Color de fondo</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  name="bgColor"
                  value={form.bgColor}
                  onChange={handleChange}
                  className="w-10 h-10 rounded border border-gray-200 cursor-pointer p-0.5"
                />
                <input
                  type="text"
                  name="bgColor"
                  value={form.bgColor}
                  onChange={handleChange}
                  className="input-field flex-1"
                  placeholder="#4d3cbb"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Color del texto</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  name="textColor"
                  value={form.textColor}
                  onChange={handleChange}
                  className="w-10 h-10 rounded border border-gray-200 cursor-pointer p-0.5"
                />
                <input
                  type="text"
                  name="textColor"
                  value={form.textColor}
                  onChange={handleChange}
                  className="input-field flex-1"
                  placeholder="#0A0A0A"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-4 border-t border-gray-100">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            Restablecer valores
          </button>
          <button
            onClick={handleSave}
            className="btn-primary flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
}
