import { Search, Plus, Eye, Pencil, Store, CheckCircle, XCircle } from 'lucide-react';

export default function ShopsView() {
  const shops = [
    { id: 1, name: 'TechStore Chile', owner: 'Juan Pérez', city: 'Santiago', is_verified: true, products_count: 45, status: 'active' },
    { id: 2, name: 'Delicias Gourmet', owner: 'María García', city: 'Valparaíso', is_verified: true, products_count: 32, status: 'active' },
    { id: 3, name: 'Muebles & Hogar', owner: 'Carlos López', city: 'Santiago', is_verified: false, products_count: 28, status: 'pending' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tiendas</h1>
          <p className="text-gray-500">Gestiona las tiendas de la plataforma</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Nueva Tienda
        </button>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b border-gray-100">
                <th className="pb-3 font-medium">Tienda</th>
                <th className="pb-3 font-medium">Propietario</th>
                <th className="pb-3 font-medium">Ciudad</th>
                <th className="pb-3 font-medium">Productos</th>
                <th className="pb-3 font-medium">Estado</th>
                <th className="pb-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {shops.map((shop) => (
                <tr key={shop.id} className="text-sm">
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <Store className="w-5 h-5 text-gray-400" />
                      <span className="font-medium text-gray-900">{shop.name}</span>
                      {shop.is_verified && <CheckCircle className="w-4 h-4 text-blue-500" />}
                    </div>
                  </td>
                  <td className="py-3 text-gray-500">{shop.owner}</td>
                  <td className="py-3 text-gray-500">{shop.city}</td>
                  <td className="py-3 text-gray-500">{shop.products_count}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      shop.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {shop.status}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      <button className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg"><Eye className="w-4 h-4 text-gray-600" /></button>
                      <button className="p-1.5 bg-blue-100 hover:bg-blue-200 rounded-lg"><Pencil className="w-4 h-4 text-blue-600" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}