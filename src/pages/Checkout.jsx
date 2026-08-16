import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { supabase } from '../lib/supabase';
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from '../components/CheckoutForm';
import { ChevronLeft, MapPin, ChevronRight, CheckCircle2 } from 'lucide-react';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function Checkout() {
  const navigate = useNavigate();
  const { cartItems, cartTotal, clearCart } = useCart();
  const { session } = useAuth();
  const { formatPrice } = useCurrency();
  
  const [clientSecret, setClientSecret] = useState("");
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponMessage, setCouponMessage] = useState({ text: "", type: "" });
  const [shippingThreshold, setShippingThreshold] = useState(100);
  const [shippingRates, setShippingRates] = useState([]);
  const [selectedRateId, setSelectedRateId] = useState(null);
  const [isFetchingRates, setIsFetchingRates] = useState(false);
  
  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from('store_settings').select('shipping_threshold').eq('id', 1).single();
      if (data && data.shipping_threshold !== undefined) {
        setShippingThreshold(data.shipping_threshold);
      }
    };
    fetchSettings();
  }, []);
  
  // Shipping Form State
  const [showShippingForm, setShowShippingForm] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: session?.user?.email || '',
    phone: '',
    location: 'Ghana',
    region: '',
    city: '',
    postcode: '',
    houseNo: '',
    apartment: ''
  });

  const selectedRate = shippingRates.find(r => r.objectId === selectedRateId);
  const baseShippingFee = selectedRate ? selectedRate.amount : 15.00;
  const shippingFee = cartTotal >= shippingThreshold ? 0 : baseShippingFee;
  const shippingGuarantee = 1.50;
  
  const discountAmount = appliedCoupon ? (cartTotal * (appliedCoupon.discount_percent / 100)) : 0;
  const finalTotal = cartTotal - discountAmount + shippingFee + shippingGuarantee;

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setCouponMessage({ text: "Checking...", type: "info" });

    const cleanCode = couponInput.trim().toUpperCase();

    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', cleanCode)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      setCouponMessage({ text: "Invalid or expired coupon code", type: "error" });
      setAppliedCoupon(null);
    } else {
      setAppliedCoupon(data);
      setCouponMessage({ text: `Success! ${data.discount_percent}% off applied`, type: "success" });
    }
  };

  useEffect(() => {
    if (finalTotal > 0) {
      fetch("http://localhost:4242/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: finalTotal }),
      })
        .then((res) => res.json())
        .then((data) => setClientSecret(data.clientSecret))
        .catch((err) => console.error("Error fetching client secret", err));
    }
  }, [finalTotal]);

  if (cartItems.length === 0) {
    return (
      <div style={{ padding: '100px 20px', textAlign: 'center', background: '#f5f5f5', minHeight: '100vh' }}>
        <h2 style={{ marginBottom: '16px' }}>Your cart is empty</h2>
        <Link to="/" style={{ color: '#000', textDecoration: 'underline' }}>Return to Shop</Link>
      </div>
    );
  }

  const handlePaymentSuccess = async () => {
    try {
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([{
          customer_name: fullName || 'Guest',
          customer_email: formData.email,
          total_amount: finalTotal,
          status: 'Paid',
          shipping_address: `${formData.houseNo}, ${formData.city}, ${formData.region}`,
          phone_number: formData.phone,
          shipping_provider: selectedRate ? selectedRate.provider : 'Standard',
          shipping_service: selectedRate ? selectedRate.serviceLevel : 'Shipping',
          shippo_rate_id: selectedRate ? selectedRate.objectId : null
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = cartItems.map(item => ({
        order_id: orderData.id,
        product_id: item.id,
        quantity: item.quantity,
        price_at_time: item.price || 0,
        size: item.selectedSize || null,
        color: item.selectedColor || null
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw itemsError;

      clearCart();
      navigate('/order-success');
    } catch (error) {
      alert('Error saving order details: ' + error.message);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const appearance = { theme: 'stripe' };
  const options = { clientSecret, appearance };

  if (showShippingForm) {
    return (
      <div style={{ background: '#f5f5f5', minHeight: '100vh', fontFamily: '-apple-system, sans-serif' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', background: '#f5f5f5', minHeight: '100vh', position: 'relative' }}>
          <div style={{ background: '#fff', padding: '16px', display: 'flex', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10, borderBottom: '1px solid #eee' }}>
            <ChevronLeft size={24} onClick={() => setShowShippingForm(false)} style={{ cursor: 'pointer' }} />
            <h1 style={{ flex: 1, textAlign: 'center', fontSize: '18px', margin: 0 }}>Shipping Address</h1>
          <div style={{ width: '24px' }}></div>
        </div>

        <div style={{ background: '#fff', padding: '16px', marginTop: '8px' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px' }}>Location *</label>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', border: '1px solid #ddd', borderRadius: '4px' }}>
              <span>{formData.location}</span>
              <ChevronRight size={16} color="#999" />
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px' }}>First Name *</label>
            <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }} />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px' }}>Last Name *</label>
            <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }} />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px' }}>Phone Number *</label>
            <div style={{ display: 'flex', border: '1px solid #ddd', borderRadius: '4px' }}>
              <div style={{ padding: '12px', background: '#f9f9f9', borderRight: '1px solid #ddd', color: '#666' }}>GH +233</div>
              <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} style={{ width: '100%', padding: '12px', border: 'none', outline: 'none' }} />
            </div>
            <div style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>Need Correct Phone Number for delivery.</div>
          </div>
        </div>

        <div style={{ background: '#fff', padding: '16px', marginTop: '8px' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px' }}>Region *</label>
            <input type="text" name="region" value={formData.region} onChange={handleInputChange} style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }} />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px' }}>City / Town *</label>
            <input type="text" name="city" value={formData.city} onChange={handleInputChange} style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }} />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px' }}>Postcode *</label>
            <input type="text" name="postcode" value={formData.postcode} onChange={handleInputChange} style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }} />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px' }}>House No / Street *</label>
            <input type="text" name="houseNo" value={formData.houseNo} onChange={handleInputChange} style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }} />
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px' }}>Email Address *</label>
            <input type="email" name="email" value={formData.email} onChange={handleInputChange} style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }} />
          </div>
        </div>

        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
          <div style={{ width: '100%', maxWidth: '600px', background: '#fff', padding: '16px', borderTop: '1px solid #eee', pointerEvents: 'auto' }}>
            <button 
              onClick={async () => {
                setShowShippingForm(false);
                if (formData.postcode) {
                  setIsFetchingRates(true);
                  try {
                    const res = await fetch('/api/shipping-rates', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ destinationZip: formData.postcode })
                    });
                    const data = await res.json();
                    if (data.success && data.rates && data.rates.length > 0) {
                      setShippingRates(data.rates);
                      setSelectedRateId(data.rates[0].objectId);
                    }
                  } catch (err) {
                    console.error('Failed to fetch rates', err);
                  } finally {
                    setIsFetchingRates(false);
                  }
                }
              }}
              style={{ width: '100%', padding: '16px', background: '#000', color: '#fff', border: 'none', fontWeight: 'bold', fontSize: '16px', borderRadius: '4px', cursor: 'pointer' }}
            >
              SAVE ADDRESS & CALCULATE SHIPPING
            </button>
          </div>
        </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh', paddingBottom: '100px', fontFamily: '-apple-system, sans-serif' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', background: '#f5f5f5', minHeight: '100vh', position: 'relative' }}>
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } } .spin { animation: spin 1s linear infinite; }`}</style>
        
        {/* Header */}
        <div style={{ background: '#fff', padding: '16px', display: 'flex', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10, borderBottom: '1px solid #eee' }}>
          <ChevronLeft size={24} onClick={() => navigate(-1)} style={{ cursor: 'pointer' }} />
          <h1 style={{ flex: 1, textAlign: 'center', fontSize: '18px', margin: 0 }}>Checkout({cartItems.length})</h1>
        <div style={{ width: '24px' }}></div>
      </div>

      {/* Address Block */}
      <div style={{ background: '#fff', padding: '16px', display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }} onClick={() => setShowShippingForm(true)}>
        <MapPin size={20} style={{ marginTop: '4px' }} />
        <div style={{ flex: 1 }}>
          {formData.firstName ? (
            <>
              <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '4px' }}>{formData.firstName} {formData.lastName} <span style={{ color: '#666', fontWeight: 'normal', fontSize: '14px', marginLeft: '8px' }}>{formData.phone}</span></div>
              <div style={{ fontSize: '13px', color: '#333' }}>{formData.houseNo} {formData.city} {formData.location} {formData.postcode}</div>
            </>
          ) : (
            <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#000' }}>+ Add Shipping Address</div>
          )}
        </div>
        <ChevronRight size={20} color="#999" />
      </div>



      {/* Order Items */}
      <div style={{ background: '#fff', padding: '16px', marginTop: '8px' }}>
        <h3 style={{ fontSize: '16px', margin: '0 0 16px 0' }}>Order items({cartItems.length})</h3>
        {cartItems.map((item, index) => (
          <div key={index} style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <img src={item.image_url || item.image || '/placeholder.png'} alt={item.name} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px', background: '#f5f5f5' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '4px' }}>{item.name}</div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>{item.selectedColor} / {item.selectedSize}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: 'bold', color: '#ff4444' }}>{formatPrice(item.price)}</div>
                <div style={{ fontSize: '12px', color: '#666' }}>x {item.quantity}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Shipping Method */}
      <div style={{ background: '#fff', padding: '16px', marginTop: '8px' }}>
        <h3 style={{ fontSize: '16px', margin: '0 0 16px 0' }}>Shipping Method</h3>
        
        {isFetchingRates ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>Fetching live rates...</div>
        ) : shippingRates.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '8px' }}>
            {shippingRates.map(rate => (
              <div 
                key={rate.objectId}
                onClick={() => setSelectedRateId(rate.objectId)}
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '12px', 
                  border: selectedRateId === rate.objectId ? '2px solid #000' : '1px solid #eee', 
                  borderRadius: '6px',
                  cursor: 'pointer',
                  background: selectedRateId === rate.objectId ? '#f9f9f9' : '#fff'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '1px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {selectedRateId === rate.objectId && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#000' }}></div>}
                  </div>
                  <div>
                    <div style={{ fontWeight: '500' }}>{rate.provider} - {rate.serviceLevel}</div>
                  </div>
                </div>
                <div style={{ fontWeight: 'bold' }}>{formatPrice(rate.amount)}</div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '5px solid #000', boxSizing: 'border-box' }}></div>
              <div>Standard Shipping</div>
            </div>
            <div style={{ fontWeight: 'bold' }}>{shippingFee === 0 ? 'Free' : formatPrice(shippingFee)}</div>
          </div>
        )}
        <div style={{ fontSize: '12px', color: '#666', marginBottom: '16px', marginTop: '12px' }}>Delivery: 11-22 business days</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid #eee' }}>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}>Shipping Guarantee <CheckCircle2 size={16} fill="#000" color="#fff" /></div>
            <div style={{ fontSize: '12px', color: '#666' }}>Refund if your package is lost or damaged.</div>
          </div>
          <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{formatPrice(shippingGuarantee)}</span>
        </div>
      </div>

      {/* Payment Method */}
      <div style={{ background: '#fff', padding: '16px', marginTop: '8px' }}>
        <h3 style={{ fontSize: '16px', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>Payment Method <CheckCircle2 size={16} fill="#00cf6e" color="#fff" /></h3>
        {clientSecret ? (
          <Elements options={options} stripe={stripePromise}>
            <CheckoutForm amount={finalTotal} onSuccess={handlePaymentSuccess} />
          </Elements>
        ) : (
          <div style={{ padding: '24px', textAlign: 'center', background: '#f9fafb' }}>
            Loading secure payment form...
          </div>
        )}
      </div>

      {/* Order Summary & Coupon */}
      <div style={{ background: '#fff', padding: '16px', marginTop: '8px' }}>
        <form onSubmit={handleApplyCoupon} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid #eee', marginBottom: '16px' }}>
          <span style={{ fontWeight: 'bold', fontSize: '14px' }}>Apply Voucher</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {appliedCoupon ? (
              <span style={{ color: '#ff4444', fontWeight: 'bold' }}>-{formatPrice(discountAmount)}</span>
            ) : (
              <input type="text" placeholder="Enter code" value={couponInput} onChange={(e) => setCouponInput(e.target.value)} style={{ border: 'none', textAlign: 'right', outline: 'none', fontSize: '14px' }} />
            )}
            <ChevronRight size={16} color="#999" />
          </div>
          <button type="submit" style={{ display: 'none' }}>Apply</button>
        </form>
        {couponMessage.text && (
          <div style={{ fontSize: '12px', color: couponMessage.type === 'error' ? 'red' : 'green', marginTop: '-8px', marginBottom: '16px', textAlign: 'right' }}>
            {couponMessage.text}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid #eee', marginBottom: '16px' }}>
          <span style={{ fontWeight: 'bold', fontSize: '14px' }}>Points</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666', fontSize: '14px' }}>
            Total: 100 <ChevronRight size={16} color="#999" />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '13px' }}>
          <span style={{ color: '#666' }}>Retail Price: {cartItems.length} Items</span>
          <span style={{ fontWeight: 'bold' }}>{formatPrice(cartTotal)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '13px' }}>
          <span style={{ color: '#666' }}>Shipping Fee:</span>
          <span style={{ fontWeight: 'bold' }}>{formatPrice(shippingFee)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '13px' }}>
          <span style={{ color: '#666' }}>Shipping Guarantee:</span>
          <span style={{ fontWeight: 'bold' }}>{formatPrice(shippingGuarantee)}</span>
        </div>
        {appliedCoupon && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '13px', color: '#ff4444' }}>
            <span>Coupon(s) ({appliedCoupon.code})</span>
            <span style={{ fontWeight: 'bold' }}>-{formatPrice(discountAmount)}</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #eee', alignItems: 'center' }}>
          <span style={{ fontWeight: 'bold', fontSize: '14px' }}>Order Total:</span>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 'bold', color: '#ff4444', fontSize: '18px' }}>{formatPrice(finalTotal)}</div>
            {appliedCoupon && <div style={{ fontSize: '12px', color: '#ff4444' }}>Saved {formatPrice(discountAmount)}</div>}
          </div>
        </div>
      </div>

      {/* Bottom Fixed Bar */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 50, pointerEvents: 'none' }}>
        <div style={{ width: '100%', maxWidth: '600px', background: '#fff', padding: '12px 16px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 'calc(12px + env(safe-area-inset-bottom))', pointerEvents: 'auto' }}>
          <div>
            <div style={{ fontWeight: 'bold', color: '#ff4444', fontSize: '18px' }}>{formatPrice(finalTotal)}</div>
            {appliedCoupon && <div style={{ fontSize: '12px', color: '#ff4444' }}>Saved {formatPrice(discountAmount)}</div>}
          </div>
          <button 
            onClick={() => document.getElementById('submit').click()} 
            style={{ background: '#000', color: '#fff', padding: '12px 32px', borderRadius: '4px', fontWeight: 'bold', fontSize: '14px', border: 'none' }}
          >
            Place Order
          </button>
        </div>
      </div>

      </div>
    </div>
  );
}

export default Checkout;
