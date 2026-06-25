import { Link } from 'react-router-dom';
import { useSiteStore } from '../../stores/siteStore';

export default function Footer() {
  const { logoUrl, siteName } = useSiteStore();
  return (
    <footer className="bg-primary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              {logoUrl ? (
                <img src={logoUrl} alt={siteName} className="h-10 max-w-[160px] object-contain brightness-0 invert" />
              ) : (
                <>
                  <div className="w-9 h-9 bg-accent rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold text-lg">C</span>
                  </div>
                  <span className="font-bold text-xl text-white">{siteName}</span>
                </>
              )}
            </div>
            <p className="text-gray-400 text-sm">
              El marketplace de productores directos, fabricantes y artesanos.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">Explorar</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link to="/products" className="hover:text-accent transition-colors">Productos</Link></li>
              <li><Link to="/stores" className="hover:text-accent transition-colors">Tiendas</Link></li>
              <li><Link to="/services" className="hover:text-accent transition-colors">Servicios</Link></li>
              <li><Link to="/b2b" className="hover:text-accent transition-colors">B2B</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Recursos</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link to="/help" className="hover:text-accent transition-colors">Ayuda</Link></li>
              <li><Link to="/faq" className="hover:text-accent transition-colors">FAQ</Link></li>
              <li><Link to="/contact" className="hover:text-accent transition-colors">Contacto</Link></li>
              <li><Link to="/blog" className="hover:text-accent transition-colors">Blog</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link to="/terminos" className="hover:text-accent transition-colors">Términos</Link></li>
              <li><Link to="/privacidad" className="hover:text-accent transition-colors">Privacidad</Link></li>
              <li><Link to="/cookies" className="hover:text-accent transition-colors">Cookies</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} ConImpulso. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}