import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import GoogleAnalytics from './components/GoogleAnalytics';
import PageTracker from './components/PageTracker';
import { CartProvider } from './context/CartContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { CookieConsentProvider } from './context/CookieConsentContext';
import Layout from './components/Layout';
import WhatsAppButton from './components/WhatsAppButton';
import CookieConsent from './components/CookieConsent';
import ScrollControls from './components/ScrollControls';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Favorites from './pages/Favorites';
import Category from './pages/Category';
import Search from './pages/Search';
import CustomerLogin from './pages/CustomerLogin';
import CustomerRegister from './pages/CustomerRegister';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import OrderSuccess from './pages/OrderSuccess';
import TrackOrder from './pages/TrackOrder';
import CustomerProfile from './pages/CustomerProfile';
import MyOrders from './pages/MyOrders';
import Vouchers from './pages/Vouchers';
import Wallet from './pages/Wallet';
import RequestReturn from './pages/RequestReturn';
import ReturnDetails from './pages/ReturnDetails';
import StaticPage from './pages/StaticPage';
import ContactUs from './pages/ContactUs';
import NotFound from './pages/NotFound';
import { AuthProvider } from './context/AuthContext';
import { CurrencyProvider } from './context/CurrencyContext';
import './index.css';

const Checkout = lazy(() => import('./pages/Checkout'));
const Login = lazy(() => import('./pages/admin/Login'));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const UpdatePassword = lazy(() => import('./pages/admin/UpdatePassword'));
const ProductList = lazy(() => import('./pages/admin/ProductList'));
const ProductForm = lazy(() => import('./pages/admin/ProductForm'));
const Categories = lazy(() => import('./pages/admin/Categories'));
const Coupons = lazy(() => import('./pages/admin/Coupons'));
const AdminReturns = lazy(() => import('./pages/admin/AdminReturns'));
const Orders = lazy(() => import('./pages/admin/Orders'));
const Waitlist = lazy(() => import('./pages/admin/Waitlist'));
const AdminCarts = lazy(() => import('./pages/admin/AdminCarts'));
const OrderDetails = lazy(() => import('./pages/admin/OrderDetails'));
const AdminPages = lazy(() => import('./pages/admin/AdminPages'));
const SuperAdminLayout = lazy(() => import('./pages/super-admin/SuperAdminLayout'));
const SuperDashboard = lazy(() => import('./pages/super-admin/SuperDashboard'));
const ManageStaff = lazy(() => import('./pages/super-admin/ManageStaff'));
const GlobalSettings = lazy(() => import('./pages/super-admin/GlobalSettings'));
const SuperCustomers = lazy(() => import('./pages/super-admin/SuperCustomers'));
const SuperPayments = lazy(() => import('./pages/super-admin/SuperPayments'));
const SuperShipping = lazy(() => import('./pages/super-admin/SuperShipping'));
const SuperWebsite = lazy(() => import('./pages/super-admin/SuperWebsite'));
const SuperReviews = lazy(() => import('./pages/super-admin/SuperReviews'));
const SuperSupport = lazy(() => import('./pages/super-admin/SuperSupport'));
const SuperReports = lazy(() => import('./pages/super-admin/SuperReports'));
const SuperNotifications = lazy(() => import('./pages/super-admin/SuperNotifications'));
const SuperActivity = lazy(() => import('./pages/super-admin/SuperActivity'));

