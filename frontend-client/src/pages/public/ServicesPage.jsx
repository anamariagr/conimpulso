import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { serviceService, categoryService } from '../../services/api';
import { Search, Wrench } from 'lucide-react';

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [serviceCategories, setServiceCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [servicesRes, categoriesRes] = await Promise.all([
        serviceService.index(),
        categoryService.index(),
      ]);
      setServices(servicesRes.data.data || []);

      const allCategories = categoriesRes.data.data || [];
      const serviciosParent = allCategories.find(c => c.slug === 'servicios');
      const children = (serviciosParent?.children || [])
        .slice()
        .sort((a, b) => (a.order || 0) - (b.order || 0));
      setServiceCategories(children);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return services.filter(s => {
      const matchesSearch = !q ||
        s.name?.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q);
      const matchesCategory = !selectedCategory ||
        s.name?.toLowerCase().includes(selectedCategory.toLowerCase()) ||
        s.description?.toLowerCase().includes(selectedCategory.toLowerCase());
      return matchesSearch && matchesCategory;
    });
  }, [services, searchQuery, selectedCategory]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Servicios</h1>
        <p className="text-gray-600">Encuentra servicios técnicos y profesionales</p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar servicios..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
        />
      </div>

      {/* Service Subcategories */}
      {serviceCategories.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Wrench className="w-4 h-4 text-gray-600" />
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Categorías de servicios</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === null
                  ? 'bg-yellow-500 text-black shadow-md'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-yellow-500 hover:text-yellow-700'
              }`}
            >
              Todos
            </button>
            {serviceCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                  selectedCategory === cat.name
                    ? 'bg-yellow-500 text-black shadow-md'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-yellow-500 hover:text-yellow-700'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Services List */}
      {filteredServices.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">No se encontraron servicios</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-gray-300 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{service.name || 'Servicio'}</h3>
                  <span className="text-xs text-gray-500">{service.shop?.name || 'Tienda'}</span>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded ${
                  service.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {service.status === 'active' ? 'Activo' : 'Inactivo'}
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                {service.description || 'Sin descripción'}
              </p>

              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-yellow-600">
                  {service.price_type === 'quote' ? 'Por cotización' : `$${service.base_price || '0'}`}
                </span>
                <Link
                  to={`/services/${service.id}`}
                  className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black text-sm font-medium rounded-lg transition-colors"
                >
                  Ver detalles
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
