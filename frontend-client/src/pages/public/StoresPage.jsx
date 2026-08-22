import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, MapPin, Star, RefreshCw } from 'lucide-react';
import { shopService } from '../../services/api';

export default function StoresPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['shops', { searchQuery, page }],
    queryFn: async () => {
      const response = await shopService.index({ search: searchQuery || undefined, page, per_page: 24 });
      return response.data;
    },
    placeholderData: (previousData) => previousData,
  });

  const shops = data?.data ?? [];
  const meta = data?.meta;

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(1);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500" /></div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tiendas</h1>
        <p className="text-gray-600">Explora tiendas de productores reales</p>
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input type="search" placeholder="Buscar tiendas..." value={searchQuery} onChange={handleSearchChange} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent" />
      </div>

      {isError ? (
        <div className="text-center py-16">
          <p className="text-gray-700 text-lg">No fue posible cargar las tiendas.</p>
          <p className="mt-2 text-gray-500">Verifica que el servidor esté disponible e inténtalo de nuevo.</p>
          <button type="button" onClick={() => refetch()} disabled={isFetching} className="btn-primary mt-6 inline-flex items-center gap-2 disabled:opacity-60">
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} /> Reintentar
          </button>
        </div>
      ) : shops.length === 0 ? (
        <div className="text-center py-16"><p className="text-gray-500 text-lg">{searchQuery ? 'No se encontraron tiendas con esa búsqueda' : 'Aún no hay tiendas publicadas'}</p></div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shops.map((shop) => (
              <Link key={shop.id} to={`/stores/${shop.slug}`} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all">
                <div className="h-32 bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                  {shop.banner || shop.logo ? <img src={shop.banner || shop.logo} alt="" className="w-full h-full object-cover" /> : <span className="text-4xl text-gray-500">Tienda</span>}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{shop.name || 'Tienda'}</h3>
                      {shop.city && <div className="flex items-center gap-1 text-sm text-gray-500 mt-1"><MapPin className="w-4 h-4" />{shop.city}</div>}
                    </div>
                    {shop.is_verified && <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">Verificado</span>}
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">{shop.description || 'Sin descripción'}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-500" /><span>{shop.followers || 0} seguidores</span></div>
                    <span>{shop.views || 0} vistas</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          {meta?.last_page > 1 && (
            <div className="mt-8 flex items-center justify-center gap-4">
              <button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1 || isFetching} className="btn-outline disabled:opacity-50">Anterior</button>
              <span className="text-sm text-gray-600">Página {meta.current_page} de {meta.last_page}</span>
              <button type="button" onClick={() => setPage((current) => Math.min(meta.last_page, current + 1))} disabled={page === meta.last_page || isFetching} className="btn-outline disabled:opacity-50">Siguiente</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
