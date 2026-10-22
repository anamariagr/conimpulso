import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Package, Plus, Loader2, Edit2, Trash2, ExternalLink, AlertCircle,
  ChevronDown, ChevronUp, Boxes, Clock, Percent, Calculator, Save, TrendingUp, NotebookPen,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api, { productService, inventoryService } from '../../services/api';

const STATUS_LABELS = {
  active:   { label: 'Activo',   cls: 'bg-green-100 text-green-700' },
  inactive: { label: 'Inactivo', cls: 'bg-gray-100 text-gray-500' },
  draft:    { label: 'Borrador', cls: 'bg-accent-100 text-accent-700' },
  pending:  { label: 'Revisión', cls: 'bg-blue-100 text-blue-700' },
};

const fmt = (value) => `$${Number(value || 0).toLocaleString('es-CO')}`;

const inputCls =
  'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent';

function Section({ icon: Icon, title, children }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h3 className="flex items-center gap-2 font-semibold text-primary mb-3">
        <Icon className="w-4 h-4 text-accent" />
        {title}
      </h3>
      {children}
    </div>
  );
}

function SuppliesSection({ productId, timeEntries, onChanged }) {
  const [supplies, setSupplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', quantity: '', unit: '', unit_cost: '', time_entry_id: '' });

  const load = useCallback(() => {
    inventoryService.supplies(productId)
      .then((res) => setSupplies(res.data.data || []))
      .catch(() => toast.error('No se pudieron cargar los suministros.'))
      .finally(() => setLoading(false));
  }, [productId]);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = {
        name: form.name,
        quantity: Number(form.quantity),
        unit_cost: Number(form.unit_cost),
      };
      if (form.unit) data.unit = form.unit;
      if (form.time_entry_id) data.time_entry_id = form.time_entry_id;
      await inventoryService.addSupply(productId, data);
      toast.success('Suministro agregado.');
      setForm({ name: '', quantity: '', unit: '', unit_cost: '', time_entry_id: '' });
      load();
      onChanged();
    } catch {
      toast.error('No se pudo agregar el suministro.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (supply) => {
    if (!window.confirm(`¿Eliminar el suministro "${supply.name}"?`)) return;
    try {
      await inventoryService.deleteSupply(productId, supply.id);
      setSupplies((prev) => prev.filter((s) => s.id !== supply.id));
      toast.success('Suministro eliminado.');
      onChanged();
    } catch {
      toast.error('No se pudo eliminar el suministro.');
    }
  };

  return (
    <Section icon={Boxes} title="Suministros">
      {loading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-accent" />
        </div>
      ) : (
        <>
          {supplies.length > 0 && (
            <div className="overflow-x-auto mb-3">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-400 border-b border-gray-200">
                    <th className="pb-2 pr-2 font-medium">Nombre</th>
                    <th className="pb-2 pr-2 font-medium">Cantidad</th>
                    <th className="pb-2 pr-2 font-medium">Unidad</th>
                    <th className="pb-2 pr-2 font-medium">Costo unitario</th>
                    <th className="pb-2 pr-2 font-medium">Total</th>
                    <th className="pb-2 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {supplies.map((s) => (
                    <tr key={s.id} className="border-b border-gray-100 last:border-0">
                      <td className="py-2 pr-2 text-gray-700">{s.name}</td>
                      <td className="py-2 pr-2 text-gray-700">{s.quantity}</td>
                      <td className="py-2 pr-2 text-gray-500">{s.unit || '—'}</td>
                      <td className="py-2 pr-2 text-gray-700">{fmt(s.unit_cost)}</td>
                      <td className="py-2 pr-2 text-gray-700">{fmt(Number(s.quantity) * Number(s.unit_cost))}</td>
                      <td className="py-2 text-right">
                        <button
                          onClick={() => handleDelete(s)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar suministro"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <form onSubmit={handleAdd} className="grid grid-cols-2 md:grid-cols-6 gap-2 items-end">
            <div className="col-span-2">
              <input required placeholder="Nombre" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
            </div>
            <div>
              <input required type="number" min="0" step="any" placeholder="Cantidad" value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })} className={inputCls} />
            </div>
            <div>
              <input placeholder="Unidad (opc.)" value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })} className={inputCls} />
            </div>
            <div>
              <input required type="number" min="0" step="any" placeholder="Costo unitario" value={form.unit_cost}
                onChange={(e) => setForm({ ...form, unit_cost: e.target.value })} className={inputCls} />
            </div>
            <div className="col-span-2 md:col-span-1">
              <select value={form.time_entry_id}
                onChange={(e) => setForm({ ...form, time_entry_id: e.target.value })} className={inputCls}>
                <option value="">Sin tiempo asociado</option>
                {timeEntries.map((t) => (
                  <option key={t.id} value={t.id}>{t.description}</option>
                ))}
              </select>
            </div>
            <button type="submit" disabled={saving}
              className="col-span-2 md:col-span-6 flex items-center justify-center gap-2 px-4 py-2 bg-accent text-white text-sm font-semibold rounded-lg hover:bg-accent-400 transition disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Agregar suministro
            </button>
          </form>
        </>
      )}
    </Section>
  );
}

