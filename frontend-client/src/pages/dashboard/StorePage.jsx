import { Link } from 'react-router-dom';
import { Store, Plus, Settings, Palette, Image } from 'lucide-react';

export default function StorePage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-primary">Mi Tienda</h1>
        <Link
          to="/dashboard/store/edit"
          className="flex items-center gap-2 px-4 py-2 bg-accent text-primary font-semibold rounded-lg hover:bg-yellow-400 transition"
        >
          <Settings className="w-5 h-5" />
          Configurar Tienda
        </Link>
      </div>

      {/* Empty State */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Store className="w-8 h-8 text-gray-400" />
        </div>
        <h2 className="text-xl font-semibold text-primary mb-2">Aún no tienes una tienda</h2>
        <p className="text-gray-500 mb-6 max-w-md mx-auto">
          Crea tu tienda en ConImpulso para empezar a vender tus productos o servicios. Personalízala a tu gusto y llega a miles de compradores.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/dashboard/store/edit"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-accent text-primary font-semibold rounded-lg hover:bg-yellow-400 transition"
          >
            <Plus className="w-5 h-5" />
            Crear mi tienda
          </Link>
        </div>
      </div>

      {/* Feature Preview */}
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
    </div>
  );
}