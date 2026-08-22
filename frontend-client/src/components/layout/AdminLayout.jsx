import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import { useSiteStore } from '../../stores/siteStore';
import {
  LayoutDashboard,
  Users,
  Store,
  Package,
  Grid3X3,
  Settings,
  LogOut,
  Bell,
  Search,
  Menu,
  X,
  ChevronRight,
  Layout,
  Wallet,
  BookOpen,
  Truck,
  Images,
  MessageSquare,
  ShoppingBag,
} from 'lucide-react';

const adminMenuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
  { name: 'Editor de Inicio', icon: Layout, path: '/admin/homepage-editor' },
  { name: 'Galería', icon: Images, path: '/admin/media' },
  { name: 'Usuarios', icon: Users, path: '/admin/users' },
  { name: 'Tiendas', icon: Store, path: '/admin/shops' },
  { name: 'Productos', icon: Package, path: '/admin/products' },
  { name: 'Categorías', icon: Grid3X3, path: '/admin/categories' },
  { name: 'Saldo / Wallet', icon: Wallet, path: '/admin/wallet' },
  { name: 'Pedidos', icon: ShoppingBag, path: '/admin/product-orders' },
  { name: 'Mensajes', icon: MessageSquare, path: '/admin/messages' },
  { name: 'Blog', icon: BookOpen, path: '/admin/blog' },
  { name: 'Banner Logística', icon: Truck, path: '/admin/logistics-banner' },
  { name: 'Configuración', icon: Settings, path: '/admin/settings' },
];

export default function AdminLayout() {
  const { user, logout, isSuperAdmin } = useAuthStore();
  const { logoUrl, siteName } = useSiteStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const fetchPending = () => {
      api.get('/admin/product-orders/pending-count')
        .then((r) => setPendingCount(r.data.data?.count || 0))
        .catch(() => {});
    };
    fetchPending();
    const interval = setInterval(fetchPending, 60000);
    return () => clearInterval(interval);
  }, []);

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isSuperAdmin()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Acceso Denegado</h1>
          <p className="text-gray-600">No tienes permisos para acceder al panel de administración.</p>
          <Link to="/dashboard" className="btn-primary mt-4 inline-block">
            Volver al Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-primary text-white flex flex-col transition-all duration-300`}
      >
        {/* Logo */}
        <div className="p-5 border-b border-gray-800 flex items-center justify-between">
          <Link to="/admin" className="flex items-center gap-2 min-w-0">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={siteName}
                className={`object-contain flex-shrink-0 brightness-0 invert ${sidebarOpen ? 'h-9 max-w-[130px]' : 'h-9 w-9'}`}
              />
            ) : (
              <>
                <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-xl">C</span>
                </div>
                {sidebarOpen && (
                  <span className="font-bold text-lg">{siteName} Admin</span>
                )}
              </>
            )}
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {adminMenuItems.map((item) => {
              const isPurchase = item.path === '/admin/product-orders';
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                      isActive(item.path)
                        ? 'bg-accent text-white font-semibold'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {sidebarOpen && (
                      <span className="flex-1">{item.name}</span>
                    )}
                    {isPurchase && pendingCount > 0 && (
                      <span className="bg-red-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                        {pendingCount}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-primary font-bold">
                {user?.name?.charAt(0)?.toUpperCase() || 'A'}
              </span>
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white truncate">{user?.name || 'Admin'}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  className="input-field pl-10 w-full"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors relative">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
