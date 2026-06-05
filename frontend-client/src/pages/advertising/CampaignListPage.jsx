import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { advertisingService } from '../../services/api';
import { Eye, MousePointer, DollarSign, Plus, Edit, TrendingUp } from 'lucide-react';

export default function CampaignListPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const response = await advertisingService.campaigns();
      setCampaigns(response.data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-green-900 text-green-400',
      paused: 'bg-yellow-900 text-yellow-400',
      ended: 'bg-gray-700 text-gray-400',
      draft: 'bg-blue-900 text-blue-400',
    };
    return `px-2 py-1 rounded text-xs font-medium ${styles[status] || styles.draft}`;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Campañas Publicitarias</h1>
        <Link
          to="/advertising/campaigns/new"
          className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-medium rounded-lg transition-colors"
        >
          <Plus size={20} />
          Nueva Campaña
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-400">
          {error}
        </div>
      )}

      {campaigns.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
          <TrendingUp className="mx-auto h-16 w-16 text-gray-600 mb-4" />
          <h3 className="text-xl font-semibold text-gray-300 mb-2">Sin campañas activas</h3>
          <p className="text-gray-500 mb-6">Crea tu primera campaña publicitaria para promover tus productos.</p>
          <Link
            to="/advertising/campaigns/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-medium rounded-lg"
          >
            <Plus size={20} />
            Crear Campaña
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">{campaign.name}</h3>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-400">
                      {campaign.type === 'banner' ? 'Banner' : campaign.type === 'product' ? 'Producto' : 'Destacado'}
                    </span>
                    <span className={getStatusBadge(campaign.status)}>{campaign.status}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-yellow-500">{formatCurrency(campaign.budget)}</p>
                  <p className="text-sm text-gray-500">presupuesto</p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="flex items-center gap-2 text-gray-400">
                  <Eye size={18} />
                  <span>{campaign.impressions?.toLocaleString() || 0} impresiones</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <MousePointer size={18} />
                  <span>{campaign.clicks?.toLocaleString() || 0} clics</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <TrendingUp size={18} />
                  <span>{campaign.conversions || 0} conversiones</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <DollarSign size={18} />
                  <span>{formatCurrency(campaign.spent || 0)} gastado</span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-800">
                <Link
                  to={`/advertising/campaigns/${campaign.id}`}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  <Edit size={16} />
                  Editar
                </Link>
                <Link
                  to={`/advertising/campaigns/${campaign.id}/stats`}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  <TrendingUp size={16} />
                  Estadísticas
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-xl font-bold text-white mb-4">Mis Anuncios</h2>
        <Link
          to="/advertising/ads"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg"
        >
          Ver todos mis anuncios →
        </Link>
      </div>
    </div>
  );
}
