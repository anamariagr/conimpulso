import { useState } from 'react';
import { X, Trash2, Plus, Minus, ShoppingCart, Package, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCartStore, unitPriceFor } from '../../stores/cartStore';
import CartCheckoutModal from './CartCheckoutModal';

const fmt = (n) =>
  parseFloat(n).toLocaleString('es-CO', { maximumFractionDigits: 0 });

export default function CartDrawer({ open, onClose }) {
  const { items, removeItem, updateQty, clearCart, totalPrice } = useCartStore();
  const [showCheckout, setShowCheckout] = useState(false);

  const handleCheckoutSuccess = () => {
    clearCart();
    setShowCheckout(false);
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-gray-900 text-lg">Carrito</h2>
            {items.length > 0 && (
              <span className="bg-accent text-primary text-xs font-bold rounded-full px-2 py-0.5">
                {items.reduce((s, i) => s + i.quantity, 0)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs text-red-400 hover:text-red-600 transition-colors"
              >
                Vaciar
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3">
              <Package className="w-12 h-12 text-gray-200" />
              <p className="text-gray-400 font-medium">Tu carrito está vacío</p>
              <button
                onClick={onClose}
                className="text-sm text-primary hover:underline"
              >
                Seguir comprando
              </button>
            </div>
          ) : (
            items.map((item) => {
              const unitPrice = unitPriceFor(item);
              const isWholesale = item.price_wholesale && unitPrice === item.price_wholesale;
              return (
              <div key={item.product_id} className="flex gap-3 bg-gray-50 rounded-xl p-3">
                {/* Image */}
                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-6 h-6 text-gray-300" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/products/${item.slug}`}
                    onClick={onClose}
                    className="text-sm font-semibold text-gray-900 hover:text-primary line-clamp-2 leading-tight"
                  >
                    {item.name}
                  </Link>
                  {item.shop_name && (
                    <p className="text-xs text-gray-400 mt-0.5">{item.shop_name}</p>
                  )}
                  <p className="text-sm font-bold text-primary mt-1">
                    ${fmt(unitPrice * item.quantity)}
                  </p>
                  {item.quantity > 1 && (
                    <p className="text-xs text-gray-400">${fmt(unitPrice)} c/u</p>
                  )}
                  {isWholesale ? (
                    <p className="text-xs text-green-600 flex items-center gap-1 mt-0.5">
                      <Tag className="w-3 h-3" /> Precio mayoreo aplicado
                    </p>
                  ) : item.price_wholesale && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      Desde {item.minimum_wholesale_quantity} unidades: ${fmt(item.price_wholesale)} c/u
                    </p>
                  )}
                </div>

                {/* Qty + delete */}
                <div className="flex flex-col items-end justify-between gap-2 flex-shrink-0">
                  <button
                    onClick={() => removeItem(item.product_id)}
                    className="p-1 hover:bg-red-50 text-gray-300 hover:text-red-400 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white">
                    <button
                      onClick={() => updateQty(item.product_id, item.quantity - 1)}
                      className="px-2 py-1 hover:bg-gray-100 text-gray-600 transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-2 text-sm font-semibold min-w-[24px] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQty(item.product_id, item.quantity + 1)}
                      className="px-2 py-1 hover:bg-gray-100 text-gray-600 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 px-5 py-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-sm">Total</span>
              <span className="text-xl font-bold text-gray-900">
                ${fmt(totalPrice())}
              </span>
            </div>
            <p className="text-xs text-gray-400 text-center">
              Los precios no incluyen envío.
            </p>
            <button
              onClick={() => setShowCheckout(true)}
              className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors"
            >
              Proceder a compra
            </button>
          </div>
        )}
      </div>

      {showCheckout && (
        <CartCheckoutModal
          items={items}
          totalPrice={totalPrice()}
          onClose={() => setShowCheckout(false)}
          onSuccess={handleCheckoutSuccess}
        />
      )}
    </>
  );
}
