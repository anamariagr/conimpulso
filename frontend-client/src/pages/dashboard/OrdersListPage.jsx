import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Store } from 'lucide-react';

export default function OrdersListPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-primary">Pedidos</h1>
      </div>

      {/* Empty State */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="w-8 h-8 text-gray-400" />
        </div>
        <h2 className="text-xl font-semibold text-primary mb-2">Aún no hay pedidos</h2>
        <p className="text-gray-500 mb-6 max-w-md mx-auto">
          Los pedidos de tus productos aparecerán aquí. Para recibir pedidos, primero necesitas crear productos y que los clientes realicen compras.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/dashboard/products"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-accent text-primary font-semibold rounded-lg hover:bg-yellow-400 transition"
          >
            <ArrowRight className="w-5 h-5" />
            Ver mis productos
          </Link>
          <Link
            to="/dashboard/store"
            className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-300 text-primary font-semibold rounded-lg hover:border-accent transition"
          >
            <Store className="w-5 h-5" />
            Configurar mi tienda
          </Link>
        </div>
      </div>

      {/* Help Tips */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-semibold text-primary mb-2">📋 Estados de pedido</h3>
          <p className="text-sm text-gray-500">Recibirás notificaciones cuando un cliente realice un pedido. Podrás aceptar, procesar o cancelar pedidos.</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-semibold text-primary mb-2">🚚 Logística integrada</h3>
          <p className="text-sm text-gray-500">Gestiona envíos directamente desde NexusLab con nuestras intégraciones de logística.</p>
        </div>
      </div>
    </div>
  );
}