import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { Trash2, Minus, Plus, ShieldCheck, Truck } from 'lucide-react';
import './Cart.css';

function Cart() {
  const { cartItems, removeFromCart, updateQuantity, cartTotal } = useCart();
  const { session } = useAuth();
  const { formatPrice } = useCurrency();
  
  const shippingThreshold = 100;
  const baseShippingFee = 15.00;
  const shipping = cartTotal >= shippingThreshold ? 0 : baseShippingFee;
  const finalTotal = cartTotal + shipping;

  if (cartItems.length === 0) {
    return (
      <div className="container empty-cart">
        <h2>Your Shopping Bag is Empty</h2>
        {!session && <p>Sign in to save or access already saved items in your shopping bag.</p>}
        <Link to="/" className="btn btn-primary" style={{marginTop: '20px'}}>CONTINUE SHOPPING</Link>
      </div>
    );
  }

  return (
    <div className="container cart-page">
      <h1 className="cart-title">Shopping Bag ({cartItems.length})</h1>
      
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
                  <Link to={`/product/${item.id}`} className="cart-item-name">{item.name}</Link>
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
            
            <div className="payment-methods">
              We accept: Visa, Mastercard, Klarna
            </div>
            
            <div style={{ marginTop: '20px', fontSize: '12px', color: '#555', borderTop: '1px solid #eee', paddingTop: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: 'bold' }}>
                <Truck size={14} /> Shipping & Returns
              </div>
              <p style={{ margin: '0 0 8px 0', lineHeight: '1.4' }}><strong>Shipping:</strong> Standard shipping takes 3-5 business days after fulfillment for U.S. orders and 9-15 days for international orders.</p>
              <p style={{ margin: 0, lineHeight: '1.4' }}><strong>Returns:</strong> We accept returns within 7 days of delivery. Items must be unworn and in original condition with tags attached.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;
