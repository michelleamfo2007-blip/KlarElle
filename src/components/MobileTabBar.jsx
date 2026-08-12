import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search, TrendingUp, ShoppingCart, User } from 'lucide-react';
import { useCart } from '../context/CartContext';

function MobileTabBar({ activeTab }) {
  const { cartItems } = useCart();
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: '#fff',
      borderTop: '1px solid #eee',
      display: 'flex',
      justifyContent: 'space-around',
      padding: '8px 0 calc(8px + env(safe-area-inset-bottom))',
      zIndex: 100,
      fontSize: '10px'
    }}>
      <Link to="/" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: activeTab === 'shop' ? '#000' : '#999', textDecoration: 'none' }}>
        <Home size={24} strokeWidth={activeTab === 'shop' ? 2 : 1.5} />
        <span>Shop</span>
      </Link>
      <Link to="/category/all" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: activeTab === 'category' ? '#000' : '#999', textDecoration: 'none' }}>
        <Search size={24} strokeWidth={activeTab === 'category' ? 2 : 1.5} />
        <span>Category</span>
      </Link>
      <Link to="/category/new-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: activeTab === 'trends' ? '#000' : '#999', textDecoration: 'none' }}>
        <TrendingUp size={24} strokeWidth={activeTab === 'trends' ? 2 : 1.5} />
        <span>Trends</span>
      </Link>
      <Link to="/cart" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: activeTab === 'cart' ? '#000' : '#999', textDecoration: 'none', position: 'relative' }}>
        <ShoppingCart size={24} strokeWidth={activeTab === 'cart' ? 2 : 1.5} />
        {cartCount > 0 && (
          <div style={{ position: 'absolute', top: '-4px', right: '-8px', background: '#ff4444', color: '#fff', borderRadius: '10px', padding: '0 4px', fontSize: '10px', fontWeight: 'bold' }}>
            {cartCount}
          </div>
        )}
        <span>Cart</span>
      </Link>
      <Link to="/profile" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: activeTab === 'me' ? '#000' : '#999', textDecoration: 'none' }}>
        <User size={24} strokeWidth={activeTab === 'me' ? 2 : 1.5} />
        <span>Me</span>
      </Link>
    </div>
  );
}

export default MobileTabBar;
