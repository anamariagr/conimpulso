import { useState, useEffect } from 'react';
import { Search, Plus, Minus, Check, X, Wallet, Clock, AlertTriangle, RefreshCw, QrCode, Eye, EyeOff } from 'lucide-react';
import api from '../../services/api';
import { useSiteStore } from '../../stores/siteStore';
import { SingleImageUploader } from '../../components/forms/ImageUploader';
import toast from 'react-hot-toast';

export default function WalletView() {
  const [tab, setTab] = useState('topups'); // 'topups' | 'adjust' | 'payment-config'

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
        <TabBtn active={tab === 'payment-config'} onClick={() => setTab('payment-config')}>
          <QrCode className="w-4 h-4" /> Bre-B / Wompi
        </TabBtn>
      </div>

      {tab === 'topups' && <PendingTopUps />}
      {tab === 'adjust' && <ManualAdjust />}
      {tab === 'payment-config' && <PaymentConfig />}
    </div>
  );
}

/* ─── Configuración de pago: llave/QR Bre-B, Wompi ─── */
function PaymentConfig() {
  const {
    walletCoinValueCop, breBKey, breBQrImageUrl, wompiEnabled, wompiPublicKey,
    loaded, fetchSettings, updateSettings,
  } = useSiteStore();

  const [form, setForm] = useState({
    walletCoinValueCop: walletCoinValueCop || 3000,
    breBKey: breBKey || '',
    breBQrImageUrl: breBQrImageUrl || '',
    wompiEnabled: wompiEnabled || false,
    wompiPublicKey: wompiPublicKey || '',
  });
  const [showWompiKey, setShowWompiKey] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchSettings(); }, []);

  // Only sync from the store once the real values have loaded — otherwise
  // this would briefly overwrite the form with defaults on every render.
  useEffect(() => {
    if (!loaded) return;
    setForm({
      walletCoinValueCop: walletCoinValueCop || 3000,
      breBKey: breBKey || '',
      breBQrImageUrl: breBQrImageUrl || '',
      wompiEnabled: wompiEnabled || false,
      wompiPublicKey: wompiPublicKey || '',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings({
        wallet_coin_value_cop: form.walletCoinValueCop,
        bre_b_key: form.breBKey,
        bre_b_qr_image_url: form.breBQrImageUrl,
        wompi_enabled: form.wompiEnabled,
        wompi_public_key: form.wompiPublicKey,
      });
      toast.success('Configuración de pagos guardada');
    } catch {
      toast.error('Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card max-w-lg space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Valor de 1 moneda (COP)</label>
        <input
          type="number"
          min="1"
          value={form.walletCoinValueCop}
          onChange={(e) => set('walletCoinValueCop', e.target.value)}
          className="input-field w-full"
          placeholder="3000"
        />
        <p className="text-xs text-gray-400 mt-1">Al aprobar una recarga se acreditan (monto pagado ÷ este valor) monedas.</p>
      </div>

      <div className="border-t border-gray-100 pt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Llave Bre-B</label>
        <input
          type="text"
          value={form.breBKey}
          onChange={(e) => set('breBKey', e.target.value)}
          className="input-field w-full"
          placeholder="Ej: @tullave o número"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
          <QrCode className="w-4 h-4" /> QR de Bre-B
        </label>
        <SingleImageUploader
          value={form.breBQrImageUrl}
          onChange={(url) => set('breBQrImageUrl', url)}
          hint="Imagen del código QR que verán los clientes al elegir Bre-B."
        />
      </div>

      <div className="border-t border-gray-100 pt-4">
        <Toggle
          label="Wompi habilitado"
          checked={form.wompiEnabled}
          onChange={(v) => set('wompiEnabled', v)}
        />
        <p className="text-xs text-gray-400 mt-1 mb-3">Actívalo cuando tengas la cuenta de Wompi aprobada.</p>
        {form.wompiEnabled && (
          <div className="relative">
            <input
              type={showWompiKey ? 'text' : 'password'}
              value={form.wompiPublicKey}
              onChange={(e) => set('wompiPublicKey', e.target.value)}
              className="input-field w-full pr-10"
              placeholder="Llave pública de Wompi"
            />
            <button
              type="button"
              onClick={() => setShowWompiKey(!showWompiKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showWompiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        )}
      </div>

      <button
        onClick={handleSave}
        disabled={!loaded || saving}
        className="w-full py-3 rounded-xl bg-accent hover:bg-yellow-400 text-primary font-semibold transition-colors disabled:opacity-50"
      >
        {!loaded ? 'Cargando...' : saving ? 'Guardando...' : 'Guardar cambios'}
      </button>
    </div>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex items-center justify-between cursor-pointer">
      <span className="text-sm text-gray-700">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-accent' : 'bg-gray-200'}`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </label>
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
  const { walletCoinValueCop, fetchSettings } = useSiteStore();
  const [topUps, setTopUps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => { fetchSettings(); }, []);

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
                ${Number(t.amount).toLocaleString('es-CL')}
              </p>
              <p className="text-xs text-accent-dark font-medium">
                = {(Number(t.amount) / (walletCoinValueCop || 3000)).toFixed(2)} monedas
              </p>
            </div>
            {t.payment_proof_url && (
              <button
                type="button"
                onClick={() => setPreview(t.payment_proof_url)}
                className="hidden md:flex flex-col items-center gap-1 text-gray-500 hover:text-gray-700"
              >
                <img src={t.payment_proof_url} alt="Comprobante" className="w-12 h-12 object-cover rounded-lg border border-gray-200" />
                <span className="text-xs">Comprobante</span>
              </button>
            )}
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

      {preview && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setPreview(null)}
        >
          <img src={preview} alt="Comprobante" className="max-w-full max-h-full rounded-xl" />
        </div>
      )}
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
