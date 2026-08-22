import { useAuthStore } from '../../stores/authStore';
import OrdersPage from './OrdersPage';
import VendorOrdersPage from './VendorOrdersPage';

export default function OrdersListPage() {
  const { isClientView } = useAuthStore();

  // Buyers see their own purchase history; vendors/advisors see orders placed on their products.
  return isClientView() ? <OrdersPage /> : <VendorOrdersPage />;
}
