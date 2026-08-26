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
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifLoading, setNotifLoading] = useState(false);

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

  useEffect(() => {
    const fetchUnread = () => {
      api.get('/admin/notifications/unread-count')
        .then((r) => setUnreadCount(r.data.data?.count || 0))
        .catch(() => {});
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 60000);
    return () => clearInterval(interval);
  }, []);

  const toggleNotifications = () => {
    const opening = !notifOpen;
    setNotifOpen(opening);
    if (opening) {
      setNotifLoading(true);
      api.get('/admin/notifications')
        .then((r) => setNotifications(r.data.data || []))
        .catch(() => setNotifications([]))
        .finally(() => setNotifLoading(false));
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.post('/admin/notifications/read-all');
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch {
      // ignore
    }
  };

  const timeAgo = (dateStr) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 1) return 'ahora';
    if (minutes < 60) return `hace ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `hace ${hours} h`;
    return `hace ${Math.floor(hours / 24)} d`;
  };

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

            <div className="flex items-center gap-4 relative">
              <button
                onClick={toggleNotifications}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors relative"
              >
                <Bell className="w-5 h-5 text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>

              {notifOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setNotifOpen(false)} />
                  <div className="absolute right-0 top-12 w-80 max-h-96 overflow-y-auto bg-white rounded-2xl shadow-xl border border-gray-100 z-40">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                      <p className="font-semibold text-gray-900 text-sm">Notificaciones</p>
                      {unreadCount > 0 && (
                        <button onClick={handleMarkAllRead} className="text-xs text-primary hover:underline">
                          Marcar todas como leídas
                        </button>
                      )}
                    </div>
                    {notifLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : notifications.length === 0 ? (
                      <p className="text-sm text-gray-400 text-center py-8">Sin notificaciones</p>
                    ) : (
                      <ul className="divide-y divide-gray-100">
                        {notifications.map((n) => (
                          <li key={n.id} className={`px-4 py-3 ${!n.is_read ? 'bg-accent-50/40' : ''}`}>
                            <div className="flex items-start gap-2">
                              {!n.is_read && <span className="w-1.5 h-1.5 mt-1.5 rounded-full bg-accent flex-shrink-0" />}
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-900">{n.title}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                                <p className="text-xs text-gray-400 mt-1">{timeAgo(n.created_at)}</p>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </>
              )}
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