function TimeEntriesSection({ productId, entries, setEntries, onChanged }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ description: '', minutes: '', hourly_rate: '' });

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await inventoryService.addTimeEntry(productId, {
        description: form.description,
        minutes: Number(form.minutes),
        hourly_rate: Number(form.hourly_rate),
      });
      toast.success('Tiempo de creación agregado.');
      setForm({ description: '', minutes: '', hourly_rate: '' });
      const res = await inventoryService.timeEntries(productId);
      setEntries(res.data.data || []);
      onChanged();
    } catch {
      toast.error('No se pudo agregar el tiempo de creación.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (entry) => {
    if (!window.confirm(`¿Eliminar el tiempo "${entry.description}"?`)) return;
    try {
      await inventoryService.deleteTimeEntry(productId, entry.id);
      setEntries(entries.filter((t) => t.id !== entry.id));
      toast.success('Tiempo de creación eliminado.');
      onChanged();
    } catch {
      toast.error('No se pudo eliminar el tiempo de creación.');
    }
  };

  return (
    <Section icon={Clock} title="Tiempos de creación">
      {entries.length > 0 && (
        <div className="overflow-x-auto mb-3">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 border-b border-gray-200">
                <th className="pb-2 pr-2 font-medium">Descripción</th>
                <th className="pb-2 pr-2 font-medium">Minutos</th>
                <th className="pb-2 pr-2 font-medium">Tarifa/hora</th>
                <th className="pb-2 pr-2 font-medium">Costo</th>
                <th className="pb-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {entries.map((t) => (
                <tr key={t.id} className="border-b border-gray-100 last:border-0">
                  <td className="py-2 pr-2 text-gray-700">{t.description}</td>
                  <td className="py-2 pr-2 text-gray-700">{t.minutes}</td>
                  <td className="py-2 pr-2 text-gray-700">{fmt(t.hourly_rate)}</td>
                  <td className="py-2 pr-2 text-gray-700">{fmt((Number(t.minutes) / 60) * Number(t.hourly_rate))}</td>
                  <td className="py-2 text-right">
                    <button
                      onClick={() => handleDelete(t)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar tiempo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <form onSubmit={handleAdd} className="grid grid-cols-2 md:grid-cols-4 gap-2 items-end">
        <div className="col-span-2">
          <input required placeholder="Descripción" value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputCls} />
        </div>
        <div>
          <input required type="number" min="0" placeholder="Minutos" value={form.minutes}
            onChange={(e) => setForm({ ...form, minutes: e.target.value })} className={inputCls} />
        </div>
        <div>
          <input required type="number" min="0" step="any" placeholder="Tarifa por hora" value={form.hourly_rate}
            onChange={(e) => setForm({ ...form, hourly_rate: e.target.value })} className={inputCls} />
        </div>
        <button type="submit" disabled={saving}
          className="col-span-2 md:col-span-4 flex items-center justify-center gap-2 px-4 py-2 bg-accent text-white text-sm font-semibold rounded-lg hover:bg-accent-400 transition disabled:opacity-50">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Agregar tiempo
        </button>
      </form>
    </Section>
  );
}

const MONTH_LABELS = {
  '01': 'Ene', '02': 'Feb', '03': 'Mar', '04': 'Abr', '05': 'May', '06': 'Jun',
  '07': 'Jul', '08': 'Ago', '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dic',
};

const monthLabel = (yyyyMm) => {
  const [year, month] = yyyyMm.split('-');
  return `${MONTH_LABELS[month] || month} ${year}`;
};

function SalesSection({ productId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    inventoryService.salesSummary(productId)
      .then((res) => setData(res.data.data || null))
      .catch(() => toast.error('No se pudieron cargar las ventas.'))
      .finally(() => setLoading(false));
  }, [productId]);

  return (
    <Section icon={TrendingUp} title="Ventas">
      {loading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-accent" />
        </div>
      ) : !data ? (
        <p className="text-sm text-gray-500">No hay datos de ventas disponibles.</p>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-gray-400">Vendidos este mes</p>
              <p className="font-semibold text-gray-700">{data.current_month.units}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Ingresos este mes</p>
              <p className="font-semibold text-gray-700">{fmt(data.current_month.revenue)}</p>
            </div>
          </div>
          {data.history.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-400 border-b border-gray-200">
                    <th className="pb-2 pr-2 font-medium">Mes</th>
                    <th className="pb-2 pr-2 font-medium">Unidades</th>
                    <th className="pb-2 font-medium">Ingresos</th>
                  </tr>
                </thead>
                <tbody>
                  {data.history.map((row) => (
                    <tr key={row.month} className="border-b border-gray-100 last:border-0">
                      <td className="py-2 pr-2 text-gray-700">{monthLabel(row.month)}</td>
                      <td className="py-2 pr-2 text-gray-700">{row.units}</td>
                      <td className="py-2 text-gray-700">{fmt(row.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </Section>
  );
}

function ManufacturingNotesSection({ productId, initialNotes }) {
  const [notes, setNotes] = useState(initialNotes || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await inventoryService.updateManufacturingNotes(productId, notes);
      toast.success('Notas guardadas.');
    } catch {
      toast.error('No se pudieron guardar las notas.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Section icon={NotebookPen} title="Cómo hice este producto">
      <p className="text-xs text-gray-400 mb-2">
        Notas privadas: materiales, pasos, proveedores. Solo tú puedes verlas.
      </p>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className={inputCls}
        rows={5}
        placeholder="Ej: Cortar la tela con el patrón X, coser con hilo Y, proveedor de la cremallera: ..."
      />
      <button onClick={handleSave} disabled={saving}
        className="mt-2 flex items-center gap-1.5 px-4 py-2 bg-accent text-white text-sm font-semibold rounded-lg hover:bg-accent-400 transition disabled:opacity-50">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Guardar notas
      </button>
    </Section>
  );
}

function CostPanel({ product, onPriceApplied }) {
  const [timeEntries, setTimeEntries] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [margin, setMargin] = useState(product.profit_margin ?? '');
  const [savingMargin, setSavingMargin] = useState(false);
  const [applying, setApplying] = useState(false);

  const loadSummary = useCallback(() => {
    inventoryService.costSummary(product.id)
      .then((res) => setSummary(res.data.data || null))
      .catch(() => toast.error('No se pudo cargar el resumen de costos.'));
  }, [product.id]);

  useEffect(() => {
    Promise.all([
      inventoryService.timeEntries(product.id),
      inventoryService.costSummary(product.id),
    ])
      .then(([entriesRes, summaryRes]) => {
        setTimeEntries(entriesRes.data.data || []);
        setSummary(summaryRes.data.data || null);
      })
      .catch(() => toast.error('No se pudo cargar el detalle del producto.'))
      .finally(() => setLoading(false));
  }, [product.id]);

  const handleSaveMargin = async (e) => {
    e.preventDefault();
    setSavingMargin(true);
    try {
      await productService.update(product.id, { profit_margin: Number(margin) });
      toast.success('Margen de ganancia actualizado.');
      loadSummary();
    } catch {
      toast.error('No se pudo actualizar el margen.');
    } finally {
      setSavingMargin(false);
    }
  };

  const handleApplyPrice = async () => {
    if (!summary?.suggested_price) return;
    setApplying(true);
    try {
      await productService.update(product.id, { price: summary.suggested_price });
      toast.success('Precio actualizado con el valor sugerido.');
      onPriceApplied(product.id, summary.suggested_price);
      loadSummary();
    } catch {
      toast.error('No se pudo aplicar el precio sugerido.');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8 border-t border-gray-100 mt-4">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="border-t border-gray-100 mt-4 pt-4 space-y-4">
      <SuppliesSection productId={product.id} timeEntries={timeEntries} onChanged={loadSummary} />
      <TimeEntriesSection
        productId={product.id}
        entries={timeEntries}
        setEntries={setTimeEntries}
        onChanged={loadSummary}
      />

      <Section icon={Percent} title="Margen de ganancia">
        <form onSubmit={handleSaveMargin} className="flex items-center gap-2">
          <input type="number" min="0" step="any" placeholder="Ej: 30" value={margin}
            onChange={(e) => setMargin(e.target.value)} className={`${inputCls} max-w-[120px]`} />
          <span className="text-sm text-gray-500">%</span>
          <button type="submit" disabled={savingMargin}
            className="flex items-center gap-1.5 px-4 py-2 bg-accent text-white text-sm font-semibold rounded-lg hover:bg-accent-400 transition disabled:opacity-50">
            {savingMargin ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Guardar
          </button>
        </form>
      </Section>

      <Section icon={Calculator} title="Resumen de costos">
        {summary ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div>
                <p className="text-xs text-gray-400">Costo suministros</p>
                <p className="font-semibold text-gray-700">{fmt(summary.supplies_total)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Costo tiempo</p>
                <p className="font-semibold text-gray-700">{fmt(summary.time_total)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Costo total</p>
                <p className="font-semibold text-gray-700">{fmt(summary.total_cost)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Margen</p>
                <p className="font-semibold text-gray-700">{Number(summary.profit_margin || 0)}%</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-accent/5 border border-accent/20 rounded-lg p-4">
              <div className="flex-1">
                <p className="text-xs text-gray-500">Precio sugerido</p>
                <p className="text-2xl font-bold text-accent">{fmt(summary.suggested_price)}</p>
                <p className="text-xs text-gray-400">Precio actual: {fmt(summary.current_price)}</p>
              </div>
              <button onClick={handleApplyPrice} disabled={applying}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-accent text-white text-sm font-semibold rounded-lg hover:bg-accent-400 transition disabled:opacity-50">
                {applying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Aplicar precio sugerido
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500">No hay resumen de costos disponible.</p>
        )}
      </Section>

      <SalesSection productId={product.id} />

      {summary?.manufacturing_notes_enabled && (
        <ManufacturingNotesSection productId={product.id} initialNotes={summary.manufacturing_notes} />
      )}
    </div>
  );
}

function ProductRow({ product, onDelete, onStockSaved, onPriceApplied }) {
  const [expanded, setExpanded] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [stock, setStock] = useState(product.stock ?? 0);
  const [savingStock, setSavingStock] = useState(false);

  const image = product.images?.[0];
  const price = Number(product.price);
  const status = STATUS_LABELS[product.status] || STATUS_LABELS.draft;

  const handleSaveStock = async () => {
    setSavingStock(true);
    try {
      await productService.update(product.id, { stock: Number(stock) });
      toast.success('Stock actualizado.');
      onStockSaved(product.id, Number(stock));
    } catch {
      toast.error('No se pudo actualizar el stock.');
    } finally {
      setSavingStock(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`¿Eliminar "${product.name}"? Esta acción no se puede deshacer.`)) return;
    setDeleting(true);
    try {
      await api.delete(`/products/${product.id}`);
      onDelete(product.id);
    } catch {
      toast.error('No se pudo eliminar el producto. Intenta de nuevo.');
      setDeleting(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-xl border border-gray-100 hover:border-accent/40 transition-colors">
      <div className="flex items-center gap-4">
        {/* Thumbnail */}
        <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
          {image ? (
            <img src={image} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-6 h-6 text-gray-300" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-primary truncate">{product.name}</p>
          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
            {price > 0 && (
              <span className="text-sm text-gray-600">{fmt(price)}</span>
            )}
            {product.stock != null && (
              <span className="text-xs text-gray-400">{product.stock} en stock</span>
            )}
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${status.cls}`}>
              {status.label}
            </span>
          </div>
        </div>

        {/* Stock inline edit */}
        <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
          <label className="text-xs text-gray-400">Stock</label>
          <input
            type="number"
            min="0"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className="w-20 px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
          />
          <button
            onClick={handleSaveStock}
            disabled={savingStock || Number(stock) === Number(product.stock)}
            className="flex items-center gap-1 px-3 py-1.5 bg-accent text-white text-xs font-semibold rounded-lg hover:bg-accent-400 transition disabled:opacity-50"
          >
            {savingStock ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Guardar
          </button>
        </div>

        {/* View link */}
        {product.slug && (
          <Link
            to={`/products/${product.slug}`}
            title="Ver producto público"
            className="hidden sm:inline-flex p-2 text-gray-400 hover:text-accent hover:bg-accent/10 rounded-lg transition-colors flex-shrink-0"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <Link
            to={`/dashboard/products/${product.slug || product.id}/edit`}
            className="p-2 text-gray-400 hover:text-accent hover:bg-accent/10 rounded-lg transition-colors"
            title="Editar"
          >
            <Edit2 className="w-4 h-4" />
          </Link>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-2 text-gray-400 hover:text-accent hover:bg-accent/10 rounded-lg transition-colors"
            title={expanded ? 'Ocultar detalle de costos' : 'Ver detalle de costos'}
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
            title="Eliminar"
          >
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {expanded && (
        <CostPanel product={product} onPriceApplied={onPriceApplied} />
      )}
    </div>
  );
}

export default function ProductsListPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProducts = () => {
    api.get('/my/products')
      .then((res) => setProducts(res.data.data || []))
      .catch(() => setError('No se pudieron cargar los productos.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleRetry = () => {
    setError('');
    setLoading(true);
    fetchProducts();
  };

  const handleDelete = (id) => setProducts((prev) => prev.filter((p) => p.id !== id));

  const handleStockSaved = (id, stock) =>
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, stock } : p)));

  const handlePriceApplied = (id, price) =>
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, price } : p)));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">Mis productos</h1>
          {!loading && products.length > 0 && (
            <p className="text-sm text-gray-500 mt-0.5">{products.length} producto{products.length !== 1 ? 's' : ''}</p>
          )}
        </div>
        <Link
          to="/dashboard/products/new"
          className="flex items-center gap-2 px-4 py-2 bg-accent text-white font-semibold rounded-lg hover:bg-accent-400 transition"
        >
          <Plus className="w-5 h-5" />
          Nuevo producto
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <AlertCircle className="w-10 h-10 text-red-400" />
          <p className="text-gray-600">{error}</p>
          <button onClick={handleRetry} className="btn-outline text-sm">
            Reintentar
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-primary mb-2">Aún no tienes productos</h2>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Agrega tu primer producto para que los compradores puedan encontrarte y empezar a vender.
          </p>
          <Link
            to="/dashboard/products/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white font-semibold rounded-lg hover:bg-accent-400 transition"
          >
            <Plus className="w-5 h-5" />
            Agregar mi primer producto
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {products.map((p) => (
            <ProductRow
              key={p.id}
              product={p}
              onDelete={handleDelete}
              onStockSaved={handleStockSaved}
              onPriceApplied={handlePriceApplied}
            />
          ))}
        </div>
      )}
    </div>
  );
}
