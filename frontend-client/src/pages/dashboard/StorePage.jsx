import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Store, Plus, Settings, Palette, Image, Clock, CheckCircle, XCircle, AlertTriangle, ExternalLink, Loader2 } from 'lucide-react';
import api from '../../services/api';

function EmptyState() {
  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Store className="w-8 h-8 text-gray-400" />
        </div>
        <h2 className="text-xl font-semibold text-primary mb-2">Aún no tienes una tienda</h2>
        <p className="text-gray-500 mb-6 max-w-md mx-auto">
          Crea tu tienda en ConImpulso para empezar a vender tus productos o servicios. Personalízala a tu gusto y llega a miles de compradores.
        </p>
        <Link
          to="/dashboard/store/new"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-accent text-primary font-semibold rounded-lg hover:bg-yellow-400 transition"
        >
          <Plus className="w-5 h-5" />
          Crear mi tienda
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center mb-3">
            <Palette className="w-5 h-5 text-accent" />
          </div>
          <h3 className="font-semibold text-primary mb-2">Personalización</h3>
          <p className="text-sm text-gray-500">Elige colores, banner y diseño que represente tu marca.</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center mb-3">
            <Image className="w-5 h-5 text-accent" />
          </div>
          <h3 className="font-semibold text-primary mb-2">Galería</h3>
          <p className="text-sm text-gray-500">Añade fotos, videos y certificaciones de tu negocio.</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center mb-3">
            <Store className="w-5 h-5 text-accent" />
          </div>
          <h3 className="font-semibold text-primary mb-2">Tu perfil público</h3>
          <p className="text-sm text-gray-500">Los compradores podrán ver y buscar tu tienda directamente.</p>
        </div>
      </div>
    </>
  );
}

function PendingState({ shop }) {
  return (
    <div className="bg-white rounded-xl border-2 border-yellow-300 shadow-sm p-10 text-center">
      <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Clock className="w-8 h-8 text-yellow-600" />
      </div>
      <h2 className="text-xl font-semibold text-primary mb-2">Tu tienda está en revisión</h2>
      <p className="text-gray-500 mb-1 max-w-md mx-auto">
        Recibimos tu solicitud para <span className="font-semibold text-primary">"{shop.name}"</span>. Nuestro equipo la está revisando y te notificaremos pronto.
      </p>
      <p className="text-sm text-gray-400 mb-6">El proceso de aprobación suele tomar entre 24 y 48 horas hábiles.</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          to="/dashboard/store/edit"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
        >
          <Settings className="w-4 h-4" />
          Editar información
        </Link>
        <Link
          to="/dashboard/products/new"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-accent text-primary font-semibold rounded-lg hover:bg-yellow-400 transition"
        >
          <Plus className="w-4 h-4" />
          Agregar productos mientras tanto
        </Link>
      </div>
    </div>
  );
}

function ActiveState({ shop }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-start gap-4">
          {shop.logo ? (
            <img src={shop.logo} alt={shop.name} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
          ) : (
            <div className="w-16 h-16 bg-accent/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <Store className="w-8 h-8 text-accent" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-bold text-primary truncate">{shop.name}</h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full flex-shrink-0">
                <CheckCircle className="w-3 h-3" /> Activa
              </span>
            </div>
            {shop.description && <p className="text-sm text-gray-500 line-clamp-2">{shop.description}</p>}
            {shop.city && <p className="text-xs text-gray-400 mt-1">{shop.city}</p>}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            to="/dashboard/store/edit"
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition"
          >
            <Settings className="w-4 h-4" />
            Editar tienda
          </Link>
          {shop.slug && (
            <a
              href={`/stores/${shop.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition"
            >
              <ExternalLink className="w-4 h-4" />
              Ver tienda pública
            </a>
          )}
          <Link
            to="/dashboard/products/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-primary text-sm font-semibold rounded-lg hover:bg-yellow-400 transition"
          >
            <Plus className="w-4 h-4" />
            Agregar producto
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-primary">{shop.products_count ?? 0}</p>
          <p className="text-sm text-gray-500 mt-1">Productos</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-primary">{shop.services_count ?? 0}</p>
          <p className="text-sm text-gray-500 mt-1">Servicios</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-primary">{shop.views ?? 0}</p>
          <p className="text-sm text-gray-500 mt-1">Visitas</p>
        </div>
      </div>
    </div>
  );
}

function RejectedState({ shop }) {
  return (
    <div className="bg-white rounded-xl border-2 border-red-200 shadow-sm p-10 text-center">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <XCircle className="w-8 h-8 text-red-500" />
      </div>
      <h2 className="text-xl font-semibold text-primary mb-2">Tu tienda fue rechazada</h2>
      {shop.rejection_reason && (
        <div className="mb-4 mx-auto max-w-md bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 text-left">
          <span className="font-medium">Motivo:</span> {shop.rejection_reason}
        </div>
      )}
      <p className="text-gray-500 mb-6 max-w-md mx-auto">
        Revisa los datos de tu tienda, corrige lo indicado y vuelve a enviarla para aprobación.
      </p>
      <Link
        to="/dashboard/store/edit"
        className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-primary font-semibold rounded-lg hover:bg-yellow-400 transition"
      >
        <Settings className="w-4 h-4" />
        Editar y reenviar
      </Link>
    </div>
  );
}

function SuspendedState({ shop }) {
  return (
    <div className="bg-white rounded-xl border-2 border-orange-200 shadow-sm p-10 text-center">
      <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertTriangle className="w-8 h-8 text-orange-500" />
      </div>
      <h2 className="text-xl font-semibold text-primary mb-2">Tu tienda está suspendida</h2>
      <p className="text-gray-500 mb-6 max-w-md mx-auto">
        Tu tienda <span className="font-semibold text-primary">"{shop.name}"</span> ha sido suspendida temporalmente. Contacta al soporte para más información.
      </p>
      <a
        href="mailto:soporte@conimpulso.co"
        className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-primary font-semibold rounded-lg hover:bg-yellow-400 transition"
      >
        Contactar soporte
      </a>
    </div>
  );
}

export default function StorePage() {
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/my/shops')
      .then((res) => {
        const shops = res.data.data || [];
        setShop(shops[0] || null);
      })
      .catch(() => setShop(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-primary">Mi Tienda</h1>
        {shop && shop.status === 'active' && (
          <Link
            to="/dashboard/store/edit"
            className="flex items-center gap-2 px-4 py-2 bg-accent text-primary font-semibold rounded-lg hover:bg-yellow-400 transition"
          >
            <Settings className="w-5 h-5" />
            Configurar Tienda
          </Link>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-64">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      ) : !shop ? (
        <EmptyState />
      ) : shop.status === 'pending' ? (
        <PendingState shop={shop} />
      ) : shop.status === 'active' ? (
        <ActiveState shop={shop} />
      ) : shop.status === 'rejected' ? (
        <RejectedState shop={shop} />
      ) : (
        <SuspendedState shop={shop} />
      )}
    </div>
  );
}
