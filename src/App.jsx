import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { FavoritesProvider } from './context/FavoritesContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Favorites from './pages/Favorites';
import Category from './pages/Category';
import Login from './pages/admin/Login';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import ProductList from './pages/admin/ProductList';
import ProductForm from './pages/admin/ProductForm';
import Coupons from './pages/admin/Coupons';
import SuperAdminLayout from './pages/super-admin/SuperAdminLayout';
import SuperDashboard from './pages/super-admin/SuperDashboard';
import ManageTenants from './pages/super-admin/ManageTenants';
import GlobalSettings from './pages/super-admin/GlobalSettings';
import CustomerLogin from './pages/CustomerLogin';
import CustomerRegister from './pages/CustomerRegister';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import TrackOrder from './pages/TrackOrder';
import CustomerProfile from './pages/CustomerProfile';
import StaticPage from './pages/StaticPage';
import { AuthProvider } from './context/AuthContext';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <FavoritesProvider>
        <CartProvider>
          <Router>
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
              <Route path="page/about-us" element={<StaticPage title="About Us" />} />
              <Route path="page/fashion-blogger" element={<StaticPage title="Fashion Blogger" />} />
              <Route path="page/social-responsibility" element={<StaticPage title="Social Responsibility" />} />
              <Route path="page/careers" element={<StaticPage title="Careers" />} />
              <Route path="page/shipping-info" element={<StaticPage title="Shipping Info" />} />
              <Route path="page/returns" element={<StaticPage title="Returns" />} />
              <Route path="page/how-to-order" element={<StaticPage title="How to Order" />} />
              <Route path="page/contact-us" element={<StaticPage title="Contact Us" />} />
              <Route path="page/payment-method" element={<StaticPage title="Payment Method" />} />
              <Route path="page/bonus-point" element={<StaticPage title="Bonus Point" />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin/login" element={<Login />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="products" element={<ProductList />} />
              <Route path="products/new" element={<ProductForm />} />
              <Route path="products/edit/:id" element={<ProductForm />} />
              <Route path="coupons" element={<Coupons />} />
            </Route>

            {/* Super Admin Routes */}
            <Route path="/super-admin" element={<SuperAdminLayout />}>
              <Route index element={<SuperDashboard />} />
              <Route path="tenants" element={<ManageTenants />} />
              <Route path="settings" element={<GlobalSettings />} />
            </Route>
          </Routes>
        </Router>
        </CartProvider>
      </FavoritesProvider>
    </AuthProvider>
  );
}

export default App;
