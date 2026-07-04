import { useState, useEffect, useCallback } from 'react';
import { FileText, X, Check, XCircle, Clock, Package } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const STATUS = {
  pending:  { label: 'Pendiente', cls: 'bg-yellow-100 text-yellow-700', icon: Clock },
  quoted:   { label: 'Cotizado',  cls: 'bg-green-100 text-green-700',   icon: Check },
  rejected: { label: 'Rechazado', cls: 'bg-red-100 text-red-700',       icon: XCircle },
};

const fmt = (n) => parseFloat(n).toLocaleString('es-CO', { minimumFractionDigits: 0 });

export default function QuoteRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [unitPrice, setUnitPrice] = useState('');
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('all');

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? { status: filter } : {};
      const res = await api.get('/quote-requests/shop', { params });
      setRequests(res.data.data || []);
    } catch {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const openDetail = (req) => {
    setSelected(req);
    setUnitPrice(req.unit_price ? String(req.unit_price) : '');
  };

  const handleRespond = async (status) => {
    if (!selected || saving) return;
    if (status === 'quoted') {
      const val = parseFloat(unitPrice);
      if (!val || val <= 0) { toast.error('Ingresa un precio unitario válido'); return; }
    }
    setSaving(true);
    try {
      const res = await api.put(`/quote-requests/${selected.id}/respond`, {
        status,
        unit_price: status === 'quoted' ? parseFloat(unitPrice) : 0,
      });
      toast.success(status === 'quoted' ? 'Cotización enviada al comprador' : 'Solicitud rechazada');
      setSelected(res.data.data);
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al responder');
    } finally {
      setSaving(false);
    }
  };

  const pending = requests.filter((r) => r.status === 'pending').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            Cotizaciones
            <span className="inline-flex items-center gap-1 bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">
              <Package className="w-3 h-3" /> Por mayor
            </span>
            {pending > 0 && (
              <span className="bg-yellow-400 text-primary text-xs font-bold rounded-full px-2 py-0.5">
                {pending} nueva{pending !== 1 ? 's' : ''}
              </span>
            )}
          </h1>
          <p className="text-gray-500 text-sm">Solicitudes de precio de venta por mayor</p>
        </div>
        <div className="flex gap-2">
          {['all', 'pending', 'quoted', 'rejected'].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === s ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s === 'all' ? 'Todas' : STATUS[s]?.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="w-10 h-10 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-400">No hay cotizaciones</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr className="text-left text-gray-500 text-xs font-medium uppercase tracking-wide">
                <th className="px-4 py-3">Producto</th>
                <th className="px-4 py-3">Comprador</th>
                <th className="px-4 py-3 text-center">Cantidad</th>
                <th className="px-4 py-3 text-right">Precio unit.</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {requests.map((req) => {
                const s = STATUS[req.status];
                return (
                  <tr key={req.id} onClick={() => openDetail(req)}
                    className="hover:bg-gray-50 cursor-pointer">
                    <td className="px-4 py-3 font-medium text-gray-900">{req.product?.name}</td>
                    <td className="px-4 py-3 text-gray-600">{req.buyer?.name}</td>
                    <td className="px-4 py-3 text-center font-semibold">{req.quantity}</td>
                    <td className="px-4 py-3 text-right text-gray-700">
                      {req.unit_price ? `$${fmt(req.unit_price)}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">
                      {req.total_price ? `$${fmt(req.total_price)}` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s?.cls}`}>
                        {s?.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                      {new Date(req.created_at).toLocaleDateString('es-CO', {
                        day: '2-digit', month: 'short',
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal responder */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900">Responder cotización</h3>
              <button onClick={() => setSelected(null)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 mb-5">
              <div className="flex justify-center">
                <span className="inline-flex items-center gap-1.5 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                  <Package className="w-3.5 h-3.5" /> Compra por mayor
                </span>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-sm space-y-1">
                <p className="font-semibold text-gray-900">{selected.product?.name}</p>
                <p className="text-gray-500">Comprador: <strong>{selected.buyer?.name}</strong></p>
                <p className="text-gray-500">Cantidad solicitada: <strong>{selected.quantity} unidades</strong></p>
              </div>

              {selected.status === 'pending' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Precio unitario (COP) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(e.target.value)}
                    className="input-field w-full text-lg font-semibold"
                    placeholder="Ej: 50000"
                    autoFocus
                  />
                  {unitPrice && parseFloat(unitPrice) > 0 && (
                    <p className="text-sm text-gray-500 mt-2 text-right">
                      Total: <strong className="text-gray-900 text-base">
                        ${fmt(parseFloat(unitPrice) * selected.quantity)}
                      </strong>
                    </p>
                  )}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-xl p-3 text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Precio unitario</span>
                    <strong>${selected.unit_price ? fmt(selected.unit_price) : '—'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Total ({selected.quantity} u.)</span>
                    <strong className="text-primary text-base">
                      ${selected.total_price ? fmt(selected.total_price) : '—'}
                    </strong>
                  </div>
                </div>
              )}
            </div>

            {selected.status === 'pending' && (
              <div className="flex gap-2">
                <button onClick={() => handleRespond('rejected')} disabled={saving}
                  className="flex-1 py-2.5 border border-red-200 text-red-600 font-medium rounded-xl hover:bg-red-50 text-sm disabled:opacity-60">
                  Rechazar
                </button>
                <button onClick={() => handleRespond('quoted')} disabled={saving}
                  className="flex-1 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 text-sm disabled:opacity-60">
                  {saving ? 'Enviando...' : 'Enviar cotización'}
                </button>
              </div>
            )}

            {selected.status !== 'pending' && (
              <button onClick={() => setSelected(null)}
                className="w-full py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 text-sm">
                Cerrar
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
