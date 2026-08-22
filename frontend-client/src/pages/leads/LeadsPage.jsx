import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Target, Plus, ArrowRight } from 'lucide-react';
import api from '../../services/api';

export default function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', company: '', message: '', source: 'website'
  });

  useEffect(() => {
    fetchLeads();
  }, [status]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const params = status ? `?status=${status}` : '';
      const response = await api.get(`/leads${params}`);
      setLeads(response.data.data || []);
    } catch (error) {
      console.error('Error fetching leads:', error);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/leads', formData);
      setShowForm(false);
      setFormData({ name: '', email: '', phone: '', company: '', message: '', source: 'website' });
      fetchLeads();
    } catch (error) {
      console.error('Error creating lead:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-accent-100 text-accent-700',
      contacted: 'bg-blue-100 text-blue-700',
      qualified: 'bg-green-100 text-green-700',
      converted: 'bg-purple-100 text-purple-700',
      lost: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-primary">Leads</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-accent text-white font-semibold rounded-lg hover:bg-accent-400 transition"
        >
          <Plus className="w-5 h-5" />
          {showForm ? 'Cancelar' : 'Nuevo Lead'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 mb-6 border border-gray-200 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Nombre"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-primary placeholder-gray-400 focus:border-accent focus:outline-none"
            />
            <input
              type="email"
              placeholder="Email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-primary placeholder-gray-400 focus:border-accent focus:outline-none"
            />
            <input
              type="tel"
              placeholder="Teléfono"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-primary placeholder-gray-400 focus:border-accent focus:outline-none"
            />
            <input
              type="text"
              placeholder="Empresa"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-primary placeholder-gray-400 focus:border-accent focus:outline-none"
            />
          </div>
          <textarea
            placeholder="Mensaje"
            required
            rows="4"
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-primary placeholder-gray-400 focus:border-accent focus:outline-none mb-4"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-accent text-white font-semibold rounded-lg hover:bg-accent-400 transition"
          >
            Crear Lead
          </button>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full"></div>
        </div>
      ) : leads.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-primary mb-2">Aún no hay leads</h2>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Los leads son oportunidades de venta. Puedes crear leads manualmente o recibirlos de tus campañas de marketing y publicidad.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-accent text-white font-semibold rounded-lg hover:bg-accent-400 transition"
            >
              <Plus className="w-5 h-5" />
              Crear mi primer lead
            </button>
            <Link
              to="/advertising/campaigns"
              className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-300 text-primary font-semibold rounded-lg hover:border-accent transition"
            >
              <ArrowRight className="w-5 h-5" />
              Crear campaña de marketing
            </Link>
          </div>
        </div>
      ) : (
        /* Leads Table */
        <div className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-4 text-gray-500 text-sm font-medium">Nombre</th>
                <th className="text-left px-6 py-4 text-gray-500 text-sm font-medium">Empresa</th>
                <th className="text-left px-6 py-4 text-gray-500 text-sm font-medium">Email</th>
                <th className="text-left px-6 py-4 text-gray-500 text-sm font-medium">Estado</th>
                <th className="text-left px-6 py-4 text-gray-500 text-sm font-medium">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-primary">{lead.name}</div>
                    <div className="text-sm text-gray-500">{lead.phone}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{lead.company || '-'}</td>
                  <td className="px-6 py-4 text-gray-600">{lead.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(lead.status)}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-sm">
                    {new Date(lead.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}