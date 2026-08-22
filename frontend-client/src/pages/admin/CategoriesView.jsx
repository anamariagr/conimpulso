import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Grid3X3, X, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function CategoriesView() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    icon: '',
    description: '',
    is_active: true,
    order: 1
  });

  const iconOptions = ['🍽️', '👕', '🎨', '💻', '🪑', '⚙️', '🔧', '📦', '🧹', '🌿', '🍕', '☕', '🎁', '💍', '👜', '👟', '⌚', '📱'];

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get('/categories');
      setCategories(response.data.data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
      // Use sample data if API fails
      setCategories([
        { id: 1, name: 'Alimentos y Bebidas', icon: '🍽️', products_count: 234, order: 1, is_active: true },
        { id: 2, name: 'Textiles y Ropa', icon: '👕', products_count: 189, order: 2, is_active: true },
        { id: 3, name: 'Artesanía', icon: '🎨', products_count: 156, order: 3, is_active: true },
        { id: 4, name: 'Tecnología', icon: '💻', products_count: 145, order: 4, is_active: true },
        { id: 5, name: 'Muebles', icon: '🪑', products_count: 98, order: 5, is_active: true },
        { id: 6, name: 'Metalurgia', icon: '⚙️', products_count: 67, order: 6, is_active: true },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      icon: '📦',
      description: '',
      is_active: true,
      order: categories.length + 1
    });
    setShowModal(true);
  };

  const openEditModal = (category) => {
    setEditingCategory(category.id);
    setFormData({
      name: category.name || '',
      icon: category.icon || '📦',
      description: category.description || '',
      is_active: category.is_active !== false,
      order: category.order || 1
    });
    setShowModal(true);
  };

  const saveCategory = async () => {
    if (!formData.name.trim()) {
      toast.error('El nombre es requerido');
      return;
    }

    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory}`, formData);
        toast.success('Categoría actualizada');
      } else {
        await api.post('/categories', formData);
        toast.success('Categoría creada');
      }
      setShowModal(false);
      loadCategories();
    } catch (error) {
      toast.error('Error al guardar categoría');
    }
  };

  const deleteCategory = async (id) => {
    if (!confirm('¿Eliminar esta categoría?')) return;
    try {
      await api.delete(`/categories/${id}`);
      toast.success('Categoría eliminada');
      loadCategories();
    } catch (error) {
      const message = error.response?.data?.message || 'Error al eliminar categoría';
      toast.error(message);
    }
  };

  const toggleActive = async (category) => {
    try {
      await api.put(`/categories/${category.id}`, { is_active: !category.is_active });
      loadCategories();
    } catch (error) {
      toast.error('Error al actualizar categoría');
    }
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Categorías</h1>
          <p className="text-gray-500">Gestiona las categorías del marketplace</p>
        </div>
        <button onClick={openCreateModal} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Nueva Categoría
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <div key={category.id} className="card flex items-center gap-4">
            <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center text-2xl">
              {category.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900">{category.name}</h3>
              <p className="text-sm text-gray-500">{category.products_count || 0} productos</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${category.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {category.is_active ? 'Activa' : 'Inactiva'}
                </span>
                <span className="text-xs text-gray-400">Orden: {category.order}</span>
              </div>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => toggleActive(category)}
                className={`p-1.5 rounded-lg transition-colors ${category.is_active ? 'bg-green-100 hover:bg-green-200' : 'bg-gray-100 hover:bg-gray-200'}`}
                title={category.is_active ? 'Desactivar' : 'Activar'}
              >
                {category.is_active ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-gray-400" />
                )}
              </button>
              <button
                onClick={() => openEditModal(category)}
                className="p-1.5 bg-blue-100 hover:bg-blue-200 rounded-lg"
                title="Editar"
              >
                <Pencil className="w-4 h-4 text-blue-600" />
              </button>
              <button
                onClick={() => deleteCategory(category.id)}
                className="p-1.5 bg-red-100 hover:bg-red-200 rounded-lg"
                title="Eliminar"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">
                {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field w-full"
                  placeholder="Ej: Alimentos y Bebidas"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Icono</label>
                <div className="flex flex-wrap gap-2">
                  {iconOptions.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon })}
                      className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-colors ${
                        formData.icon === icon ? 'bg-accent ring-2 ring-accent-400' : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field w-full"
                  rows="2"
                  placeholder="Descripción opcional..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Orden</label>
                <input
                  type="number"
                  min="1"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                  className="input-field w-full"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="is_active" className="text-sm text-gray-700">Categoría activa</label>
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
                onClick={saveCategory}
                className="flex-1 py-2 bg-accent text-white font-semibold rounded-lg hover:bg-accent-400"
              >
                {editingCategory ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}