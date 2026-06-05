import { Link } from 'react-router-dom';
import { Package, Plus, ArrowRight } from 'lucide-react';

export default function ProductsListPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-primary">Productos</h1>
        <Link
          to="/dashboard/products/new"
          className="flex items-center gap-2 px-4 py-2 bg-accent text-primary font-semibold rounded-lg hover:bg-yellow-400 transition"
        >
          <Plus className="w-5 h-5" />
          Nuevo Producto
        </Link>
      </div>

      {/* Empty State */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Package className="w-8 h-8 text-gray-400" />
        </div>
        <h2 className="text-xl font-semibold text-primary mb-2">Aún no hay productos</h2>
        <p className="text-gray-500 mb-6 max-w-md mx-auto">
          Comienza a vender tus productos en NexusLab. Añade tu primer producto para empezar a recibir pedidos.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/dashboard/products/new"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-accent text-primary font-semibold rounded-lg hover:bg-yellow-400 transition"
          >
            <Plus className="w-5 h-5" />
            Crear mi primer producto
          </Link>
          <button className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-300 text-primary font-semibold rounded-lg hover:border-accent transition">
            <ArrowRight className="w-5 h-5" />
            Ver tutorial
          </button>
        </div>
      </div>

      {/* Help Tips */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-semibold text-primary mb-2">📸 Photos</h3>
          <p className="text-sm text-gray-500">Añade hasta 10 fotos de tu producto para atraer más compradores.</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-semibold text-primary mb-2">💰 Precios</h3>
          <p className="text-sm text-gray-500">Configura precios por mayoreo y detal para diferentes clientes.</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-semibold text-primary mb-2">📦 Inventario</h3>
          <p className="text-sm text-gray-500">Lleva el control de tu stock y recibe alertas cuando estén bajos.</p>
        </div>
      </div>
    </div>
  );
}