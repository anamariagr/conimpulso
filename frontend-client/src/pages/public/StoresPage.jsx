import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { shopService } from '../../services/api';
import { Search, MapPin, Star } from 'lucide-react';

export default function StoresPage() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadShops();
  }, []);

  const loadShops = async () => {
    try {
      setLoading(true);
      const response = await shopService.index();
      setShops(response.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredShops = shops.filter(s =>
    s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.city?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tiendas</h1>
        <p className="text-gray-600">Explora tiendas de productores reales</p>
      </div>

      {/* Search */}
      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar tiendas..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
        />
      </div>

      {/* Shops Grid */}
      {filteredShops.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">No se encontraron tiendas</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredShops.map((shop) => (
            <Link
              key={shop.id}
              to={`/stores/${shop.slug}`}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all"
            >
              <div className="h-32 bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                <span className="text-4xl text-gray-500">🏪</span>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900">{shop.name || 'Tienda'}</h3>
                    {shop.city && (
                      <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                        <MapPin className="w-4 h-4" />
                        {shop.city}
                      </div>
                    )}
                  </div>
                  {shop.is_verified && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                      Verificado
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                  {shop.description || 'Sin descripción'}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span>{shop.followers || 0} seguidores</span>
                  </div>
                  <span>{shop.views || 0} vistas</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
