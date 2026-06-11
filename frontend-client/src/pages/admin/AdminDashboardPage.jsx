import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Store, Package, DollarSign,
  Edit, AlertTriangle, ArrowUpRight, ArrowDownRight,
  Layout, Settings, Grid3X3, ChevronRight, BarChart3,
  TrendingUp, Wallet, Image as ImageIcon,
  MessageSquare, MessageSquareOff, CheckCircle
} from 'lucide-react';
import api from '../../services/api';

const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(value || 0);
};

const formatTimeAgo = (dateString) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Ahora';
  if (diffMins < 60) return `${diffMins} min`;
  if (diffHours < 24) return `${diffHours} h`;
  if (diffDays < 30) return `${diffDays} d`;
  return date.toLocaleDateString('es-CL', { day: '2-digit', month: 'short' });
};

const STATUS_LABELS = {
  active: 'Activa',
  pending: 'Pendiente',
  inactive: 'Inactiva',
  draft: 'Borrador',
  rejected: 'Rechazada',
  suspended: 'Suspendida',
};

const STATUS_COLORS = {
  active: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  inactive: 'bg-gray-100 text-gray-600',
  draft: 'bg-blue-100 text-blue-700',
  rejected: 'bg-red-100 text-red-700',
  suspended: 'bg-orange-100 text-orange-700',
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    shops: 0, shopsChange: null, shopsUp: null,
    products: 0, productsChange: null, productsUp: null,
    users: 0, usersChange: null, usersUp: null,
    categories: 0,
  });
  const [health, setHealth] = useState({
    shops: {}, products: {}, users: {}, homepage: {}, wallet: {},
  });
  const [topProducts, setTopProducts] = useState([]);
  const [latestShops, setLatestShops] = useState([]);
  const [latestUsers, setLatestUsers] = useState([]);
  const [salesByMonth, setSalesByMonth] = useState(null);
  const [roleBreakdown, setRoleBreakdown] = useState([]);
  const [homepageBanners, setHomepageBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, homepageRes] = await Promise.allSettled([
        api.get('/admin/dashboard/stats', { headers: { Accept: 'application/json' } }),
        api.get('/admin/homepage/banners', { headers: { Accept: 'application/json' } }),
      ]);

      if (statsRes.status === 'fulfilled') {
        const data = statsRes.value.data?.data || {};
        const platform = data.platform_stats || [];
        const get = (key) => platform.find((s) => s.key === key) || {};

        setStats({
          shops: get('shops')?.value || 0,
          shopsChange: get('shops')?.change,
          shopsUp: get('shops')?.up,
          products: get('products')?.value || 0,
          productsChange: get('products')?.change,
          productsUp: get('products')?.up,
          users: get('users')?.value || 0,
          usersChange: get('users')?.change,
          usersUp: get('users')?.up,
          categories: get('categories')?.value || 0,
        });

        setHealth(data.health || {});
        setTopProducts(data.top_products || []);
        setLatestShops(data.latest_shops || []);
        setLatestUsers(data.latest_users || []);
        setSalesByMonth(data.sales_by_month || null);
        setRoleBreakdown(data.role_breakdown || []);
      }

      if (homepageRes.status === 'fulfilled') {
        setHomepageBanners(homepageRes.value.data?.data || []);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const pendingShops = health.shops?.pending || 0;
  const lowStock = health.products?.low_stock || 0;
  const inventoryValue = health.products?.inventory_value || 0;
  const walletBalance = health.wallet?.balance_total || 0;
  const activeBanners = health.homepage?.banners_active || 0;
  const totalBanners = health.homepage?.banners_total || 0;
  const activeSections = health.homepage?.sections_active || 0;
  const totalSections = health.homepage?.sections_total || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
          <p className="text-gray-500">Datos en tiempo real de la plataforma ConImpulso</p>
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

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Usuarios Totales"
          value={stats.users}
          change={stats.usersChange}
          up={stats.usersUp}
          icon={Users}
          color="blue"
          subtext={`${health.users?.verified || 0} verificados · ${health.users?.new_this_month || 0} este mes`}
        />
        <StatCard
          label="Tiendas"
          value={stats.shops}
          change={stats.shopsChange}
          up={stats.shopsUp}
          icon={Store}
          color="green"
          subtext={`${health.shops?.active || 0} activas · ${pendingShops} pendientes`}
        />
        <StatCard
          label="Productos"
          value={stats.products}
          change={stats.productsChange}
          up={stats.productsUp}
          icon={Package}
          color="purple"
          subtext={`${health.products?.active || 0} activos · ${lowStock} bajo stock`}
        />
        <StatCard
          label="Valor Inventario"
          value={formatCurrency(inventoryValue)}
          icon={DollarSign}
          color="yellow"
          subtext={`${health.products?.total_units || 0} unidades totales`}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SmallStat label="Categorías" value={stats.categories} icon={Grid3X3} />
        <SmallStat label="Banners Activos" value={`${activeBanners}/${totalBanners}`} icon={ImageIcon} />
        <SmallStat label="Secciones Activas" value={`${activeSections}/${totalSections}`} icon={Layout} />
        <SmallStat label="Balance Wallets" value={formatCurrency(walletBalance)} icon={Wallet} />
      </div>

      {/* Quick Access */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <QuickAccess to="/admin/homepage-editor" label="Editor" sublabel="Homepage" icon={Layout} color="yellow" />
        <QuickAccess to="/admin/users" label="Usuarios" sublabel={`${stats.users} total`} icon={Users} color="blue" />
        <QuickAccess to="/admin/shops" label="Tiendas" sublabel={`${stats.shops} total`} icon={Store} color="green" />
        <QuickAccess to="/admin/products" label="Productos" sublabel={`${stats.products} total`} icon={Package} color="purple" />
        <QuickAccess to="/admin/categories" label="Categorías" sublabel={`${stats.categories} total`} icon={Grid3X3} color="orange" />
        <QuickAccess to="/admin/settings" label="Config" sublabel="Sistema" icon={Settings} color="gray" />
      </div>

      {/* Charts and Real Data */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-500" />
              <h2 className="text-lg font-semibold text-gray-900">Crecimiento últimos 6 meses</h2>
            </div>
          </div>
          {salesByMonth && salesByMonth.datasets && (
            <SimpleBarChart data={salesByMonth} />
          )}
        </div>

        {/* Role Breakdown */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-500" />
              <h2 className="text-lg font-semibold text-gray-900">Usuarios por Rol</h2>
            </div>
          </div>
          {roleBreakdown.length > 0 ? (
            <div className="space-y-3">
              {roleBreakdown.map((role) => {
                const total = roleBreakdown.reduce((s, r) => s + r.total, 0);
                const pct = total > 0 ? Math.round((role.total / total) * 100) : 0;
                return (
                  <div key={role.name}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700 capitalize">{role.name.replace('_', ' ')}</span>
                      <span className="text-gray-500">{role.total} ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-accent rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-sm text-center py-4">Sin datos de roles</p>
          )}
        </div>
      </div>

      {/* Product Status Breakdown */}
      {health.products && (
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-5 h-5 text-purple-500" />
            <h2 className="text-lg font-semibold text-gray-900">Estado de productos</h2>
          </div>
          <ProductStatusBreakdown health={health.products} />
        </div>
      )}

      {/* Real Data Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <h2 className="text-lg font-semibold text-gray-900">Productos Más Vistos</h2>
            </div>
            <Link to="/admin/products" className="text-sm text-accent hover:text-accent-hover font-medium flex items-center gap-1">
              Ver todos <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          {topProducts.length > 0 ? (
            <div className="space-y-3">
              {topProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.shop}</p>
                  </div>
                  <div className="text-right ml-3">
                    <p className="text-sm font-semibold text-gray-900">{formatCurrency(product.price)}</p>
                    <p className="text-xs text-gray-500">{product.views} vistas</p>
                  </div>
                  <span className={`ml-3 px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[product.status] || 'bg-gray-100 text-gray-600'}`}>
                    {STATUS_LABELS[product.status] || product.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm text-center py-4">Sin productos registrados</p>
          )}
        </div>

        {/* Latest Shops */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Store className="w-5 h-5 text-blue-500" />
              <h2 className="text-lg font-semibold text-gray-900">Tiendas Recientes</h2>
            </div>
            <Link to="/admin/shops" className="text-sm text-accent hover:text-accent-hover font-medium flex items-center gap-1">
              Ver todas <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          {latestShops.length > 0 ? (
            <div className="space-y-3">
              {latestShops.map((shop) => (
                <div key={shop.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Store className="w-5 h-5 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 text-sm truncate">{shop.name}</p>
                      <p className="text-xs text-gray-500">{formatTimeAgo(shop.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {shop.is_verified && (
                      <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700" title="Verificada">✓</span>
                    )}
                    {shop.is_featured && (
                      <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-700" title="Destacada">★</span>
                    )}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[shop.status] || 'bg-gray-100 text-gray-600'}`}>
                      {STATUS_LABELS[shop.status] || shop.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm text-center py-4">Sin tiendas registradas</p>
          )}
        </div>
      </div>

      {/* Latest Users + Homepage Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-500" />
              <h2 className="text-lg font-semibold text-gray-900">Usuarios Recientes</h2>
            </div>
            <Link to="/admin/users" className="text-sm text-accent hover:text-accent-hover font-medium flex items-center gap-1">
              Ver todos <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          {latestUsers.length > 0 ? (
            <div className="space-y-3">
              {latestUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                      {user.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 text-sm truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 ml-2">{formatTimeAgo(user.created_at)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm text-center py-4">Sin usuarios registrados</p>
          )}
        </div>

        {/* Homepage Status */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Layout className="w-5 h-5 text-yellow-500" />
              <h2 className="text-lg font-semibold text-gray-900">Estado del Homepage</h2>
            </div>
            <Link to="/admin/homepage-editor" className="text-sm text-accent hover:text-accent-hover font-medium flex items-center gap-1">
              Editar <Edit className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-100">
              <div className="flex items-center gap-2 mb-1">
                <ImageIcon className="w-4 h-4 text-yellow-600" />
                <p className="text-xs font-medium text-yellow-700">Banners</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">{totalBanners}</p>
              <p className="text-xs text-gray-500">{activeBanners} activos</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-center gap-2 mb-1">
                <Layout className="w-4 h-4 text-blue-600" />
                <p className="text-xs font-medium text-blue-700">Secciones</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">{totalSections}</p>
              <p className="text-xs text-gray-500">{activeSections} activas</p>
            </div>
          </div>
          {homepageBanners.length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {homepageBanners.slice(0, 5).map((banner) => (
                <div key={banner.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                  <div className="w-12 h-8 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                    {banner.media_url && (
                      <img src={banner.media_url} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{banner.title || 'Sin título'}</p>
                    <p className="text-xs text-gray-500 capitalize">{banner.position}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${banner.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {banner.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm text-center py-4">Sin banners configurados</p>
          )}
        </div>
      </div>

      {/* Messaging Quick Control */}
      <MessagingWidget />

      {/* System Alerts */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h2 className="text-lg font-semibold text-gray-900">Alertas del Sistema</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {pendingShops > 0 ? (
            <SystemAlert
              type="warning"
              title={`${pendingShops} tienda${pendingShops > 1 ? 's' : ''} pendiente${pendingShops > 1 ? 's' : ''} de aprobación`}
              description="Revisar tiendas nuevas en cola de moderación"
            />
          ) : (
            <SystemAlert
              type="success"
              title="Sin tiendas pendientes"
              description="Todas las tiendas han sido revisadas"
            />
          )}
          {lowStock > 0 ? (
            <SystemAlert
              type="warning"
              title={`${lowStock} producto${lowStock > 1 ? 's' : ''} con bajo stock`}
              description="Productos con 10 o menos unidades disponibles"
            />
          ) : (
            <SystemAlert
              type="success"
              title="Inventario saludable"
              description="Todos los productos tienen stock suficiente"
            />
          )}
          <SystemAlert
            type="info"
            title={`${health.products?.inactive || 0} productos inactivos`}
            description="Productos en estado borrador o desactivados"
          />
          <SystemAlert
            type="success"
            title="Sistema operando normalmente"
            description="Backend, base de datos y servicios activos"
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, change, up, icon: Icon, color, subtext }) {
  const colorClasses = {
    blue: 'bg-blue-500/20 text-blue-600',
    green: 'bg-green-500/20 text-green-600',
    purple: 'bg-purple-500/20 text-purple-600',
    yellow: 'bg-yellow-500/20 text-yellow-600',
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{typeof value === 'number' ? value.toLocaleString('es-CL') : value}</p>
          {change && (
            <p className={`text-xs mt-1 flex items-center gap-1 ${up === true ? 'text-green-600' : up === false ? 'text-red-600' : 'text-gray-500'}`}>
              {up === true ? <ArrowUpRight className="w-3 h-3" /> : up === false ? <ArrowDownRight className="w-3 h-3" /> : null}
              {change}
            </p>
          )}
          {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClasses[color] || colorClasses.blue}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

function SmallStat({ label, value, icon: Icon }) {
  return (
    <div className="card flex items-center gap-3">
      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-gray-600" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className="text-lg font-bold text-gray-900 truncate">{value}</p>
      </div>
    </div>
  );
}

function QuickAccess({ to, label, sublabel, icon: Icon, color }) {
  const colorClasses = {
    yellow: 'bg-yellow-400/20 text-yellow-600 group-hover:bg-yellow-400/30',
    blue: 'bg-blue-500/20 text-blue-600 group-hover:bg-blue-500/30',
    green: 'bg-green-500/20 text-green-600 group-hover:bg-green-500/30',
    purple: 'bg-purple-500/20 text-purple-600 group-hover:bg-purple-500/30',
    orange: 'bg-orange-500/20 text-orange-600 group-hover:bg-orange-500/30',
    gray: 'bg-gray-500/20 text-gray-600 group-hover:bg-gray-500/30',
  };
  const textClasses = {
    yellow: 'group-hover:text-yellow-600',
    blue: 'group-hover:text-blue-600',
    green: 'group-hover:text-green-600',
    purple: 'group-hover:text-purple-600',
    orange: 'group-hover:text-orange-600',
    gray: 'group-hover:text-gray-600',
  };
  return (
    <Link to={to} className="card hover:shadow-lg transition-shadow group">
      <div className="flex flex-col items-center text-center">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <p className={`font-semibold text-gray-900 ${textClasses[color]}`}>{label}</p>
        <p className="text-xs text-gray-500">{sublabel}</p>
      </div>
    </Link>
  );
}

function SystemAlert({ type, title, description }) {
  const styles = {
    warning: 'bg-yellow-50 border-yellow-100 text-yellow-700',
    success: 'bg-green-50 border-green-100 text-green-700',
    info: 'bg-blue-50 border-blue-100 text-blue-700',
    danger: 'bg-red-50 border-red-100 text-red-700',
  };
  const dotColors = {
    warning: 'bg-yellow-500',
    success: 'bg-green-500',
    info: 'bg-blue-500',
    danger: 'bg-red-500',
  };
  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl border ${styles[type]}`}>
      <div className={`w-2 h-2 ${dotColors[type]} rounded-full mt-2 flex-shrink-0`}></div>
      <div className="min-w-0">
        <p className="font-medium text-gray-900 text-sm">{title}</p>
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      </div>
    </div>
  );
}

function MessagingWidget() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loadingId, setLoadingId] = useState(null);

  useEffect(() => {
    api.get('/admin/users/messaging-stats').then((r) => setStats(r.data.data)).catch(() => {});
    api.get('/admin/users', { params: { per_page: 5, messaging_enabled: 'false' } })
      .then((r) => setUsers(r.data.data || []))
      .catch(() => {});
  }, []);

  const toggle = async (user) => {
    const action = user.messaging_enabled ? 'disable-messaging' : 'enable-messaging';
    setLoadingId(user.id);
    try {
      await api.post(`/admin/users/${user.id}/${action}`,
        action === 'disable-messaging' ? { reason: 'Deshabilitado desde dashboard' } : {}
      );
      setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, messaging_enabled: !u.messaging_enabled } : u));
      if (stats) {
        setStats((s) => ({
          ...s,
          messaging_enabled: user.messaging_enabled ? s.messaging_enabled - 1 : s.messaging_enabled + 1,
          messaging_disabled: user.messaging_enabled ? s.messaging_disabled + 1 : s.messaging_disabled - 1,
        }));
      }
    } catch {}
    finally { setLoadingId(null); }
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-500" />
          <h2 className="text-lg font-semibold text-gray-900">Control de Mensajería</h2>
        </div>
        <Link to="/admin/users" className="text-sm text-accent hover:text-yellow-600 font-medium flex items-center gap-1">
          Gestionar todos <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="p-3 bg-blue-50 rounded-xl text-center">
            <p className="text-2xl font-bold text-gray-900">{stats.total_users || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Usuarios totales</p>
          </div>
          <div className="p-3 bg-green-50 rounded-xl text-center">
            <p className="text-2xl font-bold text-green-600">{stats.messaging_enabled || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Mensajería activa</p>
          </div>
          <div className="p-3 bg-red-50 rounded-xl text-center">
            <p className="text-2xl font-bold text-red-600">{stats.messaging_disabled || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Bloqueados</p>
          </div>
          <div className="p-3 bg-yellow-50 rounded-xl text-center">
            <p className="text-2xl font-bold text-accent">{stats.active_and_enabled || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Activos y habilitados</p>
          </div>
        </div>
      )}

      {users.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 font-medium mb-2 uppercase tracking-wide">Últimos bloqueados</p>
          <div className="space-y-2">
            {users.map((u) => (
              <div key={u.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-semibold text-gray-600 flex-shrink-0">
                    {u.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{u.name}</p>
                    <p className="text-xs text-gray-400 truncate">{u.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => toggle(u)}
                  disabled={loadingId === u.id}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${
                    u.messaging_enabled
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {u.messaging_enabled
                    ? <><MessageSquareOff className="w-3 h-3" /> Bloquear</>
                    : <><CheckCircle className="w-3 h-3" /> Habilitar</>
                  }
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ProductStatusBreakdown({ health }) {
  const items = [
    { label: 'Activos', value: health.active || 0, color: '#22c55e' },
    { label: 'Inactivos', value: health.inactive || 0, color: '#9ca3af' },
    { label: 'Stock bajo (≤10)', value: health.low_stock || 0, color: '#f97316' },
  ];
  const total = items.reduce((s, i) => s + i.value, 0);
  if (total === 0) return <p className="text-gray-500 text-sm text-center py-4">Aún no hay productos</p>;
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {items.map((item) => (
        <div key={item.label} className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-gray-700">{item.label}</span>
            <span className="text-gray-500">{item.value.toLocaleString('es-CL')}</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${(item.value / total) * 100}%`, backgroundColor: item.color }}
            />
          </div>
          <p className="text-xs text-gray-400">{total > 0 ? Math.round((item.value / total) * 100) : 0}% del total</p>
        </div>
      ))}
    </div>
  );
}

function SimpleBarChart({ data }) {
  const datasets = data.datasets || [];
  const labels = data.labels || [];
  const maxValue = Math.max(
    1,
    ...datasets.flatMap((d) => d.data || [])
  );

  return (
    <div className="space-y-4">
      {datasets.map((dataset) => (
        <div key={dataset.label}>
          <div className="flex items-center justify-between text-sm mb-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: dataset.color }}></div>
              <span className="font-medium text-gray-700">{dataset.label}</span>
            </div>
            <span className="text-gray-500 text-xs">Últimos 6 meses</span>
          </div>
          <div className="flex items-end gap-1 h-20">
            {(dataset.data || []).map((value, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-t transition-all"
                  style={{
                    height: `${(value / maxValue) * 100}%`,
                    backgroundColor: dataset.color,
                    minHeight: value > 0 ? '4px' : '0',
                  }}
                  title={`${labels[i]}: ${value}`}
                ></div>
                <span className="text-[10px] text-gray-500">{labels[i]}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
