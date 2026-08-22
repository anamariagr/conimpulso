import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useSiteStore } from '../../stores/siteStore';
import { authService } from '../../services/api';
import toast from 'react-hot-toast';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  MessageSquare,
  FileText,
  Wallet,
  Settings,
  TrendingUp,
  Briefcase,
  Target,
  Sparkles,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Store,
  Award,
} from 'lucide-react';

export default function DashboardLayout() {
  const { user, logout, isVendor, isAdvisor, viewAsVendor, viewAsAdvisor, clearActiveRole, setActiveRole, checkAuth } = useAuthStore();
  const { logoUrl, siteName, aiInsightsEnabled } = useSiteStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [grantingRole, setGrantingRole] = useState(false);

  // Get computed role values - use view-as if activeRole is set for clients
  const showVendorMenu = viewAsVendor();
  const showAdvisorMenu = viewAsAdvisor();
  const hasActualVendorRole = isVendor();
  const hasActualAdvisorRole = isAdvisor();
  const isOnlyClient = !hasActualVendorRole && !hasActualAdvisorRole;

  // Base menu items - always visible
  const baseMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: ShoppingBag, label: 'Pedidos', href: '/dashboard/orders' },
    { icon: MessageSquare, label: 'Mensajes', href: '/dashboard/messages', badge: 3 },
    { icon: FileText, label: 'Cotizaciones', href: '/dashboard/quotes' },
    { icon: Wallet, label: 'Billetera', href: '/dashboard/wallet' },
    ...(aiInsightsEnabled ? [{ icon: Sparkles, label: 'AI Insights', href: '/ai' }] : []),
    { icon: Briefcase, label: 'B2B', href: '/dashboard/b2b' },
    { icon: Settings, label: 'Configuración', href: '/dashboard/settings' },
  ];

  // Vendor-only menu items
  const vendorMenuItems = [
    { icon: Package, label: 'Productos', href: '/dashboard/products' },
    { icon: Store, label: 'Mi Tienda', href: '/dashboard/store' },
    { icon: TrendingUp, label: 'Analíticas', href: '/dashboard/analytics' },
  ];

  // Advisor-only menu items
  const advisorMenuItems = [
    { icon: Target, label: 'Leads', href: '/dashboard/leads' },
    { icon: Award, label: 'Asesores', href: '/dashboard/advisors' },
  ];

  // Build menu based on user roles (actual roles OR view-as roles)
  const menuItems = [
    ...baseMenuItems,
    ...(showVendorMenu ? vendorMenuItems : []),
    ...(showAdvisorMenu ? advisorMenuItems : []),
  ];

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  const handleLogout = () => {
    clearActiveRole();
    logout();
    navigate('/login');
  };

  // Grants the real backend role (if missing) before switching to that dashboard view.
  const becomeRole = async (role, hasRole, goal, href) => {
    if (grantingRole) return;
    if (hasRole) {
      setActiveRole(role);
      navigate(href);
      return;
    }
    setGrantingRole(true);
    try {
      await authService.completeOnboarding({ goal });
      await checkAuth();
      setActiveRole(role);
      navigate(href);
    } catch (err) {
      toast.error(err.response?.data?.message || 'No se pudo activar el modo vendedor/asesor');
    } finally {
      setGrantingRole(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-primary text-white flex flex-col transition-all duration-300`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-gray-800">
          <Link to="/" className="flex items-center gap-2 min-w-0">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={siteName}
                className={`object-contain flex-shrink-0 brightness-0 invert ${sidebarOpen ? 'h-9 max-w-[140px]' : 'h-9 w-9'}`}
              />
            ) : (
              <>
                <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-xl">C</span>
                </div>
                {sidebarOpen && (
                  <span className="font-bold text-xl whitespace-nowrap">{siteName}</span>
                )}
              </>
            )}
          </Link>
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-4 text-gray-400 hover:text-white transition-colors"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Navigation */}
        <nav className="flex-1 p-2 overflow-y-auto">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.href ||
                (item.href !== '/dashboard' && location.pathname.startsWith(item.href));

              return (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isActive
                        ? 'bg-accent text-white font-semibold'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {sidebarOpen && (
                      <>
                        <span className="whitespace-nowrap">{item.label}</span>
                        {item.badge && (
                          <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Role Switch - always show the other two roles */}
        {sidebarOpen && (() => {
          const currentRole = showVendorMenu ? 'vendor' : showAdvisorMenu ? 'advisor' : 'buyer';
          const roleOptions = [
            {
              key: 'buyer',
              label: 'Ser Comprador',
              icon: ShoppingBag,
              className: 'bg-gray-600 hover:bg-gray-700',
              onClick: () => { setActiveRole('buyer'); navigate('/dashboard'); },
            },
            {
              key: 'vendor',
              label: 'Ser Vendedor',
              icon: Store,
              className: 'bg-green-600 hover:bg-green-700',
              onClick: () => becomeRole('vendor', hasActualVendorRole, 'sell_products', '/dashboard/vendor'),
            },
            {
              key: 'advisor',
              label: 'Ser Asesor',
              icon: Award,
              className: 'bg-blue-600 hover:bg-blue-700',
              onClick: () => becomeRole('advisor', hasActualAdvisorRole, 'sell_services', '/dashboard/advisors'),
            },
          ];

          return (
            <div className="px-3 py-2 border-t border-gray-800">
              <p className="text-xs text-gray-500 px-2 mb-2">Cambiar rol</p>
              <div className="space-y-2">
                {roleOptions
                  .filter((option) => option.key !== currentRole)
                  .map((option) => (
                    <button
                      key={option.key}
                      onClick={option.onClick}
                      disabled={grantingRole}
                      className={`w-full flex items-center gap-3 px-4 py-2 ${option.className} text-white rounded-lg transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <option.icon className="w-4 h-4" />
                      <span>{option.label}</span>
                    </button>
                  ))}
              </div>
            </div>
          );
        })()}

        {/* User Section */}
        <div className="p-4 border-t border-gray-800">
          {sidebarOpen ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-bold">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white truncate">{user?.name || 'Usuario'}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                title="Cerrar sesión"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full p-3 text-gray-400 hover:text-red-400 transition-colors flex justify-center"
              title="Cerrar sesión"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Link to="/dashboard" className="hover:text-accent transition-colors">
                Dashboard
              </Link>
              {location.pathname !== '/dashboard' && (
                <>
                  <ChevronRight className="w-4 h-4" />
                  <span className="text-gray-700 capitalize">
                    {location.pathname.split('/').pop()}
                  </span>
                </>
              )}
            </div>
            <div className="text-sm text-gray-500">
              {new Date().toLocaleDateString('es-ES', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 relative">
          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-50">
              <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500">Cargando...</p>
              </div>
            </div>
          )}

          <Outlet />
        </div>
      </main>
    </div>
  );
}
