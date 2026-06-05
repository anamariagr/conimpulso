import { useState, useEffect } from 'react';
import { Wallet as WalletIcon, Plus, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, XCircle } from 'lucide-react';
import api from '../../services/api';

export default function WalletPage() {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showTopUp, setShowTopUp] = useState(false);
  const [topUpData, setTopUpData] = useState({ amount: '', payment_method: 'transfer', payment_reference: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [walletRes, transactionsRes, statsRes] = await Promise.all([
        api.get('/wallet'),
        api.get('/wallet/transactions'),
        api.get('/wallet/stats'),
      ]);
      setWallet(walletRes.data.data);
      setTransactions(transactionsRes.data.data);
      setStats(statsRes.data.data);
    } catch (error) {
      console.error('Error fetching wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTopUp = async (e) => {
    e.preventDefault();
    try {
      await api.post('/wallet/top-up', topUpData);
      setShowTopUp(false);
      setTopUpData({ amount: '', payment_method: 'transfer', payment_reference: '' });
      fetchData();
    } catch (error) {
      console.error('Error creating top-up:', error);
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
          <button
            onClick={() => setShowTopUp(!showTopUp)}
            className="flex items-center gap-2 px-6 py-2 bg-[#FFD700] text-black font-semibold rounded-lg hover:bg-yellow-400 transition"
          >
            <Plus className="w-5 h-5" />
            Recargar
          </button>
        </div>

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
          <form onSubmit={handleTopUp} className="bg-[#1A1A1A] rounded-xl p-6 mb-8 border border-gray-700">
            <h3 className="text-lg font-semibold text-[#FFD700] mb-4">Solicitar Recarga</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Monto (USD)</label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  required
                  value={topUpData.amount}
                  onChange={(e) => setTopUpData({ ...topUpData, amount: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0A0A0A] border border-gray-700 rounded-lg text-white focus:border-[#FFD700] focus:outline-none"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Método de Pago</label>
                <select
                  value={topUpData.payment_method}
                  onChange={(e) => setTopUpData({ ...topUpData, payment_method: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0A0A0A] border border-gray-700 rounded-lg text-white focus:border-[#FFD700] focus:outline-none"
                >
                  <option value="transfer">Transferencia Bancaria</option>
                  <option value="card">Tarjeta de Crédito/Débito</option>
                  <option value="pix">PIX</option>
                  <option value="cash">Efectivo</option>
                  <option value="other">Otro</option>
                </select>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-gray-400 text-sm mb-2">Referencia de Pago</label>
              <input
                type="text"
                value={topUpData.payment_reference}
                onChange={(e) => setTopUpData({ ...topUpData, payment_reference: e.target.value })}
                className="w-full px-4 py-3 bg-[#0A0A0A] border border-gray-700 rounded-lg text-white focus:border-[#FFD700] focus:outline-none"
                placeholder="Número de transacción o referencia"
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="px-6 py-2 bg-[#FFD700] text-black font-semibold rounded-lg hover:bg-yellow-400 transition">
                Solicitar Recarga
              </button>
              <button type="button" onClick={() => setShowTopUp(false)} className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition">
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

          {transactions.length === 0 ? (
            <div className="p-12 text-center">
              <WalletIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500">No hay transacciones aún</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-800">
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