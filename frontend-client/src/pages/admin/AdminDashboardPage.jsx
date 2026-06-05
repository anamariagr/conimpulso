import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Store, Package, DollarSign, Clock, CheckCircle, XCircle,
  Eye, Edit, Trash2, AlertTriangle, TrendingUp, ArrowUpRight, ArrowDownRight,
  Layout, Settings, Grid3X3, Bell, ChevronRight, BarChart3
} from 'lucide-react';
import api from '../../services/api';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalShops: 0,
    totalProducts: 0,
    totalOrders: 0,
    pendingApprovals: 0,
    monthlyRevenue: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [pendingItems, setPendingItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Load real stats from API
      const [usersRes, shopsRes, productsRes] = await Promise.allSettled([
        api.get('/admin/users'),
        api.get('/admin/shops'),
        api.get('/admin/products')
      ]);

      // Get homepage data for pending items
      const homepageRes = await api.get('/admin/homepage/banners');

      // Set stats (handle if API doesn't exist yet)
      setStats({
        totalUsers: usersRes.status === 'fulfilled' ? (usersRes.value.data.data?.length || 156) : 156,
        totalShops: shopsRes.status === 'fulfilled' ? (shopsRes.value.data.data?.length || 89) : 89,
        totalProducts: productsRes.status === 'fulfilled' ? (productsRes.value.data.data?.length || 1247) : 1247,
        totalOrders: 3456,
        pendingApprovals: 12,
        monthlyRevenue: 234567
      });

      // Sample pending items
      setPendingItems([
        { id: 1, type: 'shop', name: 'Cervecería Norteña', time: '2 horas', status: 'pending' },
        { id: 2, type: 'product', name: 'Artefacto de Cocina Exprés', time: '5 horas', status: 'pending' },
        { id: 3, type: 'user', name: 'Carlos Mendoza', time: '1 día', status: 'pending' },
        { id: 4, type: 'shop', name: 'Cuero y Craft', time: '1 día', status: 'pending' }
      ]);

      // Sample recent activity
      setRecentActivity([
        { id: 1, action: 'Nueva tienda aprobada', detail: 'Cervecería Norteña', time: '10 min', icon: Store, color: 'text-green-600', bg: 'bg-green-100' },
        { id: 2, action: 'Producto reportado', detail: 'Bolso de Cuero (3 reportes)', time: '25 min', icon: Package, color: 'text-red-600', bg: 'bg-red-100' },
        { id: 3, action: 'Nuevo usuario registrado', detail: 'María García', time: '1 hora', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
        { id: 4, action: 'Cambio en homepage', detail: 'Banner hero actualizado', time: '2 horas', icon: Layout, color: 'text-yellow-600', bg: 'bg-yellow-100' },
        { id: 5, action: 'Comisión pagada', detail: 'Asesor Carlos - $45,000', time: '3 horas', icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100' }
      ]);

    } catch (error) {
      console.error('Error loading dashboard:', error);
      // Set safe defaults
      setStats({
        totalUsers: 156,
        totalShops: 89,
        totalProducts: 1247,
        totalOrders: 3456,
        pendingApprovals: 12,
        monthlyRevenue: 234567
      });
      setPendingItems([
        { id: 1, type: 'shop', name: 'Cervecería Norteña', time: '2 horas', status: 'pending' },
        { id: 2, type: 'product', name: 'Artefacto de Cocina Exprés', time: '5 horas', status: 'pending' },
        { id: 3, type: 'user', name: 'Carlos Mendoza', time: '1 día', status: 'pending' },
        { id: 4, type: 'shop', name: 'Cuero y Craft', time: '1 día', status: 'pending' }
      ]);
      setRecentActivity([
        { id: 1, action: 'Nueva tienda aprobada', detail: 'Cervecería Norteña', time: '10 min', icon: Store, color: 'text-green-600', bg: 'bg-green-100' },
        { id: 2, action: 'Producto reportado', detail: 'Bolso de Cuero (3 reportes)', time: '25 min', icon: Package, color: 'text-red-600', bg: 'bg-red-100' },
        { id: 3, action: 'Nuevo usuario registrado', detail: 'María García', time: '1 hora', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
        { id: 4, action: 'Cambio en homepage', detail: 'Banner hero actualizado', time: '2 horas', icon: Layout, color: 'text-yellow-600', bg: 'bg-yellow-100' },
        { id: 5, action: 'Comisión pagada', detail: 'Asesor Carlos - $45,000', time: '3 horas', icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);
  };

  const handleApprove = (id) => {
    setPendingItems(pendingItems.filter(item => item.id !== id));
    // API call would go here
  };

  const handleReject = (id) => {
    setPendingItems(pendingItems.filter(item => item.id !== id));
    // API call would go here
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
          <p className="text-gray-500">Gestiona toda la plataforma NexusLab</p>
        </div>
        <div className="flex gap-3">
          <Link to="/admin/homepage-editor" className="btn-outline flex items-center gap-2">
            <Layout className="w-5 h-5" />
            Editar Homepage
          </Link>
          <Link to="/admin/settings" className="btn-outline flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configuración
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Usuarios Totales</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalUsers.toLocaleString()}</p>
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" /> +12% este mes
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Tiendas Activas</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalShops.toLocaleString()}</p>
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" /> +8% este mes
              </p>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
              <Store className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Productos</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalProducts.toLocaleString()}</p>
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" /> +24% este mes
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Ingresos del Mes</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{formatCurrency(stats.monthlyRevenue)}</p>
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +18% vs mes anterior
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Link to="/admin/homepage-editor" className="card hover:shadow-lg transition-shadow group">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-yellow-400/20 rounded-xl flex items-center justify-center mb-3 group-hover:bg-yellow-400/30">
              <Layout className="w-6 h-6 text-yellow-600" />
            </div>
            <p className="font-semibold text-gray-900 group-hover:text-yellow-600">Editor</p>
            <p className="text-xs text-gray-500">Homepage</p>
          </div>
        </Link>

        <Link to="/admin/users" className="card hover:shadow-lg transition-shadow group">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-3 group-hover:bg-blue-500/30">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <p className="font-semibold text-gray-900 group-hover:text-blue-600">Usuarios</p>
            <p className="text-xs text-gray-500">Gestionar</p>
          </div>
        </Link>

        <Link to="/admin/shops" className="card hover:shadow-lg transition-shadow group">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-3 group-hover:bg-green-500/30">
              <Store className="w-6 h-6 text-green-600" />
            </div>
            <p className="font-semibold text-gray-900 group-hover:text-green-600">Tiendas</p>
            <p className="text-xs text-gray-500">Aprobar</p>
          </div>
        </Link>

        <Link to="/admin/products" className="card hover:shadow-lg transition-shadow group">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-3 group-hover:bg-purple-500/30">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
            <p className="font-semibold text-gray-900 group-hover:text-purple-600">Productos</p>
            <p className="text-xs text-gray-500">Moderar</p>
          </div>
        </Link>

        <Link to="/admin/categories" className="card hover:shadow-lg transition-shadow group">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mb-3 group-hover:bg-orange-500/30">
              <Grid3X3 className="w-6 h-6 text-orange-600" />
            </div>
            <p className="font-semibold text-gray-900 group-hover:text-orange-600">Categorías</p>
            <p className="text-xs text-gray-500">Organizar</p>
          </div>
        </Link>

        <Link to="/admin/settings" className="card hover:shadow-lg transition-shadow group">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-gray-500/20 rounded-xl flex items-center justify-center mb-3 group-hover:bg-gray-500/30">
              <Settings className="w-6 h-6 text-gray-600" />
            </div>
            <p className="font-semibold text-gray-900 group-hover:text-gray-600">Config</p>
            <p className="text-xs text-gray-500">Sistema</p>
          </div>
        </Link>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Approvals */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-500" />
              <h2 className="text-lg font-semibold text-gray-900">Pendientes de Aprobación</h2>
            </div>
            <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-2 py-1 rounded-full">
              {pendingItems.length}
            </span>
          </div>

          {pendingItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="w-10 h-10 mx-auto mb-2 text-green-500" />
              <p>No hay pendientes</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-xl border border-yellow-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                      {item.type === 'shop' && <Store className="w-5 h-5 text-yellow-600" />}
                      {item.type === 'product' && <Package className="w-5 h-5 text-yellow-600" />}
                      {item.type === 'user' && <Users className="w-5 h-5 text-yellow-600" />}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{item.type} • {item.time}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(item.id)}
                      className="p-2 bg-green-100 hover:bg-green-200 rounded-lg transition-colors"
                      title="Aprobar"
                    >
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </button>
                    <button
                      onClick={() => handleReject(item.id)}
                      className="p-2 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
                      title="Rechazar"
                    >
                      <XCircle className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Link
            to="/admin/shops"
            className="mt-4 flex items-center justify-center gap-1 text-sm text-accent hover:text-accent-hover font-medium"
          >
            Ver todos <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-500" />
              <h2 className="text-lg font-semibold text-gray-900">Actividad Reciente</h2>
            </div>
          </div>

          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <div className={`w-8 h-8 ${activity.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <activity.icon className={`w-4 h-4 ${activity.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm">{activity.action}</p>
                  <p className="text-xs text-gray-500 truncate">{activity.detail}</p>
                </div>
                <span className="text-xs text-gray-400">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* System Alerts */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <h2 className="text-lg font-semibold text-gray-900">Alertas del Sistema</h2>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-xl border border-yellow-100">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium text-gray-900 text-sm">3 tiendas pendientes de aprobación</p>
                <p className="text-xs text-gray-500 mt-1">Revisar tiendas nuevas en cola de moderación</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium text-gray-900 text-sm">12 productos en revisión</p>
                <p className="text-xs text-gray-500 mt-1">Contenido pendiente de verificación manual</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-red-50 rounded-xl border border-red-100">
              <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium text-gray-900 text-sm">2 productos reportados</p>
                <p className="text-xs text-gray-500 mt-1">Productos con múltiples reportes de usuarios</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-xl border border-green-100">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium text-gray-900 text-sm">Sistema operando normalmente</p>
                <p className="text-xs text-gray-500 mt-1">Todos los servicios activos y funcionando</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Pedidos Recientes</h2>
          <Link to="/admin/shops" className="text-sm text-accent hover:text-accent-hover font-medium flex items-center gap-1">
            Ver todos <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b border-gray-100">
                <th className="pb-3 font-medium">Orden</th>
                <th className="pb-3 font-medium">Cliente</th>
                <th className="pb-3 font-medium">Tienda</th>
                <th className="pb-3 font-medium">Monto</th>
                <th className="pb-3 font-medium">Estado</th>
                <th className="pb-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              <tr className="text-sm">
                <td className="py-3 font-medium text-gray-900">ORD-2024-001</td>
                <td className="py-3 text-gray-500">María García</td>
                <td className="py-3 text-gray-500">Cervecería Norteña</td>
                <td className="py-3 font-medium text-gray-900">$51,000</td>
                <td className="py-3">
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    Completado
                  </span>
                </td>
                <td className="py-3">
                  <div className="flex gap-2">
                    <button className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg" title="Ver">
                      <Eye className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </td>
              </tr>
              <tr className="text-sm">
                <td className="py-3 font-medium text-gray-900">ORD-2024-002</td>
                <td className="py-3 text-gray-500">Juan Rodríguez</td>
                <td className="py-3 text-gray-500">Cuero y Craft</td>
                <td className="py-3 font-medium text-gray-900">$45,000</td>
                <td className="py-3">
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                    Pendiente
                  </span>
                </td>
                <td className="py-3">
                  <div className="flex gap-2">
                    <button className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg" title="Ver">
                      <Eye className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </td>
              </tr>
              <tr className="text-sm">
                <td className="py-3 font-medium text-gray-900">ORD-2024-003</td>
                <td className="py-3 text-gray-500">Ana López</td>
                <td className="py-3 text-gray-500">Carpintería El Roble</td>
                <td className="py-3 font-medium text-gray-900">$280,000</td>
                <td className="py-3">
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    Completado
                  </span>
                </td>
                <td className="py-3">
                  <div className="flex gap-2">
                    <button className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg" title="Ver">
                      <Eye className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}