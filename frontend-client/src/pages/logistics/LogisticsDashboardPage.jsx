import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Truck, Package, MapPin, Clock, Plus, ChevronRight, Calculator } from 'lucide-react';
import { logisticsService } from '../../services/api';

export default function LogisticsDashboardPage() {
  const [stats, setStats] = useState({
    active_shipments: 0,
    pending_pickups: 0,
    delivered: 0,
    in_transit: 0,
  });
  const [recentShipments, setRecentShipments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [shipmentsRes] = await Promise.all([
        logisticsService.shipments(),
      ]);
      const shipments = shipmentsRes.data.data || [];
      setStats({
        active_shipments: shipments.length,
        pending_pickups: 0,
        delivered: shipments.filter(s => s.status === 'delivered').length,
        in_transit: shipments.filter(s => s.status === 'in_transit').length,
      });
      setRecentShipments(shipments.slice(0, 5));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-accent-100 text-accent-700',
      in_transit: 'bg-blue-100 text-blue-700',
      delivered: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#4d3cbb] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pt-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#4d3cbb]">Logística</h1>
            <p className="text-gray-400 mt-1">Gestiona tus envíos y pickups</p>
          </div>
          <Link
            to="/dashboard/logistics/quote"
            className="flex items-center gap-2 px-4 py-2 bg-[#4d3cbb] text-black font-medium rounded-lg hover:bg-accent-400 transition"
          >
            <Calculator className="w-5 h-5" />
            Cotizar Envío
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#1A1A1A] rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-900/30 rounded-xl flex items-center justify-center">
                <Truck className="w-6 h-6 text-blue-500" />
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-1">Envíos Activos</p>
            <p className="text-2xl font-bold text-white">{stats.active_shipments}</p>
          </div>

          <div className="bg-[#1A1A1A] rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-accent-900/30 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-accent-500" />
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-1">Pendientes de Pickup</p>
            <p className="text-2xl font-bold text-accent-500">{stats.pending_pickups}</p>
          </div>

          <div className="bg-[#1A1A1A] rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-900/30 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-green-500" />
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-1">En Tránsito</p>
            <p className="text-2xl font-bold text-white">{stats.in_transit}</p>
          </div>

          <div className="bg-[#1A1A1A] rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-900/30 rounded-xl flex items-center justify-center">
                <MapPin className="w-6 h-6 text-purple-500" />
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-1">Entregados</p>
            <p className="text-2xl font-bold text-white">{stats.delivered}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#1A1A1A] rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Mis Envíos</h2>
              <Link to="/dashboard/logistics/shipments" className="text-[#4d3cbb] text-sm hover:underline">
                Ver todos
              </Link>
            </div>
            {recentShipments.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No hay envíos recientes</p>
            ) : (
              <div className="space-y-4">
                {recentShipments.map((shipment) => (
                  <div key={shipment.id} className="flex items-center justify-between p-4 bg-[#0A0A0A] rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[#4d3cbb]/10 rounded-lg flex items-center justify-center">
                        <Truck className="w-5 h-5 text-[#4d3cbb]" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{shipment.tracking_number}</p>
                        <p className="text-gray-500 text-sm">{shipment.carrier}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(shipment.status)}`}>
                      {shipment.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-[#1A1A1A] rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Solicitudes de Pickup</h2>
              <Link to="/dashboard/logistics/pickups" className="text-[#4d3cbb] text-sm hover:underline">
                Ver todos
              </Link>
            </div>
            <Link
              to="/dashboard/logistics/pickups/new"
              className="flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed border-gray-700 rounded-lg hover:border-[#4d3cbb] transition text-gray-400 hover:text-[#4d3cbb]"
            >
              <Plus className="w-5 h-5" />
              Nueva Solicitud de Pickup
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}