import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { advertisingService } from '../../services/api';
import { ArrowLeft, Save } from 'lucide-react';

export default function CampaignFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    type: 'banner',
    status: 'draft',
    budget: '',
    daily_budget: '',
    start_date: '',
    end_date: '',
    targeting: {
      locations: [],
      interests: [],
      age_range: [18, 65],
    },
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const payload = {
        ...formData,
        budget: parseFloat(formData.budget),
        daily_budget: formData.daily_budget ? parseFloat(formData.daily_budget) : null,
      };

      if (isEditing) {
        await advertisingService.updateCampaign(id, payload);
      } else {
        await advertisingService.createCampaign(payload);
      }

      navigate('/advertising/campaigns');
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/advertising/campaigns')}
          className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-white">
          {isEditing ? 'Editar Campaña' : 'Nueva Campaña'}
        </h1>
      </div>

      {error && (
        <div className="p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Nombre de la campaña
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent"
              placeholder="Mi campaña publicitaria"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Tipo de anuncio
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent"
            >
              <option value="banner">Banner</option>
              <option value="product">Producto</option>
              <option value="featured">Destacado</option>
              <option value="search">Búsqueda</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Presupuesto total
            </label>
            <input
              type="number"
              name="budget"
              value={formData.budget}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent"
              placeholder="100000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Presupuesto diario (opcional)
            </label>
            <input
              type="number"
              name="daily_budget"
              value={formData.daily_budget}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent"
              placeholder="10000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Fecha de inicio
            </label>
            <input
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Fecha de fin
            </label>
            <input
              type="date"
              name="end_date"
              value={formData.end_date}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Estado
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent"
            >
              <option value="draft">Borrador</option>
              <option value="active">Activo</option>
              <option value="paused">Pausado</option>
              <option value="ended">Finalizado</option>
            </select>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/advertising/campaigns')}
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-accent-500 hover:bg-accent-600 text-black font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            <Save size={20} />
            {loading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear Campaña'}
          </button>
        </div>
      </form>
    </div>
  );
}
