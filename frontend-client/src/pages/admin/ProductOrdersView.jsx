import { useState, useEffect, useCallback, useRef } from 'react';
import { Package, X, Phone, MapPin, CreditCard, Truck, CheckCircle, Clock, XCircle, Ban, Factory } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const STATUS = {
  pending:          { label: 'Pendiente',        cls: 'bg-accent-100 text-accent-700', icon: Clock },
  confirmed:        { label: 'Confirmado',       cls: 'bg-blue-100 text-blue-700',     icon: CheckCircle },
  ordered_producer: { label: 'Pedido al productor', cls: 'bg-purple-100 text-purple-700', icon: Factory },
  shipped:          { label: 'Enviado',          cls: 'bg-indigo-100 text-indigo-700',  icon: Truck },
  delivered:        { label: 'Entregado',        cls: 'bg-green-100 text-green-700',   icon: CheckCircle },
  failed:           { label: 'Fallido',          cls: 'bg-red-100 text-red-700',       icon: XCircle },
  cancelled:        { label: 'Cancelado',        cls: 'bg-gray-100 text-gray-500',     icon: Ban },
};

const PAYMENT_METHOD = {
  wompi: { label: 'Wompi', cls: 'bg-[#7B2FBE]/10 text-[#7B2FBE]' },
  cod: { label: 'Pago en casa', cls: 'bg-green-100 text-green-700' },
  vendor_arranged: { label: 'Cuadrado con vendedor', cls: 'bg-orange-100 text-orange-700' },
};

const NEXT_STATUS = {
  pending: 'confirmed',
  confirmed: 'ordered_producer',
  ordered_producer: 'shipped',
  shipped: 'delivered',
};

const fmt = (n) => '$' + parseFloat(n || 0).toLocaleString('es-CO', { maximumFractionDigits: 0 });

export default function ProductOrdersView() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selected, setSelected] = useState(null);
  const [updating, setUpdating] = useState(false);
  const requestIdRef = useRef(0);

  const fetchOrders = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    try {
      setLoading(true);
      const params = filterStatus !== 'all' ? { status: filterStatus } : {};
      const res = await api.get('/admin/product-orders', { params });
      if (requestId !== requestIdRef.current) return; // a newer filter change already superseded this response
      setOrders(res.data.data || []);
    } catch {
      if (requestId === requestIdRef.current) setOrders([]);
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleUpdateStatus = async (status) => {
    if (!selected || updating) return;
    setUpdating(true);
    try {
      const res = await api.put(`/admin/product-orders/${selected.id}/status`, { status });
      toast.success('Estado actualizado');
      setSelected(res.data.data);
      fetchOrders();
    } catch {
      toast.error('Error al actualizar el estado');
    } finally {
      setUpdating(false);
    }
  };

  const pendingCount = orders.filter((o) => o.status === 'pending').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            Pedidos
            {pendingCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
                {pendingCount} pendiente{pendingCount !== 1 ? 's' : ''}
              </span>
            )}
          </h1>
          <p className="text-gray-500">Wompi, pago en casa y coordinados con el vendedor — todo en un solo lugar</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', ...Object.keys(STATUS)].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === s ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-10 h-10 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No hay pedidos</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr className="text-left text-gray-500 text-xs font-medium uppercase tracking-wide">
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Producto / Tienda</th>
                <th className="px-4 py-3">Método</th>
                <th className="px-4 py-3">Cant.</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => {
                const s = STATUS[order.status];
                const pm = PAYMENT_METHOD[order.payment_method];
                return (
                  <tr key={order.id} onClick={() => setSelected(order)} className="hover:bg-gray-50 cursor-pointer">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{order.full_name || order.buyer?.name}</p>
                      <p className="text-xs text-gray-400">{order.buyer?.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{order.product?.name}</p>
                      <p className="text-xs text-gray-400">{order.shop?.name}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${pm?.cls}`}>{pm?.label}</span>
                    </td>
                    <td className="px-4 py-3 text-center font-medium">{order.quantity}</td>
                    <td className="px-4 py-3 font-medium">{fmt(order.total_amount)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s?.cls}`}>{s?.label}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                      {new Date(order.created_at).toLocaleString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
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
              <h3 className="text-lg font-bold text-gray-900">Detalle del pedido</h3>
              <button onClick={() => setSelected(null)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 mb-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-1">Cliente</p>
                  <p className="font-semibold text-gray-900">{selected.full_name || selected.buyer?.name}</p>
                  <p className="text-xs text-gray-500">{selected.buyer?.email}</p>
                  {selected.contact_phone && (
                    <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                      <Phone className="w-3 h-3" />{selected.contact_phone}
                    </p>
                  )}
                  {selected.document_id && (
                    <p className="text-xs text-gray-600 mt-0.5">Cédula: {selected.document_id}</p>
                  )}
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-1">Producto</p>
                  <p className="font-semibold text-gray-900">{selected.product?.name}</p>
                  <p className="text-xs text-gray-500">{selected.shop?.name}</p>
                  <p className="text-xs text-gray-600 mt-1">Cantidad: <strong>{selected.quantity}</strong></p>
                  <p className="text-xs text-gray-600">Total: <strong>{fmt(selected.total_amount)}</strong></p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${PAYMENT_METHOD[selected.payment_method]?.cls}`}>
                  <CreditCard className="w-3 h-3" />{PAYMENT_METHOD[selected.payment_method]?.label}
                </span>
                <span className="text-xs text-gray-400">Ref: {selected.reference || selected.id}</span>
              </div>

              {selected.delivery_address && (
                <div className="bg-blue-50 rounded-xl p-3 flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700">{selected.delivery_address}</p>
                </div>
              )}

              {selected.message && (
                <div className="bg-orange-50 rounded-xl p-3">
                  <p className="text-xs text-orange-600 font-medium mb-1">Mensaje del cliente</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{selected.message}</p>
                </div>
              )}
            </div>

            <div className="flex gap-2 flex-wrap">
              {NEXT_STATUS[selected.status] && (
                <button onClick={() => handleUpdateStatus(NEXT_STATUS[selected.status])} disabled={updating}
                  className="flex-1 py-2 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 text-sm disabled:opacity-60">
                  Marcar como "{STATUS[NEXT_STATUS[selected.status]]?.label}"
                </button>
              )}
              {!['delivered', 'cancelled'].includes(selected.status) && (
                <button onClick={() => handleUpdateStatus('cancelled')} disabled={updating}
                  className="px-4 py-2 border border-gray-300 text-gray-600 font-medium rounded-xl hover:bg-gray-50 text-sm disabled:opacity-60">
                  Cancelar
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
