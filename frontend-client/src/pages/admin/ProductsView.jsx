import { useState, useEffect } from 'react';
import { Search, Plus, Eye, Pencil, Trash2, Package, X, CheckCircle, AlertCircle, Filter } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function ProductsView() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [viewingProduct, setViewingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    category_id: '',
    shop_id: '',
    is_active: true,
    images: []
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products');
      setProducts(response.data.data || []);
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([
        { id: 1, name: 'Smartphone Samsung Galaxy S24', shop: 'TechStore Chile', price: 899.99, stock: 45, status: 'active', category: 'Tecnología' },
        { id: 2, name: 'MacBook Pro M3 14"', shop: 'TechStore Chile', price: 1599.99, stock: 12, status: 'active', category: 'Tecnología' },
        { id: 3, name: 'Jamón Ibérico de Bellota', shop: 'Delicias Gourmet', price: 89.99, stock: 0, status: 'pending', category: 'Alimentos' },
        { id: 4, name: 'Cerveza Artesanal Pack 6', shop: 'Cervecería Norteña', price: 45.00, stock: 120, status: 'active', category: 'Bebidas' },
        { id: 5, name: 'Bolso de Cuero artesanal', shop: 'Cuero y Craft', price: 125.00, stock: 8, status: 'active', category: 'Artesanía' },
        { id: 6, name: 'Mesa de Roble maciza', shop: 'Carpintería El Roble', price: 850.00, stock: 3, status: 'pending', category: 'Muebles' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: 0,
      stock: 0,
      category_id: '',
      shop_id: '',
      is_active: true,
      images: []
    });
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product.id);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price || 0,
      stock: product.stock || 0,
      category_id: product.category_id || '',
      shop_id: product.shop_id || '',
      is_active: product.is_active !== false,
      images: product.images || []
    });
    setShowModal(true);
  };

  const saveProduct = async () => {
    if (!formData.name.trim()) {
      toast.error('El nombre del producto es requerido');
      return;
    }

    try {
      const payload = {};

      if (formData.name) payload.name = formData.name;
      if (formData.description) payload.description = formData.description;
      if (formData.price !== undefined) payload.price = Number(formData.price);
      if (formData.stock !== undefined) payload.stock = Number(formData.stock);
      if (formData.category_id) payload.category_id = formData.category_id;
      if (formData.shop_id) payload.shop_id = formData.shop_id;

      if (editingProduct) {
        await api.put(`/products/${editingProduct}`, payload);
        toast.success('Producto actualizado');
      } else {
        await api.post('/products', payload);
        toast.success('Producto creado');
      }
      setShowModal(false);
      loadProducts();
    } catch (error) {
      const message = error.response?.data?.message || 'Error al guardar producto';
      toast.error(message);
    }
  };

  const deleteProduct = async (id) => {
    if (!confirm('¿Eliminar este producto?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Producto eliminado');
      loadProducts();
    } catch (error) {
      toast.error('Error al eliminar producto');
    }
  };

  const toggleActive = async (product) => {
    const newStatus = product.status === 'active' ? 'pending' : 'active';

    try {
      await api.put(`/products/${product.id}/status`, { status: newStatus });
      toast.success(newStatus === 'pending' ? 'Producto desactivado' : 'Producto activado');
      loadProducts();
    } catch (error) {
      toast.error('Error al actualizar producto');
    }
  };

  const openViewModal = (product) => {
    setViewingProduct(product);
  };

  const getProductImage = (product) => {
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      return typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url;
    }
    if (product.image) {
      return typeof product.image === 'string' ? product.image : product.image.url;
    }
    return 'https://picsum.photos/seed/' + product.id + '/400/300';
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'all' || product.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
          <p className="text-gray-500">Gestiona el catálogo de productos</p>
        </div>
        <button onClick={openCreateModal} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Nuevo Producto
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar productos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10 w-full"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="input-field w-auto"
        >
          <option value="all">Todos los estados</option>
          <option value="active">Activos</option>
          <option value="pending">Pendientes</option>
          <option value="inactive">Inactivos</option>
        </select>
      </div>

      {/* Products Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b border-gray-100">
                <th className="pb-3 font-medium">Producto</th>
                <th className="pb-3 font-medium">Tienda</th>
                <th className="pb-3 font-medium">Precio</th>
                <th className="pb-3 font-medium">Stock</th>
                <th className="pb-3 font-medium">Estado</th>
                <th className="pb-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="text-sm hover:bg-gray-50">
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-gray-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        {product.category && <p className="text-xs text-gray-500">{typeof product.category === 'object' ? product.category.name : product.category}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-gray-500">{typeof product.shop === 'object' ? product.shop?.name : product.shop}</td>
                  <td className="py-3 font-medium text-gray-900">${product.price?.toLocaleString()}</td>
                  <td className="py-3">
                    <span className={`font-medium ${product.stock === 0 ? 'text-red-500' : 'text-gray-500'}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      product.status === 'active' ? 'bg-green-100 text-green-700' :
                      product.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex gap-1">
                      {product.status === 'active' && (
                        <button
                          onClick={async () => {
                            // Optimistic update - change UI immediately
                            setProducts(products.map(p =>
                              p.id === product.id ? { ...p, status: 'inactive' } : p
                            ));
                            try {
                              await api.put(`/products/${product.id}`, { status: 'inactive' });
                              toast.success('Producto desactivado');
                            } catch {
                              // Revert if failed
                              setProducts(products.map(p =>
                                p.id === product.id ? { ...p, status: 'active' } : p
                              ));
                              toast.error('Error al actualizar');
                            }
                          }}
                          className="p-1.5 bg-yellow-100 hover:bg-yellow-200 rounded-lg transition-colors"
                          title="Desactivar"
                        >
                          <AlertCircle className="w-4 h-4 text-yellow-600" />
                        </button>
                      )}
                      {(product.status === 'inactive' || product.status === 'pending') && (
                        <button
                          onClick={async () => {
                            // Optimistic update - change UI immediately
                            setProducts(products.map(p =>
                              p.id === product.id ? { ...p, status: 'active' } : p
                            ));
                            try {
                              await api.put(`/products/${product.id}`, { status: 'active' });
                              toast.success('Producto activado');
                            } catch {
                              // Revert if failed
                              setProducts(products.map(p =>
                                p.id === product.id ? { ...p, status: 'inactive' } : p
                              ));
                              toast.error('Error al actualizar');
                            }
                          }}
                          className="p-1.5 bg-green-100 hover:bg-green-200 rounded-lg transition-colors"
                          title="Activar"
                        >
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </button>
                      )}
                      <button
                        onClick={() => openViewModal(product)}
                        className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg"
                        title="Ver"
                      >
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => openEditModal(product)}
                        className="p-1.5 bg-blue-100 hover:bg-blue-200 rounded-lg"
                        title="Editar"
                      >
                        <Pencil className="w-4 h-4 text-blue-600" />
                      </button>
                      <button
                        onClick={() => deleteProduct(product.id)}
                        className="p-1.5 bg-red-100 hover:bg-red-200 rounded-lg"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No se encontraron productos</p>
            </div>
          )}
        </div>
      </div>

      {/* View Modal */}
      {viewingProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="relative">
              <img
                src={getProductImage(viewingProduct)}
                alt={viewingProduct.name}
                className="w-full h-64 object-cover"
              />
              <button
                onClick={() => setViewingProduct(null)}
                className="absolute top-4 right-4 p-2 bg-white/80 hover:bg-white rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{viewingProduct.name}</h2>
                  <p className="text-sm text-gray-500">
                    {typeof viewingProduct.shop === 'object' ? viewingProduct.shop?.name : viewingProduct.shop}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  viewingProduct.status === 'active' ? 'bg-green-100 text-green-700' :
                  viewingProduct.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-500'
                }`}>
                  {viewingProduct.status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-gray-900">${viewingProduct.price?.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Precio</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className={`text-2xl font-bold ${viewingProduct.stock === 0 ? 'text-red-500' : 'text-gray-900'}`}>
                    {viewingProduct.stock}
                  </p>
                  <p className="text-xs text-gray-500">Stock</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-sm font-medium text-gray-900">
                    {typeof viewingProduct.category === 'object' ? viewingProduct.category?.name : viewingProduct.category || 'N/A'}
                  </p>
                  <p className="text-xs text-gray-500">Categoría</p>
                </div>
              </div>

              {viewingProduct.description && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Descripción</h3>
                  <p className="text-gray-600 text-sm">{viewingProduct.description}</p>
                </div>
              )}

              {viewingProduct.images && Array.isArray(viewingProduct.images) && viewingProduct.images.length > 1 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Galería</h3>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {viewingProduct.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={typeof img === 'string' ? img : img.url}
                        alt=""
                        className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setViewingProduct(null);
                    openEditModal(viewingProduct);
                  }}
                  className="flex-1 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2"
                >
                  <Pencil className="w-4 h-4" />
                  Editar
                </button>
                <button
                  onClick={() => setViewingProduct(null)}
                  className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">
                {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del producto</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field w-full"
                  placeholder="Ej: Smartphone Samsung Galaxy S24"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field w-full"
                  rows="3"
                  placeholder="Descripción del producto..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                    className="input-field w-full"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="is_active" className="text-sm text-gray-700">Producto activo</label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={saveProduct}
                className="flex-1 py-2 bg-accent text-primary font-semibold rounded-lg hover:bg-yellow-400"
              >
                {editingProduct ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}