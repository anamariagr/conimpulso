import { useState, useEffect } from 'react';
import { Plus, Search, Filter, ChevronLeft } from 'lucide-react';
import api from '../../services/api';

export default function AdvisorLeadsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    shop_id: '',
    product_id: '',
    client_name: '',
    client_email: '',
    client_phone: '',
    client_company: '',
    message: '',
  });
  const [shops, setShops] = useState([]);

  useEffect(() => {
    fetchLeads();
    fetchShops();
  }, []);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const response = await api.get('/advisors/leads');
      setLeads(response.data.data);
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchShops = async () => {
    try {
      const response = await api.get('/shops');
      setShops(response.data.data || []);
    } catch (error) {
      console.error('Error fetching shops:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/advisors/leads', formData);
      setShowForm(false);
      setFormData({
        shop_id: '',
        product_id: '',
        client_name: '',
        client_email: '',
        client_phone: '',
        client_company: '',
        message: '',
      });
      fetchLeads();
    } catch (error) {
      console.error('Error creating lead:', error);
    }
  };

  const updateStatus = async (id, status, saleAmount) => {
    try {
      await api.put(`/advisors/leads/${id}/status`, {
        status,
        sale_amount: saleAmount,
      });
      fetchLeads();
    } catch (error) {
      console.error('Error updating lead:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-accent-900/30 text-accent-400 border-accent-700',
      contacted: 'bg-blue-900/30 text-blue-400 border-blue-700',
      qualified: 'bg-green-900/30 text-green-400 border-green-700',
      converted: 'bg-purple-900/30 text-purple-400 border-purple-700',
      lost: 'bg-red-900/30 text-red-400 border-red-700',
    };
    return colors[status] || 'bg-gray-700 text-gray-300 border-gray-600';
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pt-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#4d3cbb]">Mis Leads</h1>
            <p className="text-gray-400 mt-1">Gestiona tus clientes potenciales</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-6 py-2 bg-[#4d3cbb] text-black font-semibold rounded-lg hover:bg-accent-400 transition"
          >
            <Plus className="w-5 h-5" />
            Nuevo Lead
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-[#1A1A1A] rounded-xl p-6 mb-8 border border-gray-700">
            <h3 className="text-lg font-semibold text-[#4d3cbb] mb-4">Crear Nuevo Lead</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <select
                required
                value={formData.shop_id}
                onChange={(e) => setFormData({ ...formData, shop_id: e.target.value })}
                className="px-4 py-3 bg-[#0A0A0A] border border-gray-700 rounded-lg text-white focus:border-[#4d3cbb] focus:outline-none"
              >
                <option value="">Seleccionar tienda...</option>
                {shops.map((shop) => (
                  <option key={shop.id} value={shop.id}>{shop.name}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Nombre del cliente"
                required
                value={formData.client_name}
                onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                className="px-4 py-3 bg-[#0A0A0A] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-[#4d3cbb] focus:outline-none"
              />
              <input
                type="email"
                placeholder="Email del cliente"
                required
                value={formData.client_email}
                onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
                className="px-4 py-3 bg-[#0A0A0A] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-[#4d3cbb] focus:outline-none"
              />
              <input
                type="tel"
                placeholder="Teléfono"
                value={formData.client_phone}
                onChange={(e) => setFormData({ ...formData, client_phone: e.target.value })}
                className="px-4 py-3 bg-[#0A0A0A] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-[#4d3cbb] focus:outline-none"
              />
              <input
                type="text"
                placeholder="Empresa"
                value={formData.client_company}
                onChange={(e) => setFormData({ ...formData, client_company: e.target.value })}
                className="px-4 py-3 bg-[#0A0A0A] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-[#4d3cbb] focus:outline-none"
              />
            </div>
            <textarea
              placeholder="Mensaje o notas adicionales"
              rows="3"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full px-4 py-3 bg-[#0A0A0A] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-[#4d3cbb] focus:outline-none mb-4"
            />
            <div className="flex gap-3">
              <button type="submit" className="px-6 py-2 bg-[#4d3cbb] text-black font-semibold rounded-lg hover:bg-accent-400 transition">
                Crear Lead
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition">
                Cancelar
              </button>
            </div>
          </form>
        )}

        {/* Leads List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-[#4d3cbb] border-t-transparent rounded-full"></div>
          </div>
        ) : leads.length === 0 ? (
          <div className="bg-[#1A1A1A] rounded-xl p-12 text-center border border-gray-800">
            <p className="text-gray-500">No tienes leads registrados</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 text-[#4d3cbb] hover:underline"
            >
              Crear tu primer lead
            </button>
          </div>
        ) : (
          <div className="bg-[#1A1A1A] rounded-xl overflow-hidden border border-gray-800">
            <table className="w-full">
              <thead className="bg-[#2A2A2A]">
                <tr>
                  <th className="text-left px-6 py-4 text-gray-400 text-sm">Cliente</th>
                  <th className="text-left px-6 py-4 text-gray-400 text-sm">Tienda</th>
                  <th className="text-left px-6 py-4 text-gray-400 text-sm">Estado</th>
                  <th className="text-left px-6 py-4 text-gray-400 text-sm">Fecha</th>
                  <th className="text-left px-6 py-4 text-gray-400 text-sm">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id} className="border-t border-gray-800 hover:bg-[#2A2A2A]">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{lead.client_name}</div>
                      <div className="text-sm text-gray-500">{lead.client_email}</div>
                      {lead.client_company && (
                        <div className="text-sm text-gray-400">{lead.client_company}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-400">{lead.shop?.name || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs rounded-full border ${getStatusColor(lead.status)}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={lead.status}
                        onChange={(e) => updateStatus(lead.id, e.target.value, lead.sale_amount)}
                        className="bg-[#0A0A0A] border border-gray-700 text-white text-sm rounded px-2 py-1"
                      >
                        <option value="pending">Pendiente</option>
                        <option value="contacted">Contactado</option>
                        <option value="qualified">Calificado</option>
                        <option value="converted">Convertido</option>
                        <option value="lost">Perdido</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}