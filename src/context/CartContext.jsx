import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getFulfillmentSource, isProductSoldOut } from '../utils/stock';
import { getVariantSkuFromProduct, isOfficialSku } from '../utils/sku';
import { isComingSoon } from '../utils/storefront';
import { getRememberedCartEmail, logCartActivity, saveCartSnapshot } from '../utils/cartTracking';
import { trackAddToCart } from '../utils/analytics';
import { canShopWithCookies } from '../utils/cookieConsent';

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
    saveCartSnapshot(cartItems, session?.user?.email || getRememberedCartEmail());
  }, [cartItems, session?.user?.email]);

  const addToCart = (product, selectedSize = null, selectedColor = null, quantity = 1, fulfilledFrom) => {
    if (!canShopWithCookies()) {
      window.dispatchEvent(new CustomEvent('klarelle-cookie-prompt'));
      return;
    }
    if (isComingSoon(product)) {
      setCartToast('This style is coming soon. Use Notify Me When Available.');
      window.clearTimeout(addToCart._toastTimer);
      addToCart._toastTimer = window.setTimeout(() => setCartToast(''), 3500);
      return;
    }
    if (isProductSoldOut(product)) {
      setCartToast('This style is sold out. Use Notify Me When Available.');
      window.clearTimeout(addToCart._toastTimer);
      addToCart._toastTimer = window.setTimeout(() => setCartToast(''), 3500);
      return;
    }
    const source = fulfilledFrom || getFulfillmentSource(product, selectedColor, selectedSize);
    const sku = getVariantSkuFromProduct(product, selectedColor, selectedSize)
      || (isOfficialSku(product.sku) ? product.sku : '');
    setCartItems(prev => {
      const cartItemId = `${product.id}-${selectedSize || 'default'}-${selectedColor || 'default'}`;
      const existing = prev.find(item => item.cartItemId === cartItemId);
      if (existing) {
        return prev.map(item => item.cartItemId === cartItemId ? { ...item, quantity: item.quantity + quantity, fulfilledFrom: source, sku } : item);
      }
      return [...prev, { ...product, cartItemId, selectedSize, selectedColor, quantity, fulfilledFrom: source, sku }];
    });
    logCartActivity({
      action: 'add',
      product,
      size: selectedSize,
      color: selectedColor,
      quantity,
      sku,
      email: session?.user?.email
    });
    trackAddToCart(product, { size: selectedSize, color: selectedColor, quantity, sku });
    const label = product?.name ? `${product.name} added to cart` : 'Added to cart';
    setCartToast(label);
    window.clearTimeout(addToCart._toastTimer);
    addToCart._toastTimer = window.setTimeout(() => setCartToast(''), 3500);
  };

  const removeFromCart = (cartItemId) => {
    const item = cartItems.find((entry) => entry.cartItemId === cartItemId);
    setCartItems(prev => prev.filter(entry => entry.cartItemId !== cartItemId));
    if (item) {
      logCartActivity({
        action: 'remove',
        product: item,
        size: item.selectedSize,
        color: item.selectedColor,
        quantity: item.quantity,
        sku: item.sku,
        email: session?.user?.email
      });
    }
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
