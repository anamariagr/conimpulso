import { useState, useEffect } from 'react';
import { Search, Plus, Minus, Check, X, Wallet, Clock, AlertTriangle, RefreshCw } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function WalletView() {
  const [tab, setTab] = useState('topups'); // 'topups' | 'adjust'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Saldo</h1>
        <p className="text-gray-500">Aprueba recargas pendientes y ajusta saldo de usuarios</p>
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        <TabBtn active={tab === 'topups'} onClick={() => setTab('topups')}>
          <Clock className="w-4 h-4" /> Recargas pendientes
        </TabBtn>
        <TabBtn active={tab === 'adjust'} onClick={() => setTab('adjust')}>
          <Wallet className="w-4 h-4" /> Ajuste manual de saldo
        </TabBtn>
      </div>

      {tab === 'topups' && <PendingTopUps />}
      {tab === 'adjust' && <ManualAdjust />}
    </div>
  );
}

function TabBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
        active ? 'border-accent text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'
      }`}
    >
      {children}
    </button>
  );
}

/* ─── Recargas pendientes ─── */
function PendingTopUps() {
  const [topUps, setTopUps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/wallet/pending-topups');
      setTopUps(res.data.data || []);
    } catch {
      toast.error('Error al cargar recargas pendientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handle = async (id, action) => {
    setActionId(id);
    try {
      await api.post(`/admin/wallet/topups/${id}/approve`, { action });
      toast.success(action === 'approve' ? 'Recarga aprobada y acreditada' : 'Recarga rechazada');
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Error al procesar la recarga');
    } finally {
      setActionId(null);
    }
  };

  if (loading) return <Spinner />;

  if (topUps.length === 0) {
    return (
      <div className="card flex flex-col items-center justify-center py-16 text-gray-400">
        <Check className="w-12 h-12 mb-3 text-green-400" />
        <p className="font-medium text-gray-600">Sin recargas pendientes</p>
        <p className="text-sm mt-1">Todas las solicitudes han sido procesadas</p>
        <button onClick={load} className="mt-4 btn-outline flex items-center gap-2 text-sm">
          <RefreshCw className="w-4 h-4" /> Actualizar
        </button>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">{topUps.length} solicitud(es) pendiente(s)</p>
        <button onClick={load} className="btn-outline flex items-center gap-2 text-sm">
          <RefreshCw className="w-4 h-4" /> Actualizar
        </button>
      </div>
      <div className="space-y-3">
        {topUps.map((t) => (
          <div key={t.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="font-bold text-yellow-700">{t.user?.name?.charAt(0) || '?'}</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{t.user?.name || `Usuario #${t.user_id}`}</p>
                <p className="text-xs text-gray-500">{t.user?.email}</p>
              </div>
            </div>
            <div className="text-center hidden md:block">
              <p className="text-xs text-gray-500">Método</p>
              <p className="font-medium text-gray-900 capitalize">{t.payment_method}</p>
              {t.payment_reference && (
                <p className="text-xs text-gray-400">Ref: {t.payment_reference}</p>
              )}
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">Monto</p>
              <p className="text-xl font-bold text-gray-900">
                {Number(t.amount).toLocaleString('es-CL')}
              </p>
            </div>
            <div className="text-center hidden md:block">
              <p className="text-xs text-gray-500">Fecha</p>
              <p className="text-sm text-gray-600">
                {new Date(t.created_at).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handle(t.id, 'approve')}
                disabled={actionId === t.id}
                className="flex items-center gap-1 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                <Check className="w-4 h-4" /> Aprobar
              </button>
              <button
                onClick={() => handle(t.id, 'reject')}
                disabled={actionId === t.id}
                className="flex items-center gap-1 px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                <X className="w-4 h-4" /> Rechazar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Ajuste manual de saldo ─── */
