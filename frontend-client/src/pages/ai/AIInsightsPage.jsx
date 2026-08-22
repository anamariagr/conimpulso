import { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, Package, Lightbulb, Loader, AlertCircle } from 'lucide-react';
import { aiService, categoryService } from '../../services/api';

export default function AIInsightsPage() {
  const [activeTab, setActiveTab] = useState('suggestions');
  const [categoryInput, setCategoryInput] = useState('');
  const [categoryResult, setCategoryResult] = useState(null);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [categoryError, setCategoryError] = useState(null);

  const [trendingProducts, setTrendingProducts] = useState([]);
  const [trendingLoading, setTrendingLoading] = useState(false);

  const [similarProducts, setSimilarProducts] = useState([]);
  const [similarLoading, setSimilarLoading] = useState(false);

  const handleSuggestCategory = async () => {
    if (!categoryInput.trim()) return;
    try {
      setCategoryLoading(true);
      setCategoryError(null);
      setCategoryResult(null);
      const response = await aiService.suggestCategory(categoryInput, '');
      setCategoryResult(response.data.data);
    } catch (err) {
      setCategoryError(err.message);
    } finally {
      setCategoryLoading(false);
    }
  };

  const handleTrendingProducts = async () => {
    try {
      setTrendingLoading(true);
      const response = await aiService.trendingProducts();
      setTrendingProducts(response.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setTrendingLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'trending') {
      handleTrendingProducts();
    }
  }, [activeTab]);

  const tabs = [
    { id: 'suggestions', label: 'Sugerencias', icon: Lightbulb },
    { id: 'trending', label: 'Tendencias', icon: TrendingUp },
    { id: 'similar', label: 'Similares', icon: Package },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-gradient-to-br from-accent-500 to-orange-500 rounded-xl">
          <Sparkles className="h-8 w-8 text-black" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">AI Insights</h1>
          <p className="text-gray-400">Inteligencia artificial para tu negocio</p>
        </div>
      </div>

      <div className="flex gap-2 border-b border-gray-800">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-accent-500 border-b-2 border-accent-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'suggestions' && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Sugerencia de Categorías</h3>
          <p className="text-gray-400 mb-4">
            Ingresa el nombre y descripción de un producto para que la IA sugiera la mejor categoría.
          </p>

          <div className="flex gap-3 mb-6">
            <input
              type="text"
              value={categoryInput}
              onChange={(e) => setCategoryInput(e.target.value)}
              placeholder="Ej: Camisa de algodón premium"
              className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent"
            />
            <button
              onClick={handleSuggestCategory}
              disabled={categoryLoading || !categoryInput.trim()}
              className="px-6 py-3 bg-accent-500 hover:bg-accent-600 text-black font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {categoryLoading ? <Loader className="animate-spin" size={20} /> : 'Analizar'}
            </button>
          </div>

          {categoryError && (
            <div className="flex items-center gap-2 p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-400 mb-4">
              <AlertCircle size={20} />
              {categoryError}
            </div>
          )}

          {categoryResult && (
            <div className="p-4 bg-gray-800 rounded-lg">
              <h4 className="text-lg font-semibold text-accent-500 mb-2">
                Categoría Sugerida: {categoryResult.suggested_category}
              </h4>
              <p className="text-gray-400 mb-2">Confianza: {Math.round(categoryResult.confidence * 100)}%</p>
              {Object.keys(categoryResult.all_matches || {}).length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-gray-400 mb-2">Matches:</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(categoryResult.all_matches).map(([cat, score]) => (
                      <span key={cat} className="px-3 py-1 bg-gray-700 rounded-full text-sm text-white">
                        {cat}: {score}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-8">
            <h4 className="text-lg font-semibold text-white mb-4">Categorías Disponibles</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {['electronics', 'clothing', 'home', 'sports', 'beauty', 'books', 'toys', 'food'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryInput(cat)}
                  className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-left transition-colors capitalize"
                >
                  <span className="text-white">{cat}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'trending' && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Productos Trending</h3>
          {trendingLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader className="animate-spin h-8 w-8 text-accent-500" />
            </div>
          ) : trendingProducts.length > 0 ? (
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
              {trendingProducts.map((product) => (
                <div key={product.id} className="bg-gray-800 rounded-lg p-4">
                  <div className="h-32 bg-gray-700 rounded-lg mb-3 flex items-center justify-center">
                    <Package className="h-12 w-12 text-gray-600" />
                  </div>
                  <h4 className="font-medium text-white truncate">{product.name || 'Producto'}</h4>
                  <p className="text-sm text-gray-400">${product.price || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {product.views || 0} vistas
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No hay productos trending disponibles.</p>
          )}
        </div>
      )}

      {activeTab === 'similar' && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Productos Similares</h3>
          <p className="text-gray-400">
            Para ver productos similares, visita la página de detalle de un producto.
          </p>

          <div className="mt-6 flex items-center justify-center h-32 bg-gray-800 rounded-lg">
            <Package className="h-12 w-12 text-gray-600 mr-4" />
            <span className="text-gray-500">Explora productos para ver recomendaciones similares.</span>
          </div>
        </div>
      )}
    </div>
  );
}
