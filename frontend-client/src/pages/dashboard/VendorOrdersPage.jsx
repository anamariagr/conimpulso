import { useState, useEffect, useCallback, useRef } from 'react';
import { Package, Clock, CheckCircle, Truck, XCircle, Ban, Factory, CreditCard, Phone, MapPin, HelpCircle } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const STATUS = {
  pending_admin_review: { label: 'Nueva solicitud',  cls: 'bg-blue-100 text-blue-700',     icon: HelpCircle },
  pending:          { label: 'Pendiente',            cls: 'bg-accent-100 text-accent-700', icon: Clock },
  confirmed:        { label: 'Confirmado',           cls: 'bg-blue-100 text-blue-700',     icon: CheckCircle },
  ordered_producer: { label: 'Pedido al productor',  cls: 'bg-purple-100 text-purple-700', icon: Factory },
  shipped:          { label: 'Enviado',              cls: 'bg-indigo-100 text-indigo-700', icon: Truck },
  delivered:        { label: 'Entregado',            cls: 'bg-green-100 text-green-700',   icon: CheckCircle },
  failed:           { label: 'Pago fallido',         cls: 'bg-red-100 text-red-700',       icon: XCircle },
  cancelled:        { label: 'Cancelado',            cls: 'bg-gray-100 text-gray-500',     icon: Ban },
};

const PAYMENT_METHOD = {
  wompi: { label: 'Wompi', cls: 'bg-[#7B2FBE]/10 text-[#7B2FBE]' },
  cod: { label: 'Pago en casa', cls: 'bg-green-100 text-green-700' },
  vendor_arranged: { label: 'Cuadrado contigo', cls: 'bg-orange-100 text-orange-700' },
};

const fmt = (n) => '$' + parseFloat(n || 0).toLocaleString('es-CO', { maximumFractionDigits: 0 });

export default function VendorOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [respondingId, setRespondingId] = useState(null);
  const requestIdRef = useRef(0);

  const fetchOrders = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    try {
      setLoading(true);
      const params = filterStatus !== 'all' ? { status: filterStatus } : {};
      const res = await api.get('/vendor/orders', { params });
      if (requestId !== requestIdRef.current) return;
      setOrders(res.data.data || []);
    } catch {
      if (requestId === requestIdRef.current) setOrders([]);
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleRespond = async (order, accept) => {
    if (respondingId) return;
    setRespondingId(order.id);
    try {
      await api.put(`/vendor/orders/${order.id}/respond`, { accept });
      toast.success(accept ? 'Confirmaste que puedes tomar el pedido' : 'Rechazaste el pedido');
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al responder');
    } finally {
      setRespondingId(null);
    }
  };

  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const newRequestCount = orders.filter((o) => o.status === 'pending_admin_review').length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
            Pedidos
            {newRequestCount > 0 && (
              <span className="bg-blue-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
                {newRequestCount} nueva{newRequestCount !== 1 ? 's' : ''}
              </span>
            )}
            {pendingCount > 0 && (
              <span className="bg-accent text-white text-xs font-bold rounded-full px-2 py-0.5">
                {pendingCount} pendiente{pendingCount !== 1 ? 's' : ''}
              </span>
            )}
          </h1>
          <p className="text-gray-500">Pedidos de clientes sobre tus productos, sin importar el método de pago</p>
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

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <div className="card text-center py-16">
          <Package className="w-10 h-10 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">Aún no hay pedidos</p>
          <p className="text-sm text-gray-400 mt-1">
            Los pedidos de tus productos aparecerán aquí en cuanto un cliente compre.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const s = STATUS[order.status];
            const pm = PAYMENT_METHOD[order.payment_method];
            const StatusIcon = s?.icon || Clock;
            return (
              <div key={order.id} className="card flex flex-col gap-3">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                    {order.product?.images?.[0] ? (
                      <img src={order.product.images[0]} alt={order.product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-6 h-6 text-gray-300" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{order.product?.name}</p>
                    <p className="text-xs text-gray-400">
                      {order.full_name || order.buyer?.name} · Cantidad: {order.quantity}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${s?.cls}`}>
                        <StatusIcon className="w-3 h-3" />{s?.label}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${pm?.cls}`}>
                        <CreditCard className="w-3 h-3" />{pm?.label}
                      </span>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-gray-900">{fmt(order.total_amount)}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(order.created_at).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}
                    </p>
                  </div>
                </div>

                {order.status === 'pending_admin_review' ? (
                  <div className="border-t border-gray-100 pt-3 flex flex-col gap-2">
                    <p className="text-sm text-blue-700 bg-blue-50 rounded-lg px-3 py-2">
                      ¿Puedes tomar este pedido? Cuando confirmes, el equipo de ConImpulso te compartirá los datos de contacto y entrega.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRespond(order, true)}
                        disabled={respondingId === order.id}
                        className="flex-1 py-2 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 text-sm disabled:opacity-60"
                      >
                        Sí, la tomo
                      </button>
                      <button
                        onClick={() => handleRespond(order, false)}
                        disabled={respondingId === order.id}
                        className="px-4 py-2 border border-gray-300 text-gray-600 font-medium rounded-xl hover:bg-gray-50 text-sm disabled:opacity-60"
                      >
                        No puedo
                      </button>
                    </div>
                  </div>
                ) : (order.contact_phone || order.delivery_address || order.message) && (
                  <div className="border-t border-gray-100 pt-3 flex flex-col gap-1.5 text-sm text-gray-600">
                    {order.contact_phone && (
                      <p className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-gray-400" />{order.contact_phone}</p>
                    )}
                    {order.delivery_address && (
                      <p className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-gray-400" />{order.delivery_address}</p>
                    )}
                    {order.message && (
                      <p className="bg-orange-50 rounded-lg px-3 py-2 text-orange-700">{order.message}</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