function App() {
  return (
    <>
      <CookieConsentProvider>
      <GoogleAnalytics />
      <Analytics
        beforeSend={(event) => {
          try {
            if (localStorage.getItem('klarelle_cookie_consent') !== 'accepted') return null;
          } catch {
            return null;
          }
          const url = event.url || '';
          if (url.includes('/admin') || url.includes('/super-admin') || url.includes('/update-password')) {
            return null;
          }
          return event;
        }}
      />
      <CurrencyProvider>
        <AuthProvider>
          <FavoritesProvider>
            <CartProvider>
              <Router>
                <ScrollToTop />
                <PageTracker />
              <Suspense fallback={<div style={{ minHeight: '40vh' }} />}>
              <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="product/:id" element={<ProductDetails />} />
              <Route path="category/:id" element={<Category />} />
              <Route path="search" element={<Search />} />
              <Route path="cart" element={<Cart />} />
              <Route path="favorites" element={<Favorites />} />
              <Route path="login" element={<CustomerLogin />} />
              <Route path="register" element={<CustomerRegister />} />
              <Route path="forgot-password" element={<ForgotPassword />} />
              <Route path="reset-password" element={<ResetPassword />} />
              <Route path="checkout" element={<Checkout />} />
              <Route path="order-success" element={<OrderSuccess />} />
              <Route path="track-order" element={<TrackOrder />} />
              <Route path="profile" element={<CustomerProfile />} />
              <Route path="profile/orders" element={<MyOrders />} />
              <Route path="profile/returns/request/:id" element={<RequestReturn />} />
              <Route path="profile/returns/:id" element={<ReturnDetails />} />
              <Route path="profile/vouchers" element={<Vouchers />} />
              <Route path="profile/wallet" element={<Wallet />} />
              <Route path="check-in" element={<Navigate to="/profile" replace />} />
              <Route path="find-my-size" element={<Navigate to="/" replace />} />
              <Route path="page/about-us" element={<StaticPage slug="about-us" />} />
              <Route path="page/faq" element={<StaticPage slug="faq" />} />
              <Route path="page/influencer-collaboration" element={<StaticPage slug="influencer-collaboration" />} />
              <Route path="page/social-responsibility" element={<StaticPage slug="social-responsibility" />} />
              <Route path="page/shipping-info" element={<StaticPage slug="shipping-info" />} />
              <Route path="page/returns" element={<StaticPage slug="returns" />} />
              <Route path="page/how-to-order" element={<StaticPage slug="how-to-order" />} />
              <Route path="page/contact-us" element={<ContactUs />} />
              <Route path="page/payment-method" element={<StaticPage slug="payment-method" />} />
              <Route path="page/rewards" element={<StaticPage slug="rewards" />} />
              <Route path="page/privacy-policy" element={<StaticPage slug="privacy-policy" />} />
              <Route path="page/terms-and-conditions" element={<StaticPage slug="terms-and-conditions" />} />
              <Route path="privacy" element={<StaticPage slug="privacy-policy" />} />
              <Route path="terms" element={<StaticPage slug="terms-and-conditions" />} />
              <Route path="*" element={<NotFound />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin/login" element={<Login />} />
            <Route path="/update-password" element={<UpdatePassword />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="products" element={<ProductList />} />
              <Route path="products/new" element={<ProductForm />} />
              <Route path="products/edit/:id" element={<ProductForm />} />
              <Route path="categories" element={<Categories />} />
              <Route path="coupons" element={<Coupons />} />
              <Route path="orders" element={<Orders />} />
              <Route path="orders/:id" element={<OrderDetails />} />
              <Route path="returns" element={<AdminReturns />} />
              <Route path="customers" element={<SuperCustomers />} />
              <Route path="payments" element={<SuperPayments />} />
              <Route path="shipping" element={<SuperShipping />} />
              <Route path="waitlist" element={<Waitlist />} />
              <Route path="carts" element={<AdminCarts />} />
              <Route path="reviews" element={<SuperReviews />} />
              <Route path="support" element={<SuperSupport />} />
              <Route path="reports" element={<SuperReports />} />
              <Route path="notifications" element={<SuperNotifications />} />
              <Route path="pages" element={<AdminPages />} />
            </Route>

            {/* Super Admin Routes */}
            <Route path="/super-admin" element={<SuperAdminLayout />}>
              <Route index element={<SuperDashboard />} />
              <Route path="orders" element={<Orders />} />
              <Route path="orders/:id" element={<OrderDetails />} />
              <Route path="returns" element={<AdminReturns />} />
              <Route path="customers" element={<SuperCustomers />} />
              <Route path="payments" element={<SuperPayments />} />
              <Route path="shipping" element={<SuperShipping />} />
              <Route path="discounts" element={<Coupons />} />
              <Route path="waitlist" element={<Waitlist />} />
              <Route path="website" element={<SuperWebsite />} />
              <Route path="pages" element={<AdminPages />} />
              <Route path="reviews" element={<SuperReviews />} />
              <Route path="support" element={<SuperSupport />} />
              <Route path="reports" element={<SuperReports />} />
              <Route path="notifications" element={<SuperNotifications />} />
              <Route path="activity" element={<SuperActivity />} />
              <Route path="staff" element={<ManageStaff />} />
              <Route path="settings" element={<GlobalSettings />} />
            </Route>
          </Routes>
              </Suspense>
          <WhatsAppButton />
          <ScrollControls />
          <CookieConsent />
        </Router>
        </CartProvider>
      </FavoritesProvider>
    </AuthProvider>
    </CurrencyProvider>
      </CookieConsentProvider>
    </>
  );
}

export default App;
