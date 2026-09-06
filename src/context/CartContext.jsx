import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('klarelle_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [cartToast, setCartToast] = useState('');
  const { session } = useAuth();

  useEffect(() => {
    localStorage.setItem('klarelle_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, selectedSize = null, selectedColor = null, quantity = 1, fulfilledFrom = 'US') => {
    setCartItems(prev => {
      const cartItemId = `${product.id}-${selectedSize || 'default'}-${selectedColor || 'default'}`;
      const existing = prev.find(item => item.cartItemId === cartItemId);
      if (existing) {
        return prev.map(item => item.cartItemId === cartItemId ? { ...item, quantity: item.quantity + quantity, fulfilledFrom } : item);
      }
      return [...prev, { ...product, cartItemId, selectedSize, selectedColor, quantity, fulfilledFrom }];
    });
    const label = product?.name ? `${product.name} added to cart` : 'Added to cart';
    setCartToast(label);
    window.clearTimeout(addToCart._toastTimer);
    addToCart._toastTimer = window.setTimeout(() => setCartToast(''), 3500);
  };

  const removeFromCart = (cartItemId) => {
    setCartItems(prev => prev.filter(item => item.cartItemId !== cartItemId));
  };

  const updateQuantity = (cartItemId, quantity) => {
    if (quantity < 1) return;
    setCartItems(prev => prev.map(item => item.cartItemId === cartItemId ? { ...item, quantity } : item));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cartItems.reduce((acc, item) => acc + ((item.price || item.total_amount) * item.quantity), 0); // fallback if product structure differs

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, cartTotal }}>
      {children}
      {cartToast && (
        <div style={{
          position: 'fixed',
          top: '88px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 5000,
          background: '#111',
          color: '#fff',
          padding: '14px 18px',
          borderRadius: '8px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          maxWidth: 'calc(100% - 32px)',
          fontSize: '14px',
          fontWeight: '600'
        }}>
          <span>{cartToast}</span>
          <a href="/cart" style={{ color: '#fff', textDecoration: 'underline', whiteSpace: 'nowrap' }}>View cart</a>
        </div>
      )}
    </CartContext.Provider>
  );
};
