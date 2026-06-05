import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, TrendingUp, Package, Eye, Users, Bell, Tag, Plus, ChevronRight, BarChart3 } from 'lucide-react';
import { vendorService } from '../../services/api';

export default function VendorDashboardPage() {
  const [stats, setStats] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [salesChart, setSalesChart] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, revenueRes, chartRes, notifRes, unreadRes] = await Promise.all([
        vendorService.shopStats(),
        vendorService.revenueStats('monthly'),
        vendorService.salesChart(30),
        vendorService.notifications(),
        vendorService.unreadNotificationCount(),
      ]);

      setStats(statsRes.data.data);
      setRevenue(revenueRes.data.data);
      setSalesChart(chartRes.data.data || []);
      setNotifications(notifRes.data.data?.data || []);
      setUnreadCount(unreadRes.data.data?.count || 0);
    } catch (error) {
      console.error('Error loading vendor data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await vendorService.markAllNotificationsRead();
      loadData();
    } catch (error) {
      console.error('Error marking notifications read:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#FFD700] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pt-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#FFD700]">Panel de Vendedor</h1>
            <p className="text-gray-400 mt-1">Gestiona tu tienda y monitoreo tu rendimiento</p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/dashboard/store/edit"
              className="px-4 py-2 bg-[#1A1A1A] border border-gray-700 rounded-lg hover:border-[#FFD700] transition"
            >
              Editar Tienda
            </Link>
            <Link
              to="/dashboard/settings"
              className="px-4 py-2 bg-[#1A1A1A] border border-gray-700 rounded-lg hover:border-[#FFD700] transition"
            >
              Configuración
            </Link>
          </div>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#1A1A1A] rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-900/30 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-500" />
              </div>
              <span className="text-xs text-green-500 bg-green-900/30 px-2 py-1 rounded">+12%</span>
            </div>
            <p className="text-gray-400 text-sm mb-1">Ingresos del Mes</p>
            <p className="text-2xl font-bold text-white">
              ${stats?.total_revenue?.toLocaleString() || revenue?.net_revenue?.toLocaleString() || '0'}
            </p>
          </div>

          <div className="bg-[#1A1A1A] rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-900/30 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-500" />
              </div>
              <span className="text-xs text-blue-400 bg-blue-900/30 px-2 py-1 rounded">Productos</span>
            </div>
            <p className="text-gray-400 text-sm mb-1">Productos Vendidos</p>
            <p className="text-2xl font-bold text-white">{stats?.total_sales || 0}</p>
          </div>

          <div className="bg-[#1A1A1A] rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-900/30 rounded-xl flex items-center justify-center">
                <Eye className="w-6 h-6 text-yellow-500" />
              </div>
              <span className="text-xs text-yellow-500 bg-yellow-900/30 px-2 py-1 rounded">Vistas</span>
            </div>
            <p className="text-gray-400 text-sm mb-1">Visitas a Tu Tienda</p>
            <p className="text-2xl font-bold text-white">{stats?.total_views?.toLocaleString() || 0}</p>
          </div>

          <div className="bg-[#1A1A1A] rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-900/30 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-500" />
              </div>
              <span className="text-xs text-purple-400 bg-purple-900/30 px-2 py-1 rounded">Seguidores</span>
            </div>
            <p className="text-gray-400 text-sm mb-1">Seguidores</p>
            <p className="text-2xl font-bold text-white">{stats?.total_followers || 0}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Sales Chart */}
          <div className="lg:col-span-2 bg-[#1A1A1A] rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Ventas (Últimos 30 días)</h2>
              <BarChart3 className="w-5 h-5 text-gray-500" />
            </div>
            <div className="h-48 flex items-end gap-1">
              {salesChart.slice(-15).map((day, i) => {
                const maxRevenue = Math.max(...salesChart.map(d => d.revenue), 1);
                const height = (day.revenue / maxRevenue) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-[#FFD700] rounded-t transition-all hover:bg-yellow-400"
                      style={{ height: `${Math.max(height, 2)}%` }}
                      title={`${day.date}: $${day.revenue}`}
                    ></div>
                    <span className="text-xs text-gray-500">{new Date(day.date).getDate()}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-[#1A1A1A] rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Notificaciones</h2>
              {unreadCount > 0 && (
                <button onClick={handleMarkAllRead} className="text-xs text-[#FFD700] hover:underline">
                  Marcar todas leídas
                </button>
              )}
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {notifications.slice(0, 5).map((notif) => (
                <div key={notif.id} className={`p-3 rounded-lg ${notif.is_read ? 'bg-[#0A0A0A]' : 'bg-[#FFD700]/10 border border-[#FFD700]/30'}`}>
                  <p className="text-white text-sm font-medium">{notif.title}</p>
                  <p className="text-gray-400 text-xs mt-1">{notif.message}</p>
                </div>
              ))}
              {notifications.length === 0 && (
                <p className="text-gray-500 text-center py-4">No hay notificaciones</p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Promotions */}
          <div className="bg-[#1A1A1A] rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Promociones</h2>
              <Link
                to="/dashboard/store/promotions"
                className="flex items-center gap-1 text-[#FFD700] text-sm hover:underline"
              >
                Ver todas <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <Link
              to="/dashboard/store/promotions/new"
              className="flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed border-gray-700 rounded-lg hover:border-[#FFD700] transition text-gray-400 hover:text-[#FFD700]"
            >
              <Plus className="w-5 h-5" />
              Crear Nueva Promoción
            </Link>
          </div>

          {/* Top Products */}
          <div className="bg-[#1A1A1A] rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Productos Más Vendidos</h2>
              <Link
                to="/dashboard/products"
                className="flex items-center gap-1 text-[#FFD700] text-sm hover:underline"
              >
                Ver todos <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-[#0A0A0A] rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">📦</div>
                  <div>
                    <p className="text-white font-medium">Camiseta Algodón Premium</p>
                    <p className="text-gray-500 text-sm">45 vendidos</p>
                  </div>
                </div>
                <span className="text-green-500 font-medium">$2,250,000</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#0A0A0A] rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">📦</div>
                  <div>
                    <p className="text-white font-medium">Jeans Clásico</p>
                    <p className="text-gray-500 text-sm">32 vendidos</p>
                  </div>
                </div>
                <span className="text-green-500 font-medium">$1,920,000</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#0A0A0A] rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">📦</div>
                  <div>
                    <p className="text-white font-medium">Zapatos Cuero</p>
                    <p className="text-gray-500 text-sm">28 vendidos</p>
                  </div>
                </div>
                <span className="text-green-500 font-medium">$3,360,000</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <Link
            to="/dashboard/products/new"
            className="bg-[#1A1A1A] rounded-xl p-4 border border-gray-800 hover:border-[#FFD700] transition text-center"
          >
            <Plus className="w-8 h-8 text-[#FFD700] mx-auto mb-2" />
            <p className="text-white font-medium">Nuevo Producto</p>
          </Link>
          <Link
            to="/advertising/campaigns/new"
            className="bg-[#1A1A1A] rounded-xl p-4 border border-gray-800 hover:border-[#FFD700] transition text-center"
          >
            <Tag className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-white font-medium">Crear Campaña</p>
          </Link>
          <Link
            to="/dashboard/leads"
            className="bg-[#1A1A1A] rounded-xl p-4 border border-gray-800 hover:border-[#FFD700] transition text-center"
          >
            <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-white font-medium">Ver Leads</p>
          </Link>
          <Link
            to="/ai"
            className="bg-[#1A1A1A] rounded-xl p-4 border border-gray-800 hover:border-[#FFD700] transition text-center"
          >
            <BarChart3 className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <p className="text-white font-medium">AI Insights</p>
          </Link>
        </div>
      </div>
    </div>
  );
}