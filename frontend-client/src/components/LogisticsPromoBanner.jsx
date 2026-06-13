import { X, Truck } from 'lucide-react';
import { useState } from 'react';

const DEFAULT_BANNER = {
  active: true,
  title: '¿Buscas una empresa de envíos confiable?',
  body: 'Inter Bochica ofrece soluciones de logística para tu negocio al mejor precio. Entregamos a tiempo y con cuidado.',
  address: 'Calle 1F 35B-35',
  phone: '',
  cta: 'Conocer más',
  ctaUrl: '',
  bgColor: '#FFD700',
  textColor: '#0A0A0A',
};

function getBannerConfig() {
  try {
    const stored = localStorage.getItem('inter_bochica_banner');
    return stored ? { ...DEFAULT_BANNER, ...JSON.parse(stored) } : DEFAULT_BANNER;
  } catch {
    return DEFAULT_BANNER;
  }
}

export default function LogisticsPromoBanner() {
  const shipping = localStorage.getItem('vendor_shipping');
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;
  if (!shipping || shipping === 'inter_bochica') return null;

  const banner = getBannerConfig();
  if (!banner.active) return null;

  return (
    <div
      className="relative rounded-xl p-5 mb-6 flex items-start gap-4 shadow-md"
      style={{ backgroundColor: banner.bgColor, color: banner.textColor }}
    >
      <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center bg-black/10">
        <Truck className="w-6 h-6" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-bold text-lg leading-tight">{banner.title}</p>
        <p className="text-sm mt-1 opacity-80">{banner.body}</p>
        {banner.address && (
          <p className="text-xs mt-1 font-semibold opacity-70">📍 {banner.address}</p>
        )}
        {banner.phone && (
          <p className="text-xs opacity-70">📞 {banner.phone}</p>
        )}
        {banner.cta && (
          <a
            href={banner.ctaUrl || '#'}
            target={banner.ctaUrl ? '_blank' : undefined}
            rel="noopener noreferrer"
            className="inline-block mt-3 px-4 py-1.5 rounded-lg text-sm font-semibold bg-black/15 hover:bg-black/25 transition-colors"
          >
            {banner.cta}
          </a>
        )}
      </div>

      <button
        onClick={() => setDismissed(true)}
        className="flex-shrink-0 p-1 rounded-lg hover:bg-black/10 transition-colors"
        title="Cerrar"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}
