import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productService, categoryService } from '../../services/api';
import { Search, Filter, Grid, List } from 'lucide-react';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsRes, categoriesRes] = await Promise.all([
        productService.index(),
        categoryService.index(),
      ]);
      setProducts(productsRes.data.data || []);
      setCategories(categoriesRes.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p =>
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Productos</h1>
        <p className="text-gray-600">Explora productos de productores reales</p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-3 rounded-lg ${viewMode === 'grid' ? 'bg-yellow-500 text-black' : 'bg-gray-100 text-gray-600'}`}
          >
            <Grid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-3 rounded-lg ${viewMode === 'list' ? 'bg-yellow-500 text-black' : 'bg-gray-100 text-gray-600'}`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        <button className="px-4 py-2 bg-yellow-500 text-black rounded-full font-medium whitespace-nowrap">
          Todos
        </button>
        {categories.filter(c => !c.parent_id).map((category) => (
          <button
            key={category.id}
            className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-full font-medium whitespace-nowrap transition-colors"
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">No se encontraron productos</p>
        </div>
      ) : (
        <div className={viewMode === 'grid'
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'
          : 'flex flex-col gap-4'
        }>
          {filteredProducts.map((product) => (
            <Link
              key={product.id}
              to={`/products/${product.id}`}
              className={`bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all ${viewMode === 'list' ? 'flex' : ''}`}
            >
              <div className={`bg-gray-100 ${viewMode === 'grid' ? 'aspect-square' : 'w-48 h-48'} flex items-center justify-center`}>
                <span className="text-6xl text-gray-300">📦</span>
              </div>
              <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                <h3 className="font-semibold text-gray-900 mb-1">{product.name || 'Producto'}</h3>
                <p className="text-sm text-gray-500 mb-2 line-clamp-2">{product.description || 'Sin descripción'}</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-yellow-600">
                    ${product.price || '0.00'}
                  </span>
                  {product.shop && (
                    <span className="text-xs text-gray-400">{product.shop.name}</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
