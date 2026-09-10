import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { Trash2, Minus, Plus, ShieldCheck, Truck } from 'lucide-react';
import { productPath } from '../utils/productUrl';
import { rememberCartEmail } from '../utils/cartTracking';
import './Cart.css';

function Cart() {
  const { cartItems, removeFromCart, updateQuantity, cartTotal } = useCart();
  const { session } = useAuth();
  const { formatPrice } = useCurrency();
  
  if (session?.user?.email) rememberCartEmail(session.user.email);
  const shippingThreshold = 100;
  const baseShippingFee = 15.00;
  const shipping = cartTotal >= shippingThreshold ? 0 : baseShippingFee;
  const finalTotal = cartTotal + shipping;

  if (cartItems.length === 0) {
    return (
      <div className="container empty-cart">
        <h2>Your cart is empty</h2>
        {!session && <p>Sign in to save or access already saved items in your cart.</p>}
        <Link to="/" className="btn btn-primary" style={{marginTop: '20px'}}>CONTINUE SHOPPING</Link>
      </div>
    );
  }

  return (
    <div className="container cart-page">
      <h1 className="cart-title">Shopping Cart ({cartItems.length})</h1>
      
      <div className="cart-container">
        <div className="cart-items-section">
          <div className="shipping-promo">
            <ShieldCheck size={20} color="var(--primary-color)" />
            {shipping === 0 ? (
              <span><strong>Congratulations!</strong> You get free standard shipping.</span>
            ) : (
              <span>Add <strong>{formatPrice(shippingThreshold - cartTotal)}</strong> more to get free U.S. standard shipping!</span>
            )}
          </div>
          
          <div className="cart-items-list">
            {cartItems.map(item => (
              <div className="cart-item" key={item.cartItemId}>
                <img src={item.image_url || item.image || '/placeholder.png'} alt={item.name} className="cart-item-img" />
                <div className="cart-item-details">
                  <Link to={productPath(item)} className="cart-item-name">{item.name}</Link>
                  <div className="cart-item-specs">
                    {item.selectedColor && `Color: ${item.selectedColor}`}
                    {item.selectedColor && item.selectedSize && ' | '}
                    {item.selectedSize && `Size: ${item.selectedSize}`}
                  </div>
                  <div className="cart-item-price">{formatPrice(item.price || 0)}</div>
                  
                  <div className="cart-item-actions">
                    <div className="quantity-selector">
                      <button onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}><Minus size={14} /></button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}><Plus size={14} /></button>
                    </div>
                    <button className="remove-btn" onClick={() => removeFromCart(item.cartItemId)}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="cart-summary-section">
          <div className="summary-card">
            <h3>Order Summary</h3>
            <div className="summary-row">
              <span>Retail Price</span>
              <span>{formatPrice(cartTotal)}</span>
            </div>
            <div className="summary-row">
              <span>Standard Shipping</span>
              <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
            </div>
            
            <div className="summary-divider"></div>
            
            <div className="summary-row total">
              <span>Total</span>
              <span>{formatPrice(finalTotal)}</span>
            </div>
            
            <Link to="/checkout" className="btn btn-primary checkout-btn" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>CHECKOUT</Link>
            <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#666', textAlign: 'center' }}>Trial checkout — no real payment</p>
            
            <div className="payment-methods">
              We accept: Visa, Mastercard, American Express, Discover, Klarna
            </div>
            
            <div style={{ marginTop: '20px', fontSize: '12px', color: '#555', borderTop: '1px solid #eee', paddingTop: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: 'bold' }}>
                <Truck size={14} /> Shipping & Returns
              </div>
              <p style={{ margin: '0 0 8px 0', lineHeight: '1.4' }}><strong>Shipping:</strong> Estimated delivery is shown at checkout.</p>
              <p style={{ margin: 0, lineHeight: '1.4' }}><strong>Exchanges:</strong> Eligible exchanges or store credit are accepted within 7 days of delivery. Items must be unworn and in original condition with tags attached. Refunds to the original payment method are not available.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;
