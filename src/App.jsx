import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import PageTracker from './components/PageTracker';
import { CartProvider } from './context/CartContext';
import { FavoritesProvider } from './context/FavoritesContext';
import Layout from './components/Layout';
import WhatsAppButton from './components/WhatsAppButton';
import Home from './pages/Home';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Favorites from './pages/Favorites';
import Category from './pages/Category';
import Login from './pages/admin/Login';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import UpdatePassword from './pages/admin/UpdatePassword';
import ProductList from './pages/admin/ProductList';
import ProductForm from './pages/admin/ProductForm';
import Coupons from './pages/admin/Coupons';
import Orders from './pages/admin/Orders';
import Waitlist from './pages/admin/Waitlist';
import OrderDetails from './pages/admin/OrderDetails';
import SuperAdminLayout from './pages/super-admin/SuperAdminLayout';
import SuperDashboard from './pages/super-admin/SuperDashboard';
import ManageStaff from './pages/super-admin/ManageStaff';
import GlobalSettings from './pages/super-admin/GlobalSettings';
import SuperOrders from './pages/super-admin/SuperOrders';
import SuperCustomers from './pages/super-admin/SuperCustomers';
import SuperPayments from './pages/super-admin/SuperPayments';
import SuperShipping from './pages/super-admin/SuperShipping';
import SuperDiscounts from './pages/super-admin/SuperDiscounts';
import SuperWebsite from './pages/super-admin/SuperWebsite';
import SuperReviews from './pages/super-admin/SuperReviews';
import SuperSupport from './pages/super-admin/SuperSupport';
import SuperReports from './pages/super-admin/SuperReports';
import SuperNotifications from './pages/super-admin/SuperNotifications';
import SuperActivity from './pages/super-admin/SuperActivity';
import CustomerLogin from './pages/CustomerLogin';
import CustomerRegister from './pages/CustomerRegister';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import TrackOrder from './pages/TrackOrder';
import CustomerProfile from './pages/CustomerProfile';
import MyOrders from './pages/MyOrders';
import Vouchers from './pages/Vouchers';
import Wallet from './pages/Wallet';
import CheckIn from './pages/CheckIn';
import StaticPage from './pages/StaticPage';
import ContactUs from './pages/ContactUs';
import { AuthProvider } from './context/AuthContext';
import { CurrencyProvider } from './context/CurrencyContext';
import './index.css';

function App() {
  return (
    <>
      <Analytics />
      <CurrencyProvider>
        <AuthProvider>
          <FavoritesProvider>
            <CartProvider>
              <Router>
                <PageTracker />
              <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="product/:id" element={<ProductDetails />} />
              <Route path="category/:id" element={<Category />} />
              <Route path="cart" element={<Cart />} />
              <Route path="favorites" element={<Favorites />} />
              <Route path="login" element={<CustomerLogin />} />
              <Route path="register" element={<CustomerRegister />} />
              <Route path="checkout" element={<Checkout />} />
              <Route path="order-success" element={<OrderSuccess />} />
              <Route path="track-order" element={<TrackOrder />} />
              <Route path="profile" element={<CustomerProfile />} />
              <Route path="profile/orders" element={<MyOrders />} />
              <Route path="profile/vouchers" element={<Vouchers />} />
              <Route path="profile/wallet" element={<Wallet />} />
              <Route path="check-in" element={<CheckIn />} />
              <Route path="page/about-us" element={<StaticPage title="About Us" />} />
              <Route path="page/faq" element={<StaticPage title="FAQ" />} />
              <Route path="page/influencer-collaboration" element={<StaticPage title="Influencer Collaboration" />} />
              <Route path="page/social-responsibility" element={<StaticPage title="Social Responsibility" />} />
              <Route path="page/shipping-info" element={<StaticPage title="Shipping Info" />} />
              <Route path="page/returns" element={<StaticPage title="Returns" />} />
              <Route path="page/how-to-order" element={<StaticPage title="How to Order" />} />
              <Route path="page/contact-us" element={<ContactUs />} />
              <Route path="page/payment-method" element={<StaticPage title="Payment Method" />} />
              <Route path="page/rewards" element={<StaticPage title="Rewards" />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin/login" element={<Login />} />
            <Route path="/update-password" element={<UpdatePassword />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="products" element={<ProductList />} />
              <Route path="products/new" element={<ProductForm />} />
              <Route path="products/edit/:id" element={<ProductForm />} />
              <Route path="coupons" element={<Coupons />} />
              <Route path="orders" element={<Orders />} />
              <Route path="orders/:id" element={<OrderDetails />} />
              <Route path="customers" element={<SuperCustomers />} />
              <Route path="payments" element={<SuperPayments />} />
              <Route path="shipping" element={<SuperShipping />} />
              <Route path="waitlist" element={<Waitlist />} />
              <Route path="reviews" element={<SuperReviews />} />
              <Route path="support" element={<SuperSupport />} />
              <Route path="reports" element={<SuperReports />} />
              <Route path="notifications" element={<SuperNotifications />} />
            </Route>

            {/* Super Admin Routes */}
            <Route path="/super-admin" element={<SuperAdminLayout />}>
              <Route index element={<SuperDashboard />} />
              <Route path="orders" element={<Orders />} />
              <Route path="orders/:id" element={<OrderDetails />} />
              <Route path="customers" element={<SuperCustomers />} />
              <Route path="payments" element={<SuperPayments />} />
              <Route path="shipping" element={<SuperShipping />} />
              <Route path="discounts" element={<Coupons />} />
              <Route path="waitlist" element={<Waitlist />} />
              <Route path="website" element={<SuperWebsite />} />
              <Route path="reviews" element={<SuperReviews />} />
              <Route path="support" element={<SuperSupport />} />
              <Route path="reports" element={<SuperReports />} />
              <Route path="notifications" element={<SuperNotifications />} />
              <Route path="activity" element={<SuperActivity />} />
              <Route path="staff" element={<ManageStaff />} />
              <Route path="settings" element={<GlobalSettings />} />
            </Route>
          </Routes>
          <WhatsAppButton />
        </Router>
        </CartProvider>
      </FavoritesProvider>
    </AuthProvider>
    </CurrencyProvider>
    </>
  );
}

export default App;
