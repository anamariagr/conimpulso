import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Wallet as WalletIcon, Plus, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, XCircle, QrCode } from 'lucide-react';
import api from '../../services/api';
import { useSiteStore } from '../../stores/siteStore';
import { SingleImageUploader } from '../../components/forms/ImageUploader';
import toast from 'react-hot-toast';

const MANUAL_PROOF_METHODS = ['bre_b_llave', 'bre_b_qr'];

export default function WalletPage() {
  const { walletCoinValueCop, breBKey, breBQrImageUrl, wompiEnabled, fetchSettings } = useSiteStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [checkingWompi, setCheckingWompi] = useState(false);
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [pendingTopUps, setPendingTopUps] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showTopUp, setShowTopUp] = useState(false);
  const [topUpData, setTopUpData] = useState({ amount: '', payment_method: 'transfer', payment_reference: '', payment_proof_url: '' });
  const topUpRef = useRef(null);

  useEffect(() => {
    fetchData();
    fetchSettings();
  }, []);

  // After returning from the Wompi checkout redirect (?wompi=1&id=<transaction_id>),
  // ask the backend to confirm the real status — never trust the redirect itself.
  useEffect(() => {
    const transactionId = searchParams.get('id');
    if (!searchParams.get('wompi') || !transactionId) return;

    setCheckingWompi(true);
    api.get(`/wallet/wompi/status/${transactionId}`)
      .then((res) => {
        const status = res.data?.data?.status;
        if (status === 'approved') {
          toast.success('¡Pago confirmado! Tus monedas ya están en tu billetera.');
        } else if (status === 'rejected') {
          toast.error('El pago no se completó con Wompi.');
        } else {
          toast('Tu pago sigue en proceso. Te avisaremos cuando se confirme.', { icon: '⏳' });
        }
        fetchData();
      })
      .catch(() => toast.error('No pudimos confirmar el estado del pago con Wompi.'))
      .finally(() => {
        setCheckingWompi(false);
        searchParams.delete('wompi');
        searchParams.delete('id');
        setSearchParams(searchParams, { replace: true });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (showTopUp) {
      topUpRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [showTopUp]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [walletRes, transactionsRes, statsRes, topUpsRes] = await Promise.all([
        api.get('/wallet'),
        api.get('/wallet/transactions'),
        api.get('/wallet/stats'),
        api.get('/wallet/top-ups'),
      ]);
      setWallet(walletRes.data.data);
      setTransactions(transactionsRes.data.data);
      setStats(statsRes.data.data);
      setPendingTopUps((topUpsRes.data.data || []).filter((t) => t.status === 'pending'));
    } catch (error) {
      console.error('Error fetching wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  const [topUpError, setTopUpError] = useState('');
  const [submittingTopUp, setSubmittingTopUp] = useState(false);

  const requiresProof = MANUAL_PROOF_METHODS.includes(topUpData.payment_method);
  const coinsPreview = topUpData.amount ? (Number(topUpData.amount) / walletCoinValueCop).toFixed(2) : '0.00';

  const handleTopUp = async (e) => {
    e.preventDefault();
    if (submittingTopUp) return;
    setTopUpError('');
    if (requiresProof && !topUpData.payment_proof_url) {
      setTopUpError('Sube la imagen del comprobante de pago para continuar.');
      return;
    }
    setSubmittingTopUp(true);

    if (topUpData.payment_method === 'wompi') {
      try {
        const res = await api.post('/wallet/wompi/init', { amount: topUpData.amount });
        const { checkout_url, params } = res.data.data;
        const url = new URL(checkout_url);
        Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
        window.location.href = url.toString();
      } catch (error) {
        setTopUpError(error.response?.data?.message || 'Error al iniciar el pago con Wompi');
        setSubmittingTopUp(false);
      }
      return;
    }

    try {
      await api.post('/wallet/top-up', topUpData);
      toast.success('Solicitud de recarga enviada. Te avisaremos cuando sea aprobada.');
      setShowTopUp(false);
      setTopUpData({ amount: '', payment_method: 'transfer', payment_reference: '', payment_proof_url: '' });
      fetchData();
    } catch (error) {
      setTopUpError(error.response?.data?.message || 'Error al crear la solicitud de recarga');
      console.error('Error creating top-up:', error);
    } finally {
      setSubmittingTopUp(false);
    }
  };

  const getTransactionIcon = (transaction) => {
    if (transaction.amount > 0) {
      return <ArrowDownLeft className="w-5 h-5 text-green-500" />;
    }
    return <ArrowUpRight className="w-5 h-5 text-red-500" />;
  };

  const getTypeLabel = (type) => {
    const labels = {
      deposit: 'Depósito',
      withdrawal: 'Retiro',
      purchase: 'Compra',
      service: 'Servicio',
      ad: 'Publicidad',
      debit: 'Débito',
      credit: 'Crédito',
      commission: 'Comisión',
      refund: 'Reembolso',
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#FFD700] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pt-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#FFD700]">Mi Billetera</h1>
            <p className="text-gray-400 mt-1">Gestiona tu saldo y transacciones</p>
          </div>
          <a
            href="#recargar-form"
            onClick={(e) => { e.preventDefault(); setShowTopUp(true); }}
            className="flex items-center gap-2 px-6 py-2 bg-[#FFD700] text-black font-semibold rounded-lg hover:bg-yellow-400 transition"
          >
            <Plus className="w-5 h-5" />
            Recargar
          </a>
        </div>

        {checkingWompi && (
          <div className="mb-6 p-4 bg-[#1A1A1A] border border-[#FFD700]/30 rounded-xl flex items-center gap-3 text-sm text-gray-300">
            <div className="w-5 h-5 border-2 border-[#FFD700] border-t-transparent rounded-full animate-spin flex-shrink-0" />
            Confirmando tu pago con Wompi...
          </div>
        )}

        {/* Balance Card */}
        <div className="bg-gradient-to-br from-[#FFD700]/20 to-[#FFD700]/5 border border-[#FFD700]/30 rounded-2xl p-8 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-[#FFD700]/20 rounded-2xl flex items-center justify-center">
              <WalletIcon className="w-7 h-7 text-[#FFD700]" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Saldo Disponible</p>
              <p className="text-4xl font-bold text-white">${parseFloat(wallet?.balance || 0).toLocaleString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-[#0A0A0A]/50 rounded-xl p-4">
              <p className="text-gray-400 text-xs mb-1">Depósitos</p>
              <p className="text-lg font-semibold text-green-400">${parseFloat(stats.total_deposits || 0).toLocaleString()}</p>
            </div>
            <div className="bg-[#0A0A0A]/50 rounded-xl p-4">
              <p className="text-gray-400 text-xs mb-1">Retiros</p>
              <p className="text-lg font-semibold text-red-400">${parseFloat(stats.total_withdrawals || 0).toLocaleString()}</p>
            </div>
            <div className="bg-[#0A0A0A]/50 rounded-xl p-4">
              <p className="text-gray-400 text-xs mb-1">Gastado</p>
              <p className="text-lg font-semibold text-white">${parseFloat(stats.total_spent || 0).toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Top Up Form */}
        {showTopUp && (
          <form id="recargar-form" ref={topUpRef} onSubmit={handleTopUp} className="bg-[#1A1A1A] rounded-xl p-6 mb-8 border border-gray-700 scroll-mt-24">
            <h3 className="text-lg font-semibold text-[#FFD700] mb-4">Solicitar Recarga</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-1">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Monto a pagar (COP)</label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  required
                  value={topUpData.amount}
                  onChange={(e) => setTopUpData({ ...topUpData, amount: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0A0A0A] border border-gray-700 rounded-lg text-white focus:border-[#FFD700] focus:outline-none"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Método de Pago</label>
                <select
                  value={topUpData.payment_method}
                  onChange={(e) => setTopUpData({ ...topUpData, payment_method: e.target.value, payment_proof_url: '' })}
                  className="w-full px-4 py-3 bg-[#0A0A0A] border border-gray-700 rounded-lg text-white focus:border-[#FFD700] focus:outline-none"
                >
                  <option value="transfer">Transferencia Bancaria</option>
                  <option value="card">Tarjeta de Crédito/Débito</option>
                  <option value="pix">PIX</option>
                  <option value="cash">Efectivo</option>
                  <option value="bre_b_llave">Bre-B (llave)</option>
                  <option value="bre_b_qr">Bre-B (QR)</option>
                  <option value="wompi" disabled={!wompiEnabled}>Wompi {wompiEnabled ? '' : '(Próximamente)'}</option>
                  <option value="other">Otro</option>
                </select>
              </div>
            </div>
            <p className="text-sm text-[#FFD700] mb-4">= {coinsPreview} monedas</p>

            {requiresProof && (
              <div className="bg-[#0A0A0A] border border-gray-700 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-300 mb-4">
                  <QrCode className="w-4 h-4 text-[#FFD700]" />
                  {topUpData.payment_method === 'bre_b_llave'
                    ? (breBKey ? <>Llave Bre-B: <span className="font-semibold text-white">{breBKey}</span></> : 'La llave Bre-B aún no ha sido configurada.')
                    : 'Escanea el código QR para pagar con Bre-B.'}
                </div>
                <div className="flex flex-wrap justify-around gap-4">
                  <div>
                    <p className="text-xs text-gray-400 mb-2">
                      Comprobante de pago <span className="text-red-400">*</span>
                    </p>
                    <SingleImageUploader
                      value={topUpData.payment_proof_url}
                      onChange={(url) => setTopUpData({ ...topUpData, payment_proof_url: url })}
                      required
                    />
                  </div>
                  {topUpData.payment_method === 'bre_b_qr' && (
                    <div>
                      <p className="text-xs text-gray-400 mb-2">Escanea este QR</p>
                      <div className="relative aspect-square w-full max-w-[180px] rounded-xl border-2 border-dashed border-gray-700 bg-white overflow-hidden">
                        {breBQrImageUrl ? (
                          <img src={breBQrImageUrl} alt="QR Bre-B" className="w-full h-full object-contain" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-400 text-center px-2">
                            QR aún no configurado
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-gray-400 text-sm mb-2">
                Referencia de Pago <span className="text-gray-500">(opcional)</span>
              </label>
              <input
                type="text"
                value={topUpData.payment_reference}
                onChange={(e) => setTopUpData({ ...topUpData, payment_reference: e.target.value })}
                className="w-full px-4 py-3 bg-[#0A0A0A] border border-gray-700 rounded-lg text-white focus:border-[#FFD700] focus:outline-none"
                placeholder="Ej: número de aprobación o los últimos dígitos del comprobante"
              />
              <p className="text-xs text-gray-500 mt-1">
                {requiresProof
                  ? 'No es necesario si ya subiste el comprobante arriba.'
                  : 'El código o número de confirmación que te dio tu banco/app al hacer el pago, si lo tienes a mano.'}
              </p>
            </div>
            {topUpError && <p className="text-sm text-red-400 mb-4">{topUpError}</p>}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submittingTopUp}
                className="px-6 py-2 bg-[#FFD700] text-black font-semibold rounded-lg hover:bg-yellow-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submittingTopUp ? 'Enviando...' : 'Solicitar Recarga'}
              </button>
              <button type="button" disabled={submittingTopUp} onClick={() => setShowTopUp(false)} className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition disabled:opacity-50">
                Cancelar
              </button>
            </div>
          </form>
        )}

        {/* Transactions */}
        <div className="bg-[#1A1A1A] rounded-xl border border-gray-800">
          <div className="p-6 border-b border-gray-800">
            <h2 className="text-lg font-semibold text-white">Transacciones Recientes</h2>
          </div>

          {transactions.length === 0 && pendingTopUps.length === 0 ? (
            <div className="p-12 text-center">
              <WalletIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500">No hay transacciones aún</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-800">
              {pendingTopUps.map((topUp) => (
                <div key={`pending-${topUp.id}`} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div>
                      <p className="font-medium text-white">Recarga pendiente</p>
                      <p className="text-sm text-gray-500">En revisión por el equipo</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-yellow-400">
                      Carga pendiente de ${parseFloat(topUp.amount).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(topUp.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
              {transactions.map((transaction) => (
                <div key={transaction.id} className="p-4 flex items-center justify-between hover:bg-[#2A2A2A] transition">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#2A2A2A] rounded-lg flex items-center justify-center">
                      {getTransactionIcon(transaction)}
                    </div>
                    <div>
                      <p className="font-medium text-white">{getTypeLabel(transaction.type)}</p>
                      <p className="text-sm text-gray-500">{transaction.description || 'Sin descripción'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${transaction.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {transaction.amount > 0 ? '+' : ''}{parseFloat(transaction.amount).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}