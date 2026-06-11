import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Plus, ChevronRight, Package, Loader2 } from 'lucide-react';
import api from '../../services/api';

const STATUS_LABELS = {
  active: 'Activa',
  pending: 'Pendiente de aprobación',
  suspended: 'Suspendida',
  rejected: 'Rechazada',
  draft: 'Borrador',
  inactive: 'Inactiva',
};

const STATUS_DOT = {
  active: 'bg-green-500',
  pending: 'bg-yellow-500',
  suspended: 'bg-red-500',
  rejected: 'bg-red-500',
  draft: 'bg-gray-400',
  inactive: 'bg-gray-400',
};

export default function NewProductGatePage() {
  const navigate = useNavigate();
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState('choice'); // 'choice' | 'pick-shop'

  useEffect(() => {
    api.get('/my/shops')
      .then((res) => setShops(res.data.data || []))
      .catch(() => setShops([]))
      .finally(() => setLoading(false));
  }, []);

  const goCreateShop = () => navigate('/dashboard/store/new?next=products');
  const goCreateProduct = (shopId) => navigate(`/dashboard/products/create?shop_id=${shopId}`);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  // ── No shops: must create one first ──
  if (shops.length === 0) {
    return (
      <div className="max-w-lg mx-auto pt-12 px-4">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 text-center">
          <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Store className="w-8 h-8 text-accent" />
          </div>
          <h1 className="text-2xl font-bold text-primary mb-2">Primero necesitas una tienda</h1>
          <p className="text-gray-500 mb-8 leading-relaxed">
            Para publicar productos debes tener al menos una tienda activa. Créala ahora — solo toma un minuto.
          </p>
          <button
            onClick={goCreateShop}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-accent text-primary font-semibold rounded-xl hover:bg-yellow-400 transition"
          >
            <Plus className="w-5 h-5" />
            Crear mi tienda
          </button>
        </div>
      </div>
    );
  }

  // ── Has shops: show choice ──
  if (step === 'choice') {
    return (
      <div className="max-w-lg mx-auto pt-12 px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-primary">Nuevo producto</h1>
          <p className="text-gray-500 mt-1">¿En qué tienda quieres publicar este producto?</p>
        </div>

        <div className="space-y-4">
          {/* Option A: existing shop */}
          <button
            onClick={() => {
              if (shops.length === 1) {
                goCreateProduct(shops[0].id);
              } else {
                setStep('pick-shop');
              }
            }}
            className="w-full bg-white rounded-xl border-2 border-gray-200 hover:border-accent p-5 text-left flex items-center gap-4 transition group"
          >
            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <Store className="w-6 h-6 text-accent" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-primary group-hover:text-accent transition">
                Usar tienda existente
              </p>
              <p className="text-sm text-gray-500">
                {shops.length === 1
                  ? `Publicar en "${shops[0].name}"`
                  : `Tienes ${shops.length} tiendas disponibles`}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-accent transition" />
          </button>

          {/* Option B: new shop */}
          <button
            onClick={goCreateShop}
            className="w-full bg-white rounded-xl border-2 border-gray-200 hover:border-accent p-5 text-left flex items-center gap-4 transition group"
          >
            <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center flex-shrink-0">
              <Plus className="w-6 h-6 text-primary group-hover:text-accent transition" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-primary group-hover:text-accent transition">
                Crear nueva tienda
              </p>
              <p className="text-sm text-gray-500">Abre una tienda diferente para este producto</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-accent transition" />
          </button>
        </div>
      </div>
    );
  }

  // ── Pick from existing shops ──
  return (
    <div className="max-w-lg mx-auto pt-12 px-4">
      <div className="mb-6">
        <button
          onClick={() => setStep('choice')}
          className="text-sm text-gray-500 hover:text-primary flex items-center gap-1 mb-4"
        >
          ← Volver
        </button>
        <h1 className="text-2xl font-bold text-primary">Selecciona una tienda</h1>
        <p className="text-gray-500 mt-1">El producto se publicará en la tienda que elijas.</p>
      </div>

      <div className="space-y-3">
        {shops.map((shop) => (
          <button
            key={shop.id}
            onClick={() => goCreateProduct(shop.id)}
            className="w-full bg-white rounded-xl border-2 border-gray-200 hover:border-accent p-4 text-left flex items-center gap-4 transition group"
          >
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
              {shop.logo ? (
                <img src={shop.logo} alt={shop.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-accent font-bold text-lg">{shop.name.charAt(0)}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-primary group-hover:text-accent transition truncate">
                {shop.name}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`w-2 h-2 rounded-full ${STATUS_DOT[shop.status] || 'bg-gray-400'}`} />
                <span className="text-xs text-gray-500">
                  {STATUS_LABELS[shop.status] || shop.status}
                </span>
                <span className="text-xs text-gray-400">· {shop.products_count || 0} productos</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {shop.status !== 'active' && shop.status !== 'pending' && (
                <span className="text-xs text-red-500 font-medium">No disponible</span>
              )}
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-accent transition" />
            </div>
          </button>
        ))}

        <button
          onClick={goCreateShop}
          className="w-full border-2 border-dashed border-gray-300 hover:border-accent rounded-xl p-4 flex items-center justify-center gap-2 text-gray-400 hover:text-accent transition"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Crear nueva tienda</span>
        </button>
      </div>
    </div>
  );
}