function ManualAdjust() {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [mode, setMode] = useState('credit'); // 'credit' | 'debit'

  // credit fields
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('transferencia');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');

  // debit fields
  const [debitAmount, setDebitAmount] = useState('');
  const [debitReason, setDebitReason] = useState('');

  const [submitting, setSubmitting] = useState(false);

  const searchUsers = async () => {
    if (!search.trim()) return;
    setLoading(true);
    try {
      const res = await api.get('/admin/wallet/users', { params: { search } });
      setUsers(res.data.data || []);
    } catch {
      toast.error('Error al buscar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleCredit = async (e) => {
    e.preventDefault();
    if (!selected) return toast.error('Selecciona un usuario');
    if (!amount || Number(amount) <= 0) return toast.error('Ingresa un monto válido');

    const description = [
      `Pago manual — ${PAYMENT_METHODS[paymentMethod] || paymentMethod}`,
      reference ? `Ref: ${reference}` : '',
      notes || '',
    ].filter(Boolean).join(' · ');

    setSubmitting(true);
    try {
      const res = await api.post(`/admin/wallet/users/${selected.id}/credit`, {
        amount: Number(amount),
        description,
      });
      const newBalance = res.data.data?.balance ?? selected.balance;
      toast.success(`+${Number(amount).toLocaleString('es-CL')} acreditado a ${selected.name}`);
      setSelected({ ...selected, balance: newBalance });
      setUsers((prev) => prev.map((u) => u.id === selected.id ? { ...u, balance: newBalance } : u));
      setAmount(''); setReference(''); setNotes('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al acreditar saldo');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDebit = async (e) => {
    e.preventDefault();
    if (!selected) return toast.error('Selecciona un usuario');
    if (!debitAmount || Number(debitAmount) <= 0) return toast.error('Ingresa un monto válido');
    if (!debitReason.trim()) return toast.error('Ingresa el motivo del débito');

    setSubmitting(true);
    try {
      const res = await api.post(`/admin/wallet/users/${selected.id}/debit`, {
        amount: Number(debitAmount),
        description: debitReason.trim(),
      });
      const newBalance = res.data.data?.balance ?? selected.balance;
      toast.success(`-${Number(debitAmount).toLocaleString('es-CL')} debitado de ${selected.name}`);
      setSelected({ ...selected, balance: newBalance });
      setUsers((prev) => prev.map((u) => u.id === selected.id ? { ...u, balance: newBalance } : u));
      setDebitAmount(''); setDebitReason('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al debitar saldo');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

      {/* Buscar usuario */}
      <div className="card space-y-4">
        <h2 className="font-semibold text-gray-900">Buscar usuario</h2>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchUsers()}
              placeholder="Nombre o email..."
              className="input-field pl-9 w-full"
            />
          </div>
          <button onClick={searchUsers} disabled={loading} className="btn-primary">
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Buscar'}
          </button>
        </div>

        {users.length > 0 && (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {users.map((u) => (
              <button
                key={u.id}
                onClick={() => setSelected(u)}
                className={`w-full flex items-center justify-between p-3 rounded-xl border transition-colors text-left ${
                  selected?.id === u.id ? 'border-accent bg-yellow-50' : 'border-gray-100 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center font-semibold text-gray-600 flex-shrink-0">
                    {u.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">{u.name}</p>
                    <p className="text-xs text-gray-500 truncate">{u.email}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <p className="text-xs text-gray-500">Saldo</p>
                  <p className="font-bold text-gray-900">{u.balance.toLocaleString('es-CL')}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {users.length === 0 && search && !loading && (
          <p className="text-sm text-gray-400 text-center py-4">No se encontraron usuarios</p>
        )}
      </div>

      {/* Formulario */}
      <div className="card space-y-4">
        {!selected ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <Wallet className="w-12 h-12 mb-3" />
            <p className="text-sm">Busca y selecciona un usuario</p>
          </div>
        ) : (
          <>
            {/* Usuario seleccionado */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center font-bold text-primary flex-shrink-0">
                  {selected.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{selected.name}</p>
                  <p className="text-xs text-gray-500">{selected.email}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Saldo actual</p>
                <p className="text-xl font-bold text-gray-900">{selected.balance.toLocaleString('es-CL')}</p>
              </div>
            </div>

            {/* Tabs crédito / débito */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMode('credit')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border text-sm font-medium transition-colors ${
                  mode === 'credit' ? 'bg-green-500 text-white border-green-500' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Plus className="w-4 h-4" /> Agregar saldo
              </button>
              <button
                type="button"
                onClick={() => setMode('debit')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border text-sm font-medium transition-colors ${
                  mode === 'debit' ? 'bg-red-500 text-white border-red-500' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Minus className="w-4 h-4" /> Quitar saldo
              </button>
            </div>

            {/* ── FORMULARIO CRÉDITO ── */}
            {mode === 'credit' && (
              <form onSubmit={handleCredit} className="space-y-3">
                <div className="p-3 bg-green-50 border border-green-100 rounded-xl text-sm text-green-700">
                  Registra el pago externo del usuario y acredita el saldo correspondiente.
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Monto a acreditar</label>
                  <input
                    type="number" min="0.01" step="0.01"
                    value={amount} onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00" className="input-field w-full text-xl font-bold" required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Medio de pago utilizado</label>
                  <select
                    value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}
                    className="input-field w-full"
                  >
                    {Object.entries(PAYMENT_METHODS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número de referencia / comprobante <span className="text-gray-400 font-normal">(opcional)</span>
                  </label>
                  <input
                    type="text" value={reference} onChange={(e) => setReference(e.target.value)}
                    placeholder="Ej: TXN-20260609-001"
                    className="input-field w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notas adicionales <span className="text-gray-400 font-normal">(opcional)</span>
                  </label>
                  <input
                    type="text" value={notes} onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ej: Pago confirmado por WhatsApp"
                    className="input-field w-full"
                  />
                </div>

                <button
                  type="submit" disabled={submitting}
                  className="w-full py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Procesando...' : `Acreditar ${amount ? Number(amount).toLocaleString('es-CL') : ''}` }
                </button>
              </form>
            )}

            {/* ── FORMULARIO DÉBITO ── */}
            {mode === 'debit' && (
              <form onSubmit={handleDebit} className="space-y-3">
                <div className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-100 rounded-xl text-sm text-orange-700">
                  <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  Esta operación reducirá el saldo del usuario. Úsala solo para correcciones o reversiones.
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Monto a descontar</label>
                  <input
                    type="number" min="0.01" step="0.01"
                    value={debitAmount} onChange={(e) => setDebitAmount(e.target.value)}
                    placeholder="0.00" className="input-field w-full text-xl font-bold" required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Motivo del débito</label>
                  <input
                    type="text" value={debitReason} onChange={(e) => setDebitReason(e.target.value)}
                    placeholder="Ej: Reversión de pago duplicado..."
                    className="input-field w-full" required
                  />
                </div>

                <button
                  type="submit" disabled={submitting}
                  className="w-full py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Procesando...' : `Descontar ${debitAmount ? Number(debitAmount).toLocaleString('es-CL') : ''}`}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const PAYMENT_METHODS = {
  transferencia: 'Transferencia bancaria',
  efectivo: 'Efectivo',
  nequi: 'Nequi',
  daviplata: 'Daviplata',
  pse: 'PSE',
  cheque: 'Cheque',
  otro: 'Otro medio de pago',
};

function Spinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
