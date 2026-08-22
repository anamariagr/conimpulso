import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Plus, Loader2, Edit2, Trash2, ExternalLink, AlertCircle } from 'lucide-react';
import api from '../../services/api';

const STATUS_LABELS = {
  active:   { label: 'Activo',   cls: 'bg-green-100 text-green-700' },
  inactive: { label: 'Inactivo', cls: 'bg-gray-100 text-gray-500' },
  draft:    { label: 'Borrador', cls: 'bg-accent-100 text-accent-700' },
  pending:  { label: 'Revisión', cls: 'bg-blue-100 text-blue-700' },
};

function ProductRow({ product, onDelete }) {
  const [deleting, setDeleting] = useState(false);
  const image = product.images?.[0];
  const price = Number(product.price);
  const status = STATUS_LABELS[product.status] || STATUS_LABELS.draft;

  const handleDelete = async () => {
    if (!window.confirm(`¿Eliminar "${product.name}"? Esta acción no se puede deshacer.`)) return;
    setDeleting(true);
    try {
      await api.delete(`/products/${product.id}`);
      onDelete(product.id);
    } catch {
      alert('No se pudo eliminar el producto. Intenta de nuevo.');
      setDeleting(false);
    }
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-accent/40 transition-colors">
      {/* Thumbnail */}
      <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
        {image ? (
          <img src={image} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-6 h-6 text-gray-300" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-primary truncate">{product.name}</p>
        <div className="flex items-center gap-3 mt-0.5">
          {price > 0 && (
            <span className="text-sm text-gray-600">${price.toLocaleString('es-CO')}</span>
          )}
          {product.stock != null && (
            <span className="text-xs text-gray-400">{product.stock} en stock</span>
          )}
        </div>
      </div>

      {/* Status badge + view link */}
      <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${status.cls}`}>
          {status.label}
        </span>
        {product.slug && (
          <Link
            to={`/products/${product.slug}`}
            title="Ver producto público"
            className="p-1.5 text-gray-400 hover:text-accent hover:bg-accent/10 rounded-lg transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <Link
          to={`/dashboard/products/${product.slug || product.id}/edit`}
          className="p-2 text-gray-400 hover:text-accent hover:bg-accent/10 rounded-lg transition-colors"
          title="Editar"
        >
          <Edit2 className="w-4 h-4" />
        </Link>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
          title="Eliminar"
        >
          {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

export default function ProductsListPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/my/products')
      .then((res) => setProducts(res.data.data || []))
      .catch(() => setError('No se pudieron cargar los productos.'))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = (id) => setProducts((prev) => prev.filter((p) => p.id !== id));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">Mis productos</h1>
          {!loading && products.length > 0 && (
            <p className="text-sm text-gray-500 mt-0.5">{products.length} producto{products.length !== 1 ? 's' : ''}</p>
          )}
        </div>
        <Link
          to="/dashboard/products/new"
          className="flex items-center gap-2 px-4 py-2 bg-accent text-white font-semibold rounded-lg hover:bg-accent-400 transition"
        >
          <Plus className="w-5 h-5" />
          Nuevo producto
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <AlertCircle className="w-10 h-10 text-red-400" />
          <p className="text-gray-600">{error}</p>
          <button onClick={() => { setError(''); setLoading(true); api.get('/my/products').then((r) => setProducts(r.data.data || [])).catch(() => setError('Error al cargar.')).finally(() => setLoading(false)); }} className="btn-outline text-sm">
            Reintentar
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-primary mb-2">Aún no tienes productos</h2>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Agrega tu primer producto para que los compradores puedan encontrarte y empezar a vender.
          </p>
          <Link
            to="/dashboard/products/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white font-semibold rounded-lg hover:bg-accent-400 transition"
          >
            <Plus className="w-5 h-5" />
            Agregar mi primer producto
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {products.map((p) => (
            <ProductRow key={p.id} product={p} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
