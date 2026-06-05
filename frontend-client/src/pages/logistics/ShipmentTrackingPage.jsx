import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Truck, CheckCircle, Clock, MapPin, Package } from 'lucide-react';
import { logisticsService } from '../../services/api';

export default function ShipmentTrackingPage() {
  const { trackingNumber } = useParams();
  const [shipment, setShipment] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useState(() => {
    if (trackingNumber) {
      fetchTracking();
    }
  }, [trackingNumber]);

  const fetchTracking = async () => {
    try {
      setLoading(true);
      const response = await logisticsService.trackShipment(trackingNumber);
      setShipment(response.data.data?.shipment);
      setEvents(response.data.data?.events || []);
    } catch (err) {
      setError('No se pudo cargar la información del envío');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in_transit':
        return <Truck className="w-5 h-5 text-blue-500" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#FFD700] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pt-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#FFD700]">Rastreo de Envío</h1>
          <p className="text-gray-400 mt-1">Tracking: {trackingNumber}</p>
        </div>

        <div className="bg-[#1A1A1A] rounded-xl p-6 border border-gray-800 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Estado</p>
              <p className="text-2xl font-bold text-white capitalize">{shipment?.status?.replace('_', ' ')}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-sm">Compañía</p>
              <p className="text-xl font-semibold text-white">{shipment?.carrier}</p>
            </div>
          </div>
        </div>

        <div className="bg-[#1A1A1A] rounded-xl p-6 border border-gray-800">
          <h2 className="text-xl font-semibold text-white mb-6">Historial de Eventos</h2>
          {events.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No hay eventos de seguimiento disponibles</p>
          ) : (
            <div className="space-y-4">
              {events.map((event, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 bg-[#0A0A0A] rounded-full flex items-center justify-center">
                      {getStatusIcon(event.status)}
                    </div>
                    {index < events.length - 1 && <div className="w-0.5 h-full bg-gray-700 mt-2"></div>}
                  </div>
                  <div className="flex-1 pb-6">
                    <p className="text-white font-medium">{event.description}</p>
                    <p className="text-gray-500 text-sm">{event.location}</p>
                    <p className="text-gray-600 text-xs mt-1">{event.timestamp}</p>
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