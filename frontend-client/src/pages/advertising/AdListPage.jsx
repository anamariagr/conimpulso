import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { advertisingService } from '../../services/api';
import { Eye, MousePointer, TrendingUp, Edit, Image } from 'lucide-react';

export default function AdListPage() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAds();
  }, []);

  const loadAds = async () => {
    try {
      setLoading(true);
      const response = await advertisingService.myAds();
      setAds(response.data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getTypeBadge = (type) => {
    const styles = {
      banner: 'bg-blue-900 text-blue-400',
      product: 'bg-purple-900 text-purple-400',
      sponsored: 'bg-green-900 text-green-400',
    };
    return `px-2 py-1 rounded text-xs font-medium ${styles[type] || styles.banner}`;
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-green-900 text-green-400',
      paused: 'bg-accent-900 text-accent-400',
      ended: 'bg-gray-700 text-gray-400',
    };
    return `px-2 py-1 rounded text-xs font-medium ${styles[status] || styles.active}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Mis Anuncios</h1>
        <Link
          to="/advertising/campaigns"
          className="flex items-center gap-2 px-4 py-2 bg-accent-500 hover:bg-accent-600 text-black font-medium rounded-lg transition-colors"
        >
          <Image size={20} />
          Crear Nuevo Anuncio
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-400">
          {error}
        </div>
      )}

      {ads.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
          <Image className="mx-auto h-16 w-16 text-gray-600 mb-4" />
          <h3 className="text-xl font-semibold text-gray-300 mb-2">Sin anuncios</h3>
          <p className="text-gray-500 mb-6">Crea anuncios para tus productos o servicios.</p>
          <Link
            to="/advertising/campaigns"
            className="inline-flex items-center gap-2 px-6 py-3 bg-accent-500 hover:bg-accent-600 text-black font-medium rounded-lg"
          >
            Crear Anuncio
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ads.map((ad) => (
            <div key={ad.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition-colors">
              {ad.image_url ? (
                <img
                  src={ad.image_url}
                  alt={ad.title}
                  className="w-full h-40 object-cover"
                />
              ) : (
                <div className="w-full h-40 bg-gray-800 flex items-center justify-center">
                  <Image className="h-12 w-12 text-gray-600" />
                </div>
              )}

              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-white mb-1">{ad.title}</h3>
                    <div className="flex items-center gap-2">
                      <span className={getTypeBadge(ad.type)}>{ad.type}</span>
                      <span className={getStatusBadge(ad.status)}>{ad.status}</span>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-accent-500">
                    ${ad.bid_amount?.toFixed(2) || '0.00'}
                  </p>
                </div>

                {ad.description && (
                  <p className="text-sm text-gray-400 mb-4 line-clamp-2">{ad.description}</p>
                )}

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Eye size={16} />
                    <span>{ad.impressions?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <MousePointer size={16} />
                    <span>{ad.clicks?.toLocaleString() || 0}</span>
                  </div>
                </div>

                <Link
                  to={`/advertising/ads/${ad.id}`}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  <Edit size={16} />
                  Editar
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
