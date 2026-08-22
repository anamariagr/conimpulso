import { useState, useEffect, useCallback } from 'react';
import { ShoppingBag, X, Phone, MessageSquare, CheckCircle, Clock, XCircle } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const STATUS = {
  pending:   { label: 'Pendiente',   cls: 'bg-accent-100 text-accent-700', icon: Clock },
  contacted: { label: 'Contactado',  cls: 'bg-blue-100 text-blue-700',    icon: MessageSquare },
  closed:    { label: 'Cerrado',     cls: 'bg-green-100 text-green-700',  icon: CheckCircle },
};

export default function PurchaseRequestsView() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selected, setSelected] = useState(null);
  const [notes, setNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const params = filterStatus !== 'all' ? { status: filterStatus } : {};
      const res = await api.get('/admin/purchase-requests', { params });
      setRequests(res.data.data || []);
    } catch {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const openDetail = (req) => {
    setSelected(req);
    setNotes(req.admin_notes || '');
  };

  const handleUpdate = async (newStatus) => {
    if (!selected || updating) return;
    setUpdating(true);
    try {
      const res = await api.put(`/admin/purchase-requests/${selected.id}`, {
        status: newStatus,
        admin_notes: notes,
      });
      toast.success('Solicitud actualizada');
      setSelected(res.data.data);
      fetchRequests();
    } catch {
      toast.error('Error al actualizar');
    } finally {
      setUpdating(false);
    }
  };

  const pending = requests.filter((r) => r.status === 'pending').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            Solicitudes de compra
            {pending > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
                {pending} nueva{pending !== 1 ? 's' : ''}
              </span>
            )}
          </h1>
          <p className="text-gray-500">Contactos de compradores sobre productos</p>
        </div>
        <div className="flex gap-2">
          {['all', 'pending', 'contacted', 'closed'].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === s
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s === 'all' ? 'Todos' : STATUS[s]?.label}
            </button>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden p-0">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="w-10 h-10 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No hay solicitudes</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr className="text-left text-gray-500 text-xs font-medium uppercase tracking-wide">
                <th className="px-4 py-3">Comprador</th>
                <th className="px-4 py-3">Producto / Tienda</th>
                <th className="px-4 py-3">Cant.</th>
                <th className="px-4 py-3">Mensaje</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {requests.map((req) => {
                const s = STATUS[req.status];
                return (
                  <tr key={req.id} onClick={() => openDetail(req)} className="hover:bg-gray-50 cursor-pointer">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{req.buyer?.name}</p>
                      <p className="text-xs text-gray-400">{req.buyer?.email}</p>
                      {req.contact_phone && (
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3" />{req.contact_phone}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{req.product?.name}</p>
                      <p className="text-xs text-gray-400">{req.shop?.name}</p>
                    </td>
                    <td className="px-4 py-3 text-center font-medium">{req.quantity}</td>
                    <td className="px-4 py-3 max-w-xs">
                      <p className="text-gray-600 truncate">{req.message}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s?.cls}`}>
                        {s?.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                      {new Date(req.created_at).toLocaleString('es-CO', {
                        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Detalle de solicitud</h3>
              <button onClick={() => setSelected(null)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 mb-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-1">Comprador</p>
                  <p className="font-semibold text-gray-900">{selected.buyer?.name}</p>
                  <p className="text-xs text-gray-500">{selected.buyer?.email}</p>
                  {selected.contact_phone && (
                    <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                      <Phone className="w-3 h-3" />{selected.contact_phone}
                    </p>
                  )}
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-1">Producto</p>
                  <p className="font-semibold text-gray-900">{selected.product?.name}</p>
                  <p className="text-xs text-gray-500">{selected.shop?.name}</p>
                  <p className="text-xs text-gray-600 mt-1">Cantidad: <strong>{selected.quantity}</strong></p>
                </div>
              </div>

              <div className="bg-blue-50 rounded-xl p-3">
                <p className="text-xs text-blue-600 font-medium mb-1">Mensaje del comprador</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{selected.message}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notas internas</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="input-field w-full text-sm"
                  placeholder="Agrega notas sobre esta solicitud..."
                />
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              {selected.status !== 'contacted' && (
                <button onClick={() => handleUpdate('contacted')} disabled={updating}
                  className="flex-1 py-2 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-600 text-sm disabled:opacity-60">
                  Marcar contactado
                </button>
              )}
              {selected.status !== 'closed' && (
                <button onClick={() => handleUpdate('closed')} disabled={updating}
                  className="flex-1 py-2 bg-green-500 text-white font-medium rounded-xl hover:bg-green-600 text-sm disabled:opacity-60">
                  Cerrar solicitud
                </button>
              )}
              {selected.status !== 'pending' && (
                <button onClick={() => handleUpdate('pending')} disabled={updating}
                  className="flex-1 py-2 border border-gray-300 text-gray-600 font-medium rounded-xl hover:bg-gray-50 text-sm disabled:opacity-60">
                  Reabrir
                </button>
              )}
              <button onClick={() => handleUpdate(selected.status)} disabled={updating}
                className="px-4 py-2 bg-accent text-white font-medium rounded-xl hover:bg-accent-400 text-sm disabled:opacity-60">
                Guardar notas
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
