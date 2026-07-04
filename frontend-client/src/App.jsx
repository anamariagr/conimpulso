import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './stores/authStore';

import Layout from './components/layout/Layout';
import DashboardLayout from './components/layout/DashboardLayout';
import AdminLayout from './components/layout/AdminLayout';
import HomePage from './pages/public/HomePage';
import StoreProfilePage from './pages/public/StoreProfilePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import OnboardingPage from './pages/auth/OnboardingPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import ProductsPage from './pages/public/ProductsPage';
import ServicesPage from './pages/public/ServicesPage';
import StoresPage from './pages/public/StoresPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ProductsListPage from './pages/dashboard/ProductsListPage';
import OrdersListPage from './pages/dashboard/OrdersListPage';
import AnalyticsPage from './pages/dashboard/AnalyticsPage';
import StorePage from './pages/dashboard/StorePage';
import B2BProfilesPage from './pages/b2b/B2BProfilesPage';
import LeadsPage from './pages/leads/LeadsPage';
import MessagesPage from './pages/messages/MessagesPage';
import AdvisorDashboardPage from './pages/advisors/AdvisorDashboardPage';
import AdvisorLeadsPage from './pages/advisors/AdvisorLeadsPage';
import AdvisorCommissionsPage from './pages/advisors/AdvisorCommissionsPage';
import LogisticsDashboardPage from './pages/logistics/LogisticsDashboardPage';
import ShipmentTrackingPage from './pages/logistics/ShipmentTrackingPage';
import ShippingQuotePage from './pages/logistics/ShippingQuotePage';
import WalletPage from './pages/wallet/WalletPage';
import CampaignListPage from './pages/advertising/CampaignListPage';
import CampaignFormPage from './pages/advertising/CampaignFormPage';
import AdListPage from './pages/advertising/AdListPage';
import AIInsightsPage from './pages/ai/AIInsightsPage';
import APIDocumentationPage from './pages/api/APIDocumentationPage';
import UserSettingsPage from './pages/settings/UserSettingsPage';
import VendorDashboardPage from './pages/vendor/VendorDashboardPage';
import NewProductGatePage from './pages/dashboard/NewProductGatePage';
import CreateShopPage from './pages/dashboard/CreateShopPage';
import CreateProductPage from './pages/dashboard/CreateProductPage';
import EditProductPage from './pages/dashboard/EditProductPage';
import QuoteRequestsPage from './pages/dashboard/QuoteRequestsPage';

import BlogPage from './pages/public/BlogPage';
import BlogPostPage from './pages/public/BlogPostPage';
import ProductDetailPage from './pages/public/ProductDetailPage';
import PrivacyPage from './pages/public/PrivacyPage';
import TermsPage from './pages/public/TermsPage';

// Admin pages
import MessagesView from './pages/admin/MessagesView';
import PurchaseRequestsView from './pages/admin/PurchaseRequestsView';
import HomepageEditorPage from './pages/admin/HomepageEditorPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import UsersView from './pages/admin/UsersView';
import ShopsView from './pages/admin/ShopsView';
import ProductsView from './pages/admin/ProductsView';
import CategoriesView from './pages/admin/CategoriesView';
import SettingsView from './pages/admin/SettingsView';
import WalletView from './pages/admin/WalletView';
import BlogView from './pages/admin/BlogView';
import LogisticsBannerView from './pages/admin/LogisticsBannerView';
import MediaLibraryPage from './pages/admin/MediaLibraryPage';

import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }) {
  const { isAuthenticated, isSuperAdmin } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (!isSuperAdmin()) return <Navigate to="/dashboard" />;
  return children;
}

function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  // Refresh the authenticated user (roles, status, etc.) on app load so the
  // cached localStorage user never goes stale after a role change.
  useEffect(() => {
    if (localStorage.getItem('auth_token')) {
      checkAuth();
    }
  }, [checkAuth]);

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || "442205534139-asui66fntjnan2ali4khsf9n7bc2r4er.apps.googleusercontent.com"}>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="stores/:slug" element={<StoreProfilePage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="products/:slug" element={<ProductDetailPage />} />
            <Route path="services" element={<ServicesPage />} />
            <Route path="stores" element={<StoresPage />} />
            <Route path="blog" element={<BlogPage />} />
            <Route path="blog/:slug" element={<BlogPostPage />} />
            <Route path="privacidad" element={<PrivacyPage />} />
            <Route path="terminos" element={<TermsPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
            <Route path="reset-password/:token" element={<ResetPasswordPage />} />
            <Route
              path="onboarding"
              element={
                <ProtectedRoute>
                  <OnboardingPage />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Dashboard Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="products" element={<ProductsListPage />} />
            <Route path="products/new" element={<NewProductGatePage />} />
            <Route path="products/create" element={<CreateProductPage />} />
            <Route path="products/:id/edit" element={<EditProductPage />} />

            <Route path="orders" element={<OrdersListPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="store" element={<StorePage />} />
            <Route path="store/new" element={<CreateShopPage />} />
            <Route path="store/edit" element={<CreateShopPage />} />
            <Route path="b2b" element={<B2BProfilesPage />} />
            <Route path="leads" element={<LeadsPage />} />
            <Route path="messages" element={<MessagesPage />} />
            <Route path="quotes" element={<QuoteRequestsPage />} />
            <Route path="advisors" element={<AdvisorDashboardPage />} />
            <Route path="advisors/leads" element={<AdvisorLeadsPage />} />
            <Route path="advisors/commissions" element={<AdvisorCommissionsPage />} />
            <Route path="logistics" element={<LogisticsDashboardPage />} />
            <Route path="logistics/track/:trackingNumber" element={<ShipmentTrackingPage />} />
            <Route path="logistics/quote" element={<ShippingQuotePage />} />
            <Route path="wallet" element={<WalletPage />} />
            <Route path="settings" element={<UserSettingsPage />} />
            <Route path="vendor" element={<VendorDashboardPage />} />
          </Route>

          {/* Other Protected Routes */}
          <Route
            path="/advertising/campaigns"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<CampaignListPage />} />
          </Route>
          <Route
            path="/advertising/campaigns/new"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<CampaignFormPage />} />
          </Route>
          <Route
            path="/advertising/campaigns/:id"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<CampaignFormPage />} />
          </Route>
          <Route
            path="/advertising/ads"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdListPage />} />
          </Route>
          <Route
            path="/ai"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AIInsightsPage />} />
          </Route>
          <Route
            path="/api-docs"
            element={<APIDocumentationPage />}
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<AdminDashboardPage />} />
            <Route path="homepage-editor" element={<HomepageEditorPage />} />
            <Route path="users" element={<UsersView />} />
            <Route path="shops" element={<ShopsView />} />
            <Route path="products" element={<ProductsView />} />
            <Route path="categories" element={<CategoriesView />} />
            <Route path="settings" element={<SettingsView />} />
            <Route path="wallet" element={<WalletView />} />
            <Route path="blog" element={<BlogView />} />
            <Route path="logistics-banner" element={<LogisticsBannerView />} />
            <Route path="media" element={<MediaLibraryPage />} />
            <Route path="messages" element={<MessagesView />} />
            <Route path="purchase-requests" element={<PurchaseRequestsView />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#0A0A0A',
            color: '#FAFAFA',
          },
        }}
      />
    </QueryClientProvider>
    </GoogleOAuthProvider>
  );
}

export default App;