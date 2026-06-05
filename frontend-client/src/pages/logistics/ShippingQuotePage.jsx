import { useState } from 'react';
import { Package, MapPin, Scale, Truck, Clock } from 'lucide-react';

export default function ShippingQuotePage() {
  const [formData, setFormData] = useState({
    origin_city: '',
    origin_region: '',
    destination_city: '',
    destination_region: '',
    weight: '',
    dimensions: '',
    package_type: 'box',
    insurance: false,
    express: false,
  });

  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulated quote calculation
    setTimeout(() => {
      const baseWeight = parseFloat(formData.weight) || 1;
      const weightCost = baseWeight * 2.50;
      const insuranceCost = formData.insurance ? 15.00 : 0;
      const expressCost = formData.express ? 25.00 : 0;
      const total = weightCost + insuranceCost + expressCost + 10;

      setQuote({
        base_price: weightCost + 10,
        insurance: insuranceCost,
        express: expressCost,
        total,
        estimated_days: formData.express ? '1-2' : '3-5',
        carrier: 'NexusLogistics',
      });
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pt-20 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#FFD700]">Cotizador de Envíos</h1>
          <p className="text-gray-400 mt-1">Calcula el costo de tu envío</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#1A1A1A] rounded-xl p-6 border border-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-gray-400 text-sm mb-2">Ciudad de Origen</label>
              <input
                type="text"
                value={formData.origin_city}
                onChange={(e) => setFormData({ ...formData, origin_city: e.target.value })}
                className="w-full bg-[#0A0A0A] border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-[#FFD700] focus:outline-none"
                placeholder="Ciudad de origen"
                required
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-2">Región de Origen</label>
              <input
                type="text"
                value={formData.origin_region}
                onChange={(e) => setFormData({ ...formData, origin_region: e.target.value })}
                className="w-full bg-[#0A0A0A] border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-[#FFD700] focus:outline-none"
                placeholder="Región/Estado"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-2">Ciudad de Destino</label>
              <input
                type="text"
                value={formData.destination_city}
                onChange={(e) => setFormData({ ...formData, destination_city: e.target.value })}
                className="w-full bg-[#0A0A0A] border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-[#FFD700] focus:outline-none"
                placeholder="Ciudad de destino"
                required
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-2">Región de Destino</label>
              <input
                type="text"
                value={formData.destination_region}
                onChange={(e) => setFormData({ ...formData, destination_region: e.target.value })}
                className="w-full bg-[#0A0A0A] border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-[#FFD700] focus:outline-none"
                placeholder="Región/Estado"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-2">Peso (kg)</label>
              <input
                type="number"
                step="0.1"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                className="w-full bg-[#0A0A0A] border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-[#FFD700] focus:outline-none"
                placeholder="0.0"
                required
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-2">Dimensiones (L x W x H cm)</label>
              <input
                type="text"
                value={formData.dimensions}
                onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                className="w-full bg-[#0A0A0A] border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-[#FFD700] focus:outline-none"
                placeholder="30x20x15"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-gray-400 text-sm mb-2">Tipo de Paquete</label>
            <select
              value={formData.package_type}
              onChange={(e) => setFormData({ ...formData, package_type: e.target.value })}
              className="w-full bg-[#0A0A0A] border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-[#FFD700] focus:outline-none"
            >
              <option value="box">Caja/Cartón</option>
              <option value="envelope">Sobre/Documento</option>
              <option value="pallet">Pallet</option>
              <option value="fragile">Frágil</option>
            </select>
          </div>

          <div className="flex flex-wrap gap-6 mb-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.insurance}
                onChange={(e) => setFormData({ ...formData, insurance: e.target.checked })}
                className="w-5 h-5 rounded border-gray-700 bg-[#0A0A0A] text-[#FFD700] focus:ring-[#FFD700]"
              />
              <span className="text-gray-300">Seguro de envío (+$15.00)</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.express}
                onChange={(e) => setFormData({ ...formData, express: e.target.checked })}
                className="w-5 h-5 rounded border-gray-700 bg-[#0A0A0A] text-[#FFD700] focus:ring-[#FFD700]"
              />
              <span className="text-gray-300">Envío exprés (+$25.00)</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#FFD700] text-black font-bold rounded-lg hover:bg-yellow-400 transition disabled:opacity-50"
          >
            {loading ? 'Calculando...' : 'Calcular Cotización'}
          </button>
        </form>

        {quote && (
          <div className="mt-6 bg-[#1A1A1A] rounded-xl p-6 border border-gray-800">
            <h2 className="text-xl font-semibold text-[#FFD700] mb-4">Tu Cotización</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-gray-300">
                <span>Costo base</span>
                <span>${quote.base_price.toFixed(2)}</span>
              </div>
              {quote.insurance > 0 && (
                <div className="flex justify-between text-gray-300">
                  <span>Seguro</span>
                  <span>${quote.insurance.toFixed(2)}</span>
                </div>
              )}
              {quote.express > 0 && (
                <div className="flex justify-between text-gray-300">
                  <span>Envío exprés</span>
                  <span>${quote.express.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t border-gray-700 pt-3 flex justify-between text-xl font-bold">
                <span>Total</span>
                <span className="text-[#FFD700]">${quote.total.toFixed(2)}</span>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-gray-400">
              <Clock className="w-5 h-5" />
              <span>Entrega estimada: {quote.estimated_days} días</span>
            </div>
            <button className="w-full mt-4 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-500 transition">
              Contratar Envío
            </button>
          </div>
        )}
      </div>
    </div>
  );
}