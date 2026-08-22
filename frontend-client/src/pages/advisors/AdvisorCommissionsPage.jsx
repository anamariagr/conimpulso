import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Clock, CheckCircle, ArrowUpRight } from 'lucide-react';
import api from '../../services/api';

export default function AdvisorCommissionsPage() {
  const [commissions, setCommissions] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [commissionsRes, statsRes] = await Promise.all([
        api.get('/advisors/commissions'),
        api.get('/advisors/commissions/stats'),
      ]);
      setCommissions(commissionsRes.data.data);
      setStats(statsRes.data.data);
    } catch (error) {
      console.error('Error fetching commissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-accent-500" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'paid':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'text-accent-400',
      approved: 'text-blue-400',
      paid: 'text-green-400',
    };
    return colors[status] || 'text-gray-400';
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pt-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#4d3cbb]">Mis Comisiones</h1>
          <p className="text-gray-400 mt-1">Historial de ganancias y pagos</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#1A1A1A] rounded-xl p-4 border border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-900/30 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-gray-400 text-xs">Total Ganado</p>
                <p className="text-xl font-bold">${stats.total_earned?.toLocaleString() || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-[#1A1A1A] rounded-xl p-4 border border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent-900/30 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-accent-500" />
              </div>
              <div>
                <p className="text-gray-400 text-xs">Pendiente</p>
                <p className="text-xl font-bold text-[#4d3cbb]">${stats.pending?.toLocaleString() || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-[#1A1A1A] rounded-xl p-4 border border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-900/30 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-gray-400 text-xs">Aprobado</p>
                <p className="text-xl font-bold">${stats.approved?.toLocaleString() || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-[#1A1A1A] rounded-xl p-4 border border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-900/30 rounded-lg flex items-center justify-center">
                <ArrowUpRight className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-gray-400 text-xs">Pagado</p>
                <p className="text-xl font-bold text-green-400">${stats.paid?.toLocaleString() || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Commissions List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-[#4d3cbb] border-t-transparent rounded-full"></div>
          </div>
        ) : commissions.length === 0 ? (
          <div className="bg-[#1A1A1A] rounded-xl p-12 text-center border border-gray-800">
            <p className="text-gray-500">No hay comisiones registradas</p>
          </div>
        ) : (
          <div className="bg-[#1A1A1A] rounded-xl overflow-hidden border border-gray-800">
            <table className="w-full">
              <thead className="bg-[#2A2A2A]">
                <tr>
                  <th className="text-left px-6 py-4 text-gray-400 text-sm">Fecha</th>
                  <th className="text-left px-6 py-4 text-gray-400 text-sm">Tienda</th>
                  <th className="text-left px-6 py-4 text-gray-400 text-sm">Tipo</th>
                  <th className="text-left px-6 py-4 text-gray-400 text-sm">Monto</th>
                  <th className="text-left px-6 py-4 text-gray-400 text-sm">Estado</th>
                </tr>
              </thead>
              <tbody>
                {commissions.map((commission) => (
                  <tr key={commission.id} className="border-t border-gray-800 hover:bg-[#2A2A2A]">
                    <td className="px-6 py-4 text-gray-400 text-sm">
                      {new Date(commission.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-white">
                      {commission.shop?.name || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-[#2A2A2A] text-xs rounded text-gray-300 capitalize">
                        {commission.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#4d3cbb] font-semibold">
                      ${parseFloat(commission.amount).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(commission.status)}
                        <span className={`text-sm capitalize ${getStatusColor(commission.status)}`}>
                          {commission.status}
                        </span>
                      </div>
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