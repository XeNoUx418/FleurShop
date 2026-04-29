import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Auth pages (no layout/sidebar)
import Login    from './pages/Login';
import Register from './pages/Register';

// Protected pages (wrapped in Layout)
import Layout        from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Shop          from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart          from './pages/Cart';
import Checkout      from './pages/Checkout';
import { OrderList, OrderDetail } from './pages/Orders';
import Profile       from './pages/Profile';

import AdminDashboard   from './pages/admin/AdminDashboard';
import AdminProducts    from './pages/admin/AdminProducts';
import AdminCategories  from './pages/admin/AdminCategories';
import AdminOrders      from './pages/admin/AdminOrders';
import AdminCoupons     from './pages/admin/AdminCoupons';
import AdminGiftCards   from './pages/admin/AdminGiftCards';
import AdminRoute     from './components/AdminRoute';

/**
 * Helper: wraps a page in both ProtectedRoute and Layout.
 * ProductDetail has its own Layout call (drawer renders on top of shop),
 * so it gets the ProtectedRoute only.
 */
function Protected({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public ── */}
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ── Protected + Layout ── */}
        <Route path="/shop"     element={<Protected><Shop /></Protected>} />
        <Route path="/cart"     element={<Protected><Cart /></Protected>} />
        <Route path="/checkout" element={<Protected><Checkout /></Protected>} />
        <Route path="/orders"   element={<Protected><OrderList /></Protected>} />
        <Route path="/orders/:id" element={<Protected><OrderDetail /></Protected>} />
        <Route path="/profile"  element={<Protected><Profile /></Protected>} />

        {/* Admin */}
        <Route path="/admin"             element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/products"    element={<AdminRoute><AdminProducts /></AdminRoute>} />
        <Route path="/admin/categories"  element={<AdminRoute><AdminCategories /></AdminRoute>} />
        <Route path="/admin/orders"      element={<AdminRoute><AdminOrders /></AdminRoute>} />
        <Route path="/admin/coupons"     element={<AdminRoute><AdminCoupons /></AdminRoute>} />
        <Route path="/admin/giftcards"   element={<AdminRoute><AdminGiftCards /></AdminRoute>} />

        {/*
          ProductDetail renders as a slide-over drawer on top of the shop page.
          It has Layout inside itself so the sidebar stays visible behind the drawer.
        */}
        <Route
          path="/shop/:id"
          element={
            <ProtectedRoute>
              <ProductDetail />
            </ProtectedRoute>
          }
        />

        {/* ── Fallback ── */}
        <Route path="*" element={<Navigate to="/shop" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
