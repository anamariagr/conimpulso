import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useSiteStore } from '../../stores/siteStore';
import { ShoppingBag, User, Menu, X, ChevronDown, LayoutDashboard, Settings, Wallet, LogOut, Shield } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function Navbar() {
  const { isAuthenticated, user, logout, isSuperAdmin } = useAuthStore();
  const { logoUrl, siteName, fetchSettings } = useSiteStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            {logoUrl ? (
              <img src={logoUrl} alt={siteName} className="h-10 w-auto max-w-[160px] object-contain" />
            ) : (
              <>
                <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center">
                  <span className="text-primary font-bold text-xl">C</span>
                </div>
                <span className="text-primary font-bold text-xl hidden sm:block">{siteName}</span>
              </>
            )}
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/products" className="text-primary hover:text-accent transition-colors font-medium">
              Productos
            </Link>
            <Link to="/stores" className="text-primary hover:text-accent transition-colors font-medium">
              Tiendas
            </Link>
            <Link to="/services" className="text-primary hover:text-accent transition-colors font-medium">
              Servicios
            </Link>
            <Link to="/blog" className="text-primary hover:text-accent transition-colors font-medium">
              Blog
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Cart Icon */}
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors relative">
              <ShoppingBag className="w-5 h-5 text-primary" />
            </button>

            {isAuthenticated ? (
              /* User Dropdown */
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  {/* Avatar */}
                  <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <span className="text-primary font-bold text-sm">
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                  {/* Name */}
                  <span className="hidden lg:block text-primary font-medium text-sm">
                    {user?.name?.split(' ')[0] || 'Usuario'}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 animate-fadeIn">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="font-medium text-primary">{user?.name}</p>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      {isSuperAdmin() ? (
                        <>
                          <Link
                            to="/admin"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <Shield className="w-4 h-4" />
                            Panel de Admin
                          </Link>
                          <Link
                            to="/dashboard"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <LayoutDashboard className="w-4 h-4" />
                            Mi Dashboard
                          </Link>
                        </>
                      ) : (
                        <Link
                          to="/dashboard"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          Dashboard
                        </Link>
                      )}
                      <Link
                        to="/dashboard/wallet"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Wallet className="w-4 h-4" />
                        Mi Billetera
                      </Link>
                      <Link
                        to="/dashboard/settings"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        Configuración
                      </Link>
                    </div>

                    {/* Logout */}
                    <div className="border-t border-gray-100 pt-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Cerrar sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Login/Register */
              <div className="hidden md:flex items-center gap-3">
                <Link to="/login" className="text-sm font-medium text-primary hover:text-accent transition-colors">
                  Iniciar sesión
                </Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-4">
                  Registrarse
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? (
                <X className="w-6 h-6 text-primary" />
              ) : (
                <Menu className="w-6 h-6 text-primary" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <nav className="flex flex-col gap-1">
              <Link
                to="/products"
                className="px-4 py-2 text-primary hover:bg-gray-50 rounded-lg font-medium"
                onClick={() => setMobileOpen(false)}
              >
                Productos
              </Link>
              <Link
                to="/stores"
                className="px-4 py-2 text-primary hover:bg-gray-50 rounded-lg font-medium"
                onClick={() => setMobileOpen(false)}
              >
                Tiendas
              </Link>
              <Link
                to="/services"
                className="px-4 py-2 text-primary hover:bg-gray-50 rounded-lg font-medium"
                onClick={() => setMobileOpen(false)}
              >
                Servicios
              </Link>
              <Link
                to="/blog"
                className="px-4 py-2 text-primary hover:bg-gray-50 rounded-lg font-medium"
                onClick={() => setMobileOpen(false)}
              >
                Blog
              </Link>

              {isAuthenticated ? (
                <>
                  <div className="border-t border-gray-100 my-2 pt-2">
                    {isSuperAdmin() ? (
                      <>
                        <Link
                          to="/admin"
                          className="flex items-center gap-3 px-4 py-2 text-primary hover:bg-gray-50 rounded-lg"
                          onClick={() => setMobileOpen(false)}
                        >
                          <Shield className="w-5 h-5" />
                          Panel de Admin
                        </Link>
                        <Link
                          to="/dashboard"
                          className="flex items-center gap-3 px-4 py-2 text-primary hover:bg-gray-50 rounded-lg"
                          onClick={() => setMobileOpen(false)}
                        >
                          <LayoutDashboard className="w-5 h-5" />
                          Mi Dashboard
                        </Link>
                      </>
                    ) : (
                      <Link
                        to="/dashboard"
                        className="flex items-center gap-3 px-4 py-2 text-primary hover:bg-gray-50 rounded-lg"
                        onClick={() => setMobileOpen(false)}
                      >
                        <LayoutDashboard className="w-5 h-5" />
                        Dashboard
                      </Link>
                    )}
                    <Link
                      to="/dashboard/wallet"
                      className="flex items-center gap-3 px-4 py-2 text-primary hover:bg-gray-50 rounded-lg"
                      onClick={() => setMobileOpen(false)}
                    >
                      <Wallet className="w-5 h-5" />
                      Mi Billetera
                    </Link>
                    <Link
                      to="/dashboard/settings"
                      className="flex items-center gap-3 px-4 py-2 text-primary hover:bg-gray-50 rounded-lg"
                      onClick={() => setMobileOpen(false)}
                    >
                      <Settings className="w-5 h-5" />
                      Configuración
                    </Link>
                  </div>
                  <button
                    onClick={() => { handleLogout(); setMobileOpen(false); }}
                    className="flex items-center gap-3 w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <LogOut className="w-5 h-5" />
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <div className="border-t border-gray-100 my-2 pt-2 flex flex-col gap-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-center text-primary font-medium border border-gray-300 rounded-lg hover:bg-gray-50"
                    onClick={() => setMobileOpen(false)}
                  >
                    Iniciar sesión
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 text-center bg-accent text-primary font-semibold rounded-lg hover:bg-yellow-400"
                    onClick={() => setMobileOpen(false)}
                  >
                    Registrarse
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}