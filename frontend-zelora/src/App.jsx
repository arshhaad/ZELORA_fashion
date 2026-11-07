import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { RecentlyViewedProvider } from './context/RecentlyViewedContext';
import { CustomerProvider } from './context/CustomerContext';
import { SellerProvider } from './context/SellerContext';
import { AdminProvider } from './context/AdminContext';

// Common Components
import ProtectedRoute from './components/common/ProtectedRoute';
import SellerProtectedRoute from './components/seller/SellerProtectedRoute';
import AdminProtectedRoute from './components/admin/AdminProtectedRoute';

// Store & Catalog Pages
import LandingPage from './pages/LandingPage';
import AboutPage from './pages/AboutPage';
import HomePage from './pages/HomePage';
import ProductListingPage from './pages/ProductListingPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import WishlistPage from './pages/WishlistPage';

// Checkout & Orders Pages
import CheckoutPage from './pages/CheckoutPage';
import MyOrdersPage from './pages/MyOrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';

// Customer Account Pages
import ProfilePage from './pages/account/ProfilePage';
import AddressesPage from './pages/account/AddressesPage';
import NotificationsPage from './pages/account/NotificationsPage';

// Customer Authentication
import AuthPage from './pages/AuthPage';

// Seller Authentication Pages
import SellerLoginPage from './pages/seller/SellerLoginPage';
import SellerRegisterPage from './pages/seller/SellerRegisterPage';

// Seller Dashboard & Shop Pages
import SellerDashboardPage from './pages/seller/SellerDashboardPage';
import ShopProfilePage from './pages/seller/ShopProfilePage';
import ShopSettingsPage from './pages/seller/ShopSettingsPage';

// Seller Product & Inventory Pages
import AddProductPage from './pages/seller/AddProductPage';
import MyProductsPage from './pages/seller/MyProductsPage';
import EditProductPage from './pages/seller/EditProductPage';
import CategoriesPage from './pages/seller/CategoriesPage';
import InventoryPage from './pages/seller/InventoryPage';

// Seller Order Management Pages
import SellerOrdersPage from './pages/seller/SellerOrdersPage';
import SellerOrderDetailPage from './pages/seller/SellerOrderDetailPage';

// Seller Marketing & Sales Pages
import CouponsPage from './pages/seller/CouponsPage';
import ReportsPage from './pages/seller/ReportsPage';
import SellerReviewsPage from './pages/seller/SellerReviewsPage';

// Seller Account & Support Pages
import SellerNotificationsPage from './pages/seller/SellerNotificationsPage';
import PayoutsPage from './pages/seller/PayoutsPage';
import SupportPage from './pages/seller/SupportPage';

// Admin Authentication & Console Pages
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminCustomersPage from './pages/admin/AdminCustomersPage';
import AdminSellersPage from './pages/admin/AdminSellersPage';
import AdminRolesPage from './pages/admin/AdminRolesPage';
import AdminShopApprovalsPage from './pages/admin/AdminShopApprovalsPage';
import AdminAllShopsPage from './pages/admin/AdminAllShopsPage';
import AdminAllProductsPage from './pages/admin/AdminAllProductsPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminBrandsPage from './pages/admin/AdminBrandsPage';
import AdminAllOrdersPage from './pages/admin/AdminAllOrdersPage';
import AdminPaymentsPage from './pages/admin/AdminPaymentsPage';
import AdminCommissionsPage from './pages/admin/AdminCommissionsPage';
import AdminPayoutsPage from './pages/admin/AdminPayoutsPage';
import AdminCouponsPage from './pages/admin/AdminCouponsPage';
import AdminBannersPage from './pages/admin/AdminBannersPage';
import AdminNotificationsPage from './pages/admin/AdminNotificationsPage';
import AdminReviewsPage from './pages/admin/AdminReviewsPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';
import AdminSupportTicketsPage from './pages/admin/AdminSupportTicketsPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';

// Styles
import './components/landing/landing.css';
import './components/common/shop.css';
import './App.css';

/**
 * RootRoute:
 * Guests (unauthenticated) see the high-fashion ZELORA Landing Page.
 * Authenticated customers see the full dynamic Shopping Home Page.
 */
