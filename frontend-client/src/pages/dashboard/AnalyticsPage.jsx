import { TrendingUp, BarChart3, PieChart, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AnalyticsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-primary">Analíticas</h1>
      </div>

      {/* Empty State */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <TrendingUp className="w-8 h-8 text-gray-400" />
        </div>
        <h2 className="text-xl font-semibold text-primary mb-2">Aún no hay datos de analíticas</h2>
        <p className="text-gray-500 mb-6 max-w-md mx-auto">
          Las analíticas se generarán automáticamente cuando tengas productos, pedidos y visitantes. Empieza a construir tu presencia en ConImpulso para ver métricas.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/dashboard/products/new"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-accent text-primary font-semibold rounded-lg hover:bg-yellow-400 transition"
          >
            <ArrowRight className="w-5 h-5" />
            Crear producto
          </Link>
          <Link
            to="/dashboard"
            className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-300 text-primary font-semibold rounded-lg hover:border-accent transition"
          >
            Ir al dashboard
          </Link>
        </div>
      </div>

      {/* Preview Cards */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
          <BarChart3 className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <h3 className="font-semibold text-primary mb-1">Ventas</h3>
          <p className="text-sm text-gray-500">Gráfico de ventas por período</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
          <PieChart className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <h3 className="font-semibold text-primary mb-1">Productos</h3>
          <p className="text-sm text-gray-500">Rendimiento por producto</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
          <TrendingUp className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <h3 className="font-semibold text-primary mb-1">Tendencia</h3>
          <p className="text-sm text-gray-500">Crecimiento vs período anterior</p>
        </div>
      </div>
    </div>
  );
}