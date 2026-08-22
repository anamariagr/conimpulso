import { Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useSiteStore } from '../../stores/siteStore';
import { Package, ShoppingBag, Target, TrendingUp, Users, Briefcase, Star, Eye, EyeOff, Sparkles } from 'lucide-react';

export default function DashboardPage() {
  const { user, viewAsVendor, viewAsAdvisor, setActiveRole, activeRole } = useAuthStore();
  const { aiInsightsEnabled } = useSiteStore();

  const showVendorContent = viewAsVendor();
  const showAdvisorContent = viewAsAdvisor();
  const isInRoleView = activeRole === 'vendor' || activeRole === 'advisor';

  // Determine current view mode
  const currentView = activeRole === 'vendor' ? 'vendor' : activeRole === 'advisor' ? 'advisor' : 'client';

  return (
    <div>
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary">Bienvenido, {user?.name}</h1>
        <p className="text-gray-500">
          {currentView === 'vendor' ? 'Panel de vendedor' :
           currentView === 'advisor' ? 'Panel de asesor' : 'Este es tu panel de control'}
        </p>
      </div>

      {/* Role Status Banner - Only shows when in role view */}
      {isInRoleView && (
        <div className="mb-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                currentView === 'vendor' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {currentView === 'vendor' ? '🛒 Vista de Vendedor' : '📊 Vista de Asesor'}
              </span>
              <p className="text-sm text-gray-600">
                {currentView === 'vendor'
                  ? 'Estás viendo tu dashboard como vendedor. Los datos y métricas son los de tu tienda.'
                  : 'Estás viendo tu dashboard como asesor. Los datos y métricas son de tu gestión de leads.'}
              </p>
            </div>
            <button
              onClick={() => setActiveRole('buyer')}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm font-medium"
            >
              <EyeOff className="w-4 h-4" />
              Volver a Cliente
            </button>
          </div>
        </div>
      )}

      {/* Vendor Metrics */}
      {showVendorContent && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <p className="text-sm text-gray-500 font-medium mb-1">Ventas del mes</p>
              <p className="text-3xl font-bold text-primary">$1,234,500</p>
              <p className="text-xs text-green-600 mt-1">+12% vs mes anterior</p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <p className="text-sm text-gray-500 font-medium mb-1">Pedidos</p>
              <p className="text-3xl font-bold text-primary">156</p>
              <p className="text-xs text-green-600 mt-1">+8 nuevos hoy</p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <p className="text-sm text-gray-500 font-medium mb-1">Visitantes</p>
              <p className="text-3xl font-bold text-primary">12,345</p>
              <p className="text-xs text-green-600 mt-1">+15% esta semana</p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <p className="text-sm text-gray-500 font-medium mb-1">Productos</p>
              <p className="text-3xl font-bold text-primary">89</p>
              <p className="text-xs text-gray-500 mt-1">24 agotados</p>
            </div>
          </div>

          {/* Vendor Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h2 className="text-lg font-semibold text-primary mb-4">Acciones rápidas</h2>
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/dashboard/products"
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-accent text-primary font-semibold rounded-lg hover:bg-yellow-400 transition"
                >
                  <Package className="w-5 h-5" />
                  Productos
                </Link>
                <Link
                  to="/dashboard/orders"
                  className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-300 text-primary rounded-lg hover:border-accent hover:text-accent transition"
                >
                  <ShoppingBag className="w-5 h-5" />
                  Pedidos
                </Link>
                <Link
                  to="/dashboard/store"
                  className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-300 text-primary rounded-lg hover:border-accent hover:text-accent transition"
                >
                  <Star className="w-5 h-5" />
                  Mi Tienda
                </Link>
                <Link
                  to="/dashboard/analytics"
                  className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-300 text-primary rounded-lg hover:border-accent hover:text-accent transition"
                >
                  <TrendingUp className="w-5 h-5" />
                  Analíticas
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h2 className="text-lg font-semibold text-primary mb-4">Resumen de Ventas</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-primary">Ventas</p>
                      <p className="text-sm text-gray-500">Últimos 30 días</p>
                    </div>
                  </div>
                  <span className="text-green-600 font-semibold">+12.5%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-primary">Nuevos clientes</p>
                      <p className="text-sm text-gray-500">Este mes</p>
                    </div>
                  </div>
                  <span className="text-blue-600 font-semibold">+24</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-primary">B2B</p>
                      <p className="text-sm text-gray-500">Conexiones activas</p>
                    </div>
                  </div>
                  <span className="text-primary font-semibold">8</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Advisor Metrics */}
      {showAdvisorContent && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <p className="text-sm text-gray-500 font-medium mb-1">Leads</p>
              <p className="text-3xl font-bold text-primary">42</p>
              <p className="text-xs text-blue-600 mt-1">3 sin contactar</p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <p className="text-sm text-gray-500 font-medium mb-1">Clientes activos</p>
              <p className="text-3xl font-bold text-primary">18</p>
              <p className="text-xs text-green-600 mt-1">+2 esta semana</p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <p className="text-sm text-gray-500 font-medium mb-1">Conversiones</p>
              <p className="text-3xl font-bold text-primary">67%</p>
              <p className="text-xs text-green-600 mt-1">+5% este mes</p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <p className="text-sm text-gray-500 font-medium mb-1">Ingresos</p>
              <p className="text-3xl font-bold text-primary">$5,670,000</p>
              <p className="text-xs text-green-600 mt-1">+18% este mes</p>
            </div>
          </div>

          {/* Advisor Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h2 className="text-lg font-semibold text-primary mb-4">Acciones rápidas</h2>
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/dashboard/leads"
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
                >
                  <Target className="w-5 h-5" />
                  Leads
                </Link>
                <Link
                  to="/dashboard/advisors"
                  className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 transition"
                >
                  <Star className="w-5 h-5" />
                  Asesores
                </Link>
                {aiInsightsEnabled && (
                  <Link
                    to="/ai"
                    className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-300 text-primary rounded-lg hover:border-accent hover:text-accent transition"
                  >
                    <Sparkles className="w-5 h-5" />
                    AI Insights
                  </Link>
                )}
                <Link
                  to="/dashboard/wallet"
                  className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-300 text-primary rounded-lg hover:border-accent hover:text-accent transition"
                >
                  <Briefcase className="w-5 h-5" />
                  Billetera
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h2 className="text-lg font-semibold text-primary mb-4">Resumen de Gestión</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Target className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-primary">Leads nuevos</p>
                      <p className="text-sm text-gray-500">Esta semana</p>
                    </div>
                  </div>
                  <span className="text-blue-600 font-semibold">+18</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-primary">Ventas cerradas</p>
                      <p className="text-sm text-gray-500">Este mes</p>
                    </div>
                  </div>
                  <span className="text-green-600 font-semibold">12</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Star className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-primary">Tasa de conversión</p>
                      <p className="text-sm text-gray-500">Tasa de conversión</p>
                    </div>
                  </div>
                  <span className="text-primary font-semibold">67%</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Client View (default when no role view is active) */}
      {!showVendorContent && !showAdvisorContent && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <p className="text-sm text-gray-500 font-medium mb-1">Pedidos activos</p>
              <p className="text-3xl font-bold text-primary">3</p>
              <p className="text-xs text-gray-500 mt-1">En proceso de envío</p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <p className="text-sm text-gray-500 font-medium mb-1">Compras totales</p>
              <p className="text-3xl font-bold text-primary">$456,000</p>
              <p className="text-xs text-green-600 mt-1">+2 este mes</p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <p className="text-sm text-gray-500 font-medium mb-1">Cupones</p>
              <p className="text-3xl font-bold text-primary">2</p>
              <p className="text-xs text-accent mt-1">Disponibles para usar</p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <p className="text-sm text-gray-500 font-medium mb-1">Billetera</p>
              <p className="text-3xl font-bold text-primary">$125,000</p>
              <p className="text-xs text-gray-500 mt-1">Saldo disponible</p>
            </div>
          </div>

          {/* Client Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h2 className="text-lg font-semibold text-primary mb-4">Acciones rápidas</h2>
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/dashboard/orders"
                  className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-300 text-primary rounded-lg hover:border-accent hover:text-accent transition"
                >
                  <ShoppingBag className="w-5 h-5" />
                  Mis Pedidos
                </Link>
                <Link
                  to="/dashboard/wallet"
                  className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-300 text-primary rounded-lg hover:border-accent hover:text-accent transition"
                >
                  <Briefcase className="w-5 h-5" />
                  Billetera
                </Link>
                {aiInsightsEnabled && (
                  <Link
                    to="/ai"
                    className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-300 text-primary rounded-lg hover:border-accent hover:text-accent transition"
                  >
                    <Sparkles className="w-5 h-5" />
                    AI Insights
                  </Link>
                )}
                <Link
                  to="/dashboard/b2b"
                  className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-300 text-primary rounded-lg hover:border-accent hover:text-accent transition"
                >
                  <Briefcase className="w-5 h-5" />
                  B2B
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h2 className="text-lg font-semibold text-primary mb-4">Tu Actividad</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="font-medium text-primary">Pedidos recientes</p>
                      <p className="text-sm text-gray-500">último mes</p>
                    </div>
                  </div>
                  <span className="text-primary font-semibold">5</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="font-medium text-primary">B2B</p>
                      <p className="text-sm text-gray-500">Conexiones activas</p>
                    </div>
                  </div>
                  <span className="text-primary font-semibold">3</span>
                </div>
                {aiInsightsEnabled && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <p className="font-medium text-primary">AI Insights</p>
                        <p className="text-sm text-gray-500">Recomendaciones</p>
                      </div>
                    </div>
                    <Link to="/ai" className="text-accent font-semibold hover:underline text-sm">Ver</Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}