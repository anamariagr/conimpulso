import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Send, Home } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useSiteStore } from '../../stores/siteStore';
import { useAuthStore } from '../../stores/authStore';
import { unitPriceFor } from '../../stores/cartStore';

export default function CartCheckoutModal({ items, totalPrice, onClose, onSuccess }) {
  const navigate = useNavigate();
  const { wompiEnabled } = useSiteStore();
  const { user } = useAuthStore();
  const [step, setStep] = useState('method'); // 'method' | 'form'
  const [method, setMethod] = useState(null);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [codForm, setCodForm] = useState({ full_name: '', document_id: '', contact_phone: '', delivery_address: '' });

  // Pre-fill "pago en casa" with whatever is already on file.
  useEffect(() => {
    if (method !== 'cod' || step !== 'form') return;
    setCodForm((f) => ({
      full_name: f.full_name || user?.name || '',
      document_id: f.document_id || user?.document_id || '',
      contact_phone: f.contact_phone || user?.phone || '',
      delivery_address: f.delivery_address || user?.address || '',
    }));
  }, [method, step, user]);

  const lineItems = items.map((i) => ({ product_id: i.product_id, quantity: i.quantity }));

  const handlePayWithWompi = async (e) => {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    try {
      const res = await api.post('/products/wompi/init', {
        items: lineItems,
        contact_phone: contactPhone,
      });
      const { checkout_url, params } = res.data.data;
      const url = new URL(checkout_url);
      Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
      window.location.href = url.toString();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al iniciar el pago con Wompi');
      setSending(false);
    }
  };

  const handleCodOrder = async (e) => {
    e.preventDefault();
    if (sending) return;
    if (!codForm.full_name.trim() || !codForm.document_id.trim() || !codForm.contact_phone.trim() || !codForm.delivery_address.trim()) {
      toast.error('Completa todos los datos para el pago en casa');
      return;
    }
    setSending(true);
    try {
      await api.post('/products/orders/cod', { items: lineItems, ...codForm });
      toast.success('¡Pedido registrado y en revisión! Te avisamos por correo apenas se confirme.');
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al registrar el pedido');
    } finally {
      setSending(false);
    }
  };

  const handleVendorArranged = async (e) => {
    e.preventDefault();
    if (sending) return;
    if (!message.trim()) { toast.error('Escribe un mensaje'); return; }
    setSending(true);
    try {
      await Promise.all(items.map((item) =>
        api.post('/purchase-requests', {
          product_id: item.product_id,
          message,
          contact_phone: contactPhone,
          quantity: item.quantity,
        })
      ));
      toast.success('¡Pedido enviado y en revisión! Los vendedores te contactarán apenas se confirme.');
      onSuccess();
      navigate('/dashboard/orders');
    } catch (err) {
      toast.error(err.response?.data?.message || 'No pudimos enviar tu pedido. Intenta de nuevo.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-gray-900">Finalizar compra</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-5 bg-gray-50 rounded-xl p-3 text-sm text-gray-600 max-h-32 overflow-y-auto">
          {items.map((item) => (
            <div key={item.product_id} className="flex justify-between py-0.5">
              <span className="truncate pr-2">{item.name} x{item.quantity}</span>
              <span className="font-medium text-gray-900 flex-shrink-0">${(unitPriceFor(item) * item.quantity).toLocaleString('es-CO')}</span>
            </div>
          ))}
          <div className="flex justify-between pt-2 mt-2 border-t border-gray-200 font-semibold text-gray-900">
            <span>Total</span>
            <span>${totalPrice.toLocaleString('es-CO')}</span>
          </div>
        </div>

        {step === 'method' && (
          <div className="space-y-3">
            <p className="text-sm text-gray-500 mb-1">Selecciona cómo quieres pagar</p>

            <button
              onClick={() => { if (wompiEnabled) { setMethod('wompi'); setStep('form'); } }}
              disabled={!wompiEnabled}
              className="w-full flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-primary/40 hover:bg-gray-50 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:bg-transparent"
            >
              <div className="w-10 h-10 rounded-xl bg-[#7B2FBE]/10 flex items-center justify-center flex-shrink-0">
                <span className="text-[#7B2FBE] font-bold text-sm">W</span>
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">Wompi</p>
                <p className="text-xs text-gray-400">Tarjeta crédito / débito, Nequi, Bancolombia</p>
              </div>
              {!wompiEnabled && (
                <span className="ml-auto text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">Próximamente</span>
              )}
            </button>

            <button
              onClick={() => { setMethod('cod'); setStep('form'); }}
              className="w-full flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-primary/40 hover:bg-gray-50 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                <Home className="w-5 h-5 text-green-700" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">Pago en casa</p>
                <p className="text-xs text-gray-400">Pagas en efectivo cuando te llega el pedido</p>
              </div>
            </button>

            <button
              onClick={() => { setMethod('vendor'); setStep('form'); }}
              className="w-full flex items-center gap-4 p-4 border-2 border-accent rounded-xl bg-accent/5 hover:bg-accent/10 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center flex-shrink-0">
                <Send className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">Cuadrar pago con el vendedor</p>
                <p className="text-xs text-gray-500">Cada vendedor te contacta para coordinar el pago</p>
              </div>
            </button>
          </div>
        )}

        {step === 'form' && method === 'wompi' && (
          <form onSubmit={handlePayWithWompi} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tu teléfono (opcional)</label>
              <input
                type="tel"
                placeholder="Ej: 3001234567"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="input-field w-full"
              />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep('method')}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 font-medium text-sm">
                Atrás
              </button>
              <button type="submit" disabled={sending}
                className="flex-1 py-2.5 bg-[#7B2FBE] text-white font-semibold rounded-xl hover:bg-[#6a279f] transition-colors text-sm disabled:opacity-60">
                {sending ? 'Redirigiendo...' : 'Pagar con Wompi'}
              </button>
            </div>
          </form>
        )}

        {step === 'form' && method === 'cod' && (
          <form onSubmit={handleCodOrder} className="space-y-3">
            <div className="p-3 bg-green-50 rounded-xl text-sm text-green-700">
              Pagas en efectivo cuando te llega el pedido. Completa (o corrige) tus datos de entrega.
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
              <input type="text" value={codForm.full_name} onChange={(e) => setCodForm((f) => ({ ...f, full_name: e.target.value }))} className="input-field w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cédula</label>
              <input type="text" value={codForm.document_id} onChange={(e) => setCodForm((f) => ({ ...f, document_id: e.target.value }))} className="input-field w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <input type="tel" placeholder="Ej: 3001234567" value={codForm.contact_phone} onChange={(e) => setCodForm((f) => ({ ...f, contact_phone: e.target.value }))} className="input-field w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dirección de entrega</label>
              <input type="text" placeholder="Calle, número, ciudad" value={codForm.delivery_address} onChange={(e) => setCodForm((f) => ({ ...f, delivery_address: e.target.value }))} className="input-field w-full" />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep('method')}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 font-medium text-sm">
                Atrás
              </button>
              <button type="submit" disabled={sending}
                className="flex-1 py-2.5 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors text-sm disabled:opacity-60">
                {sending ? 'Enviando...' : 'Confirmar pedido'}
              </button>
            </div>
          </form>
        )}

        {step === 'form' && method === 'vendor' && (
          <form onSubmit={handleVendorArranged} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tu teléfono (opcional)</label>
              <input type="tel" placeholder="Ej: 3001234567" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className="input-field w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mensaje *</label>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="input-field w-full"
                placeholder="¿Qué te gustaría coordinar con los vendedores?"
                required
              />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep('method')}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 font-medium text-sm">
                Atrás
              </button>
              <button type="submit" disabled={sending}
                className="flex-1 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors text-sm disabled:opacity-60">
                {sending ? 'Enviando...' : 'Enviar solicitud'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
