import { useState, useEffect, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { Boxes, Loader2, AlertCircle, ChevronDown, ChevronUp, Package } from 'lucide-react';
import { inventoryService } from '../../services/api';
import { useSiteStore } from '../../stores/siteStore';
import { CostPanel } from './ProductsListPage';

const fmt = (value) => `$${Number(value || 0).toLocaleString('es-CO')}`;

const fmtMinutes = (min) => {
  if (!min) return '—';
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h ? `${h} h${m ? ` ${m} min` : ''}` : `${m} min`;
};

function Stat({ label, value }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-lg font-bold text-primary mt-0.5">{value}</p>
    </div>
  );
}

export default function InventoryPage() {
  const inventoryModuleEnabled = useSiteStore((s) => s.inventoryModuleEnabled);
  const loadedSettings = useSiteStore((s) => s.loaded);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openId, setOpenId] = useState(null);

  const load = () => {
    return inventoryService.overview()
      .then((res) => { setData(res.data.data); setError(''); })
      .catch(() => setError('No se pudo cargar el inventario.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (inventoryModuleEnabled) load();
  }, [inventoryModuleEnabled]);

  if (loadedSettings && !inventoryModuleEnabled) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <Boxes className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <h2 className="text-lg font-semibold text-primary">Módulo no disponible</h2>
        <p className="text-gray-500 text-sm mt-1">El módulo de inventario no está activo. Un administrador puede activarlo.</p>
      </div>
    );
  }

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center py-16 gap-3 text-center">
        <AlertCircle className="w-10 h-10 text-red-400" />
        <p className="text-gray-600">{error}</p>
        <button onClick={load} className="btn-outline text-sm">Reintentar</button>
      </div>
    );
  }

  const products = data?.products || [];
  const totals = data?.totals;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary">Inventario</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Cantidades, costos de material y tiempos de cada producto, con su ganancia.
        </p>
      </div>

      {totals && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Stat label="Unidades en stock" value={totals.units} />
          <Stat label="Costo del inventario" value={fmt(totals.stock_cost_value)} />
          <Stat label="Valor de venta" value={fmt(totals.stock_retail_value)} />
          <Stat label="Ganancia potencial" value={fmt(totals.stock_potential_profit)} />
        </div>
      )}

      {products.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">Aún no tienes productos en tu inventario.</p>
          <Link to="/dashboard/products/new" className="text-accent font-semibold">Agregar un producto</Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 border-b border-gray-200">
                <th className="p-3 font-medium">Producto</th>
                <th className="p-3 font-medium">Disponible</th>
                <th className="p-3 font-medium">Material</th>
                <th className="p-3 font-medium">Elaboración</th>
                <th className="p-3 font-medium">Ensamblaje</th>
                <th className="p-3 font-medium">Costo total</th>
                <th className="p-3 font-medium">Precio venta</th>
                <th className="p-3 font-medium">Ganancia</th>
                <th className="p-3 font-medium">Margen</th>
                <th className="p-3 font-medium">Ganancia/hora</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <Fragment key={p.id}>
                  <tr className="border-b border-gray-100">
                    <td className="p-3">
                      <div className="flex items-center gap-2 min-w-[180px]">
                        <div className="w-9 h-9 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                          {p.image && <img src={p.image} alt="" className="w-full h-full object-cover" />}
                        </div>
                        <span className="font-medium text-gray-800">{p.name}</span>
                      </div>
                    </td>
                    <td className="p-3 text-gray-700">{p.stock}</td>
                    <td className="p-3 text-gray-700">{fmt(p.materials_cost)}</td>
                    <td className="p-3 text-gray-700">{fmtMinutes(p.elaboration_minutes)}</td>
                    <td className="p-3 text-gray-700">{fmtMinutes(p.assembly_minutes)}</td>
                    <td className="p-3 text-gray-700">{fmt(p.total_cost)}</td>
                    <td className="p-3 text-gray-700">{fmt(p.price)}</td>
                    <td className={`p-3 font-semibold ${p.unit_profit < 0 ? 'text-red-600' : 'text-green-600'}`}>{fmt(p.unit_profit)}</td>
                    <td className="p-3 text-gray-700">{p.margin_pct === null ? '—' : `${p.margin_pct}%`}</td>
                    <td className="p-3 text-gray-700">{p.profit_per_hour === null ? '—' : fmt(p.profit_per_hour)}</td>
                    <td className="p-3">
                      <button
                        onClick={() => setOpenId(openId === p.id ? null : p.id)}
                        className="p-2 text-gray-400 hover:text-accent hover:bg-accent/10 rounded-lg transition-colors"
                        title="Editar costos y tiempos"
                      >
                        {openId === p.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>
                  {openId === p.id && (
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <td colSpan={11} className="p-3">
                        <CostPanel product={{ id: p.id, price: p.price, profit_margin: p.profit_margin }} onPriceApplied={load} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