function RootRoute() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="app-loader">
        <div className="loader-spinner"></div>
        <p>Loading ZELORA experience...</p>
      </div>
    );
  }
  return user ? <HomePage /> : <LandingPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <RecentlyViewedProvider>
            <CustomerProvider>
              <SellerProvider>
                <AdminProvider>
                  <BrowserRouter>
                  <Routes>
                  {/* 1. Public Visitor Routes (Accessible without login: Landing, Products, About) */}
                  <Route path="/" element={<RootRoute />} />
                  <Route path="/landing" element={<LandingPage />} />
                  <Route path="/products" element={<ProductListingPage />} />
                  <Route path="/about" element={<AboutPage />} />

                  {/* 2. Customer Shopping Home (Protected) */}
                  <Route
                    path="/home"
                    element={
                      <ProtectedRoute>
                        <HomePage />
                      </ProtectedRoute>
                    }
                  />

                  {/* 3. Product Details Page (Protected - requires customer login) */}
                  <Route
                    path="/products/:id"
                    element={
                      <ProtectedRoute>
                        <ProductDetailPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* 4. Shopping Cart Page (Protected - requires customer login) */}
                  <Route
                    path="/cart"
                    element={
                      <ProtectedRoute>
                        <CartPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* 5. Wishlist Page (Protected - requires customer login) */}
                  <Route
                    path="/wishlist"
                    element={
                      <ProtectedRoute>
                        <WishlistPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* 6. Checkout Page (Protected) */}
                  <Route
                    path="/checkout"
                    element={
                      <ProtectedRoute>
                        <CheckoutPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* 7. Orders Pages (Protected) */}
                  <Route
                    path="/orders"
                    element={
                      <ProtectedRoute>
                        <MyOrdersPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/orders/:orderId"
                    element={
                      <ProtectedRoute>
                        <OrderDetailPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* 8. Account Section (Protected) */}
                  <Route
                    path="/account/profile"
                    element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/account/addresses"
                    element={
                      <ProtectedRoute>
                        <AddressesPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/account/notifications"
                    element={
                      <ProtectedRoute>
                        <NotificationsPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* 9. Customer Authentication Routes */}
                  <Route path="/login" element={<AuthPage initialView="login" />} />
                  <Route path="/register" element={<AuthPage initialView="register" />} />
                  <Route path="/verify-email" element={<AuthPage initialView="verify-email" />} />
                  <Route path="/forgot-password" element={<AuthPage initialView="forgot-password" />} />
                  <Route path="/reset-password" element={<AuthPage initialView="reset-password" />} />
                  {/* Customer Portal & Account Aliases */}
                  <Route path="/account" element={<Navigate to="/account/profile" replace />} />
                  <Route path="/customer" element={<Navigate to="/account/profile" replace />} />
                  <Route path="/customer/profile" element={<Navigate to="/account/profile" replace />} />
                  <Route path="/customer/addresses" element={<Navigate to="/account/addresses" replace />} />
                  <Route path="/customer/orders" element={<Navigate to="/orders" replace />} />
                  <Route path="/dashboard" element={<Navigate to="/" replace />} />

                  {/* 10. ZELORA SELLER CENTER ROUTES (Warm Luxury Theme) */}
                  <Route path="/seller" element={<Navigate to="/seller/dashboard" replace />} />
                  <Route path="/seller/login" element={<SellerLoginPage />} />
                  <Route path="/seller/register" element={<SellerRegisterPage />} />

                  {/* Protected Seller Pages */}
                  <Route
                    path="/seller/dashboard"
                    element={
                      <SellerProtectedRoute>
                        <SellerDashboardPage />
                      </SellerProtectedRoute>
                    }
                  />
                  <Route
                    path="/seller/shop/profile"
                    element={
                      <SellerProtectedRoute>
                        <ShopProfilePage />
                      </SellerProtectedRoute>
                    }
                  />
                  <Route
                    path="/seller/shop/settings"
                    element={
                      <SellerProtectedRoute>
                        <ShopSettingsPage />
                      </SellerProtectedRoute>
                    }
                  />
                  <Route
                    path="/seller/products"
                    element={
                      <SellerProtectedRoute>
                        <MyProductsPage />
                      </SellerProtectedRoute>
                    }
                  />
                  <Route
                    path="/seller/products/add"
                    element={
                      <SellerProtectedRoute>
                        <AddProductPage />
                      </SellerProtectedRoute>
                    }
                  />
                  <Route
                    path="/seller/products/:productId/edit"
                    element={
                      <SellerProtectedRoute>
                        <EditProductPage />
                      </SellerProtectedRoute>
                    }
                  />
                  <Route
                    path="/seller/categories"
                    element={
                      <SellerProtectedRoute>
                        <CategoriesPage />
                      </SellerProtectedRoute>
                    }
                  />
                  <Route
                    path="/seller/inventory"
                    element={
                      <SellerProtectedRoute>
                        <InventoryPage />
                      </SellerProtectedRoute>
                    }
                  />
                  <Route
                    path="/seller/orders"
                    element={
                      <SellerProtectedRoute>
                        <SellerOrdersPage />
                      </SellerProtectedRoute>
                    }
                  />
                  <Route
                    path="/seller/orders/:orderId"
                    element={
                      <SellerProtectedRoute>
                        <SellerOrderDetailPage />
                      </SellerProtectedRoute>
                    }
                  />
                  <Route
                    path="/seller/coupons"
                    element={
                      <SellerProtectedRoute>
                        <CouponsPage />
                      </SellerProtectedRoute>
                    }
                  />
                  <Route
                    path="/seller/reports"
                    element={
                      <SellerProtectedRoute>
                        <ReportsPage />
                      </SellerProtectedRoute>
                    }
                  />
                  <Route
                    path="/seller/reviews"
                    element={
                      <SellerProtectedRoute>
                        <SellerReviewsPage />
                      </SellerProtectedRoute>
                    }
                  />
                  <Route
                    path="/seller/notifications"
                    element={
                      <SellerProtectedRoute>
                        <SellerNotificationsPage />
                      </SellerProtectedRoute>
                    }
                  />
                  <Route
                    path="/seller/payouts"
                    element={
                      <SellerProtectedRoute>
                        <PayoutsPage />
                      </SellerProtectedRoute>
                    }
                  />
                  <Route
                    path="/seller/support"
                    element={
                      <SellerProtectedRoute>
                        <SupportPage />
                      </SellerProtectedRoute>
                    }
                  />

                  {/* 11. ZELORA EXECUTIVE ADMIN CONSOLE ROUTES (/admin) */}
                  <Route path="/admin/login" element={<AdminLoginPage />} />
                  <Route
                    path="/admin"
                    element={
                      <AdminProtectedRoute>
                        <AdminDashboardPage />
                      </AdminProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/dashboard"
                    element={
                      <AdminProtectedRoute>
                        <AdminDashboardPage />
                      </AdminProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/users/customers"
                    element={
                      <AdminProtectedRoute>
                        <AdminCustomersPage />
                      </AdminProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/users/sellers"
                    element={
                      <AdminProtectedRoute>
                        <AdminSellersPage />
                      </AdminProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/users/admins"
                    element={
                      <AdminProtectedRoute>
                        <AdminRolesPage />
                      </AdminProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/shops/approvals"
                    element={
                      <AdminProtectedRoute>
                        <AdminShopApprovalsPage />
                      </AdminProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/shops"
                    element={
                      <AdminProtectedRoute>
                        <AdminAllShopsPage />
                      </AdminProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/products"
                    element={
                      <AdminProtectedRoute>
                        <AdminAllProductsPage />
                      </AdminProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/categories"
                    element={
                      <AdminProtectedRoute>
                        <AdminCategoriesPage />
                      </AdminProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/brands"
                    element={
                      <AdminProtectedRoute>
                        <AdminBrandsPage />
                      </AdminProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/orders"
                    element={
                      <AdminProtectedRoute>
                        <AdminAllOrdersPage />
                      </AdminProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/payments"
                    element={
                      <AdminProtectedRoute>
                        <AdminPaymentsPage />
                      </AdminProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/commissions"
                    element={
                      <AdminProtectedRoute>
                        <AdminCommissionsPage />
                      </AdminProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/payouts"
                    element={
                      <AdminProtectedRoute>
                        <AdminPayoutsPage />
                      </AdminProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/coupons"
                    element={
                      <AdminProtectedRoute>
                        <AdminCouponsPage />
                      </AdminProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/banners"
                    element={
                      <AdminProtectedRoute>
                        <AdminBannersPage />
                      </AdminProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/notifications"
                    element={
                      <AdminProtectedRoute>
                        <AdminNotificationsPage />
                      </AdminProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/reviews"
                    element={
                      <AdminProtectedRoute>
                        <AdminReviewsPage />
                      </AdminProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/reports"
                    element={
                      <AdminProtectedRoute>
                        <AdminReportsPage />
                      </AdminProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/support"
                    element={
                      <AdminProtectedRoute>
                        <AdminSupportTicketsPage />
                      </AdminProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/settings"
                    element={
                      <AdminProtectedRoute>
                        <AdminSettingsPage />
                      </AdminProtectedRoute>
                    }
                  />

                  {/* Fallback route */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </BrowserRouter>
              </AdminProvider>
              </SellerProvider>
            </CustomerProvider>
          </RecentlyViewedProvider>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}
