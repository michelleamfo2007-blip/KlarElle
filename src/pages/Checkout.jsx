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
import { COUNTRIES } from '../utils/countries';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function Checkout() {
  const navigate = useNavigate();
  const { cartItems, cartTotal, clearCart } = useCart();
  const { session } = useAuth();
  const { currency, EXCHANGE_RATES, formatPrice } = useCurrency();
  
  const [clientSecret, setClientSecret] = useState("");
  const [paymentError, setPaymentError] = useState("");
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
  const [showShippingForm, setShowShippingForm] = useState(() => {
    const saved = localStorage.getItem('klarelle_saved_address');
    if (saved) {
      try {
        const p = JSON.parse(saved);
        if (p.firstName && p.postcode) return false;
      } catch(e){}
    }
    return true;
  });
  const [formData, setFormData] = useState(() => {
    const savedAddress = localStorage.getItem('klarelle_saved_address');
    if (savedAddress) {
      try {
        const parsed = JSON.parse(savedAddress);
        // Ensure email matches session if logged in, otherwise use saved
        if (session?.user?.email) {
          parsed.email = session.user.email;
        }
        return parsed;
      } catch (e) {
        console.error("Error parsing saved address", e);
      }
    }
    return {
      firstName: '',
      lastName: '',
      email: session?.user?.email || '',
      phoneCode: '+1',
      phone: '',
      location: 'United States',
      region: '',
      city: '',
      postcode: '',
      houseNo: '',
      apartment: ''
    };
  });

  const selectedRate = shippingRates.find(r => r.objectId === selectedRateId);
  
  // Find the cheapest rate to apply free shipping
  const cheapestRateId = shippingRates.length > 0 
    ? shippingRates.reduce((prev, curr) => prev.amount < curr.amount ? prev : curr).objectId 
    : null;

  // Default fallback rate in USD if the shipping API returns no rates for the country
  const FALLBACK_SHIPPING_RATE = 15.00;

  let baseShippingFee = selectedRate ? selectedRate.amount : (shippingRates.length === 0 ? FALLBACK_SHIPPING_RATE : 0.00);
  
  // Apply free shipping ONLY if they select the cheapest option (Standard)
  let shippingFee = baseShippingFee;
  if (cartTotal >= shippingThreshold) {
    if (shippingRates.length === 0 || selectedRateId === cheapestRateId) {
      shippingFee = 0;
    }
  }

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
      setCouponMessage({ text: "Invalid coupon code", type: "error" });
      setAppliedCoupon(null);
      return;
    }

    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      setCouponMessage({ text: "This coupon has expired", type: "error" });
      setAppliedCoupon(null);
      return;
    }

    if (data.usage_limit && data.times_used >= data.usage_limit) {
      setCouponMessage({ text: "This coupon has reached its usage limit", type: "error" });
      setAppliedCoupon(null);
      return;
    }

    setAppliedCoupon(data);
    setCouponMessage({ text: `Success! ${data.discount_percent}% off applied`, type: "success" });
  };

  useEffect(() => {
    if (finalTotal > 0) {
      // Comprehensive list of Stripe-supported currencies
      const STRIPE_SUPPORTED_CURRENCIES = [
        "usd", "aed", "afn", "all", "amd", "ang", "aoa", "ars", "aud", "awg", "azn", "bam", "bbd", "bdt", "bgn", "bif", "bmd", "bnd", "bob", "brl", "bsd", "bwp", "byn", "bzd", "cad", "cdf", "chf", "clp", "cny", "cop", "crc", "cve", "czk", "djf", "dkk", "dop", "dzd", "egp", "etb", "eur", "fjd", "fkp", "gbp", "gel", "gip", "gmd", "gnf", "gtq", "gyd", "hkd", "hnl", "hrk", "htg", "huf", "idr", "ils", "inr", "isk", "jmd", "jpy", "kes", "kgs", "khr", "kmf", "krw", "kyd", "kzt", "lak", "lbp", "lkr", "lrd", "lsl", "mad", "mdl", "mga", "mkd", "mmk", "mnt", "mop", "mur", "mvr", "mwk", "mxn", "myr", "mzn", "nad", "ngn", "nio", "nok", "npr", "nzd", "pab", "pen", "pgk", "php", "pkr", "pln", "pyg", "qar", "ron", "rsd", "rub", "rwf", "sar", "sbd", "scr", "sek", "sgd", "shp", "sle", "sos", "srd", "std", "szl", "thb", "tjs", "top", "try", "ttd", "twd", "tzs", "uah", "ugx", "uyu", "uzs", "vnd", "vuv", "wst", "xaf", "xcd", "xcg", "xof", "xpf", "yer", "zar", "zmw"
      ];
      
      const isStripeSupported = STRIPE_SUPPORTED_CURRENCIES.includes((currency || 'USD').toLowerCase());
      const stripeCurrency = isStripeSupported ? currency : 'USD';
      
      let convertedAmount;
      if (stripeCurrency === 'USD') {
        convertedAmount = finalTotal; // Base amount is already USD
      } else {
        const rate = EXCHANGE_RATES[currency]?.rate || 1;
        convertedAmount = finalTotal * rate;
      }

      setPaymentError("");
      fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: convertedAmount, currency: stripeCurrency }),
      })
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok || data.error) {
            throw new Error(data.error?.message || data.error || 'Failed to initialize payment');
          }
          return data;
        })
        .then((data) => setClientSecret(data.clientSecret))
        .catch((err) => {
          console.error("Error fetching client secret", err);
          setPaymentError(err.message);
        });
    }
  }, [finalTotal, currency, EXCHANGE_RATES]);

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
          shipping_address: `${formData.houseNo}, ${formData.city}, ${formData.region}, ${formData.location}`,
          phone_number: `${formData.phoneCode} ${formData.phone}`,
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

      if (appliedCoupon) {
        await supabase.rpc('increment_coupon_usage', { coupon_id: appliedCoupon.id });
      }

      // Save address to localStorage for future purchases
      localStorage.setItem('klarelle_saved_address', JSON.stringify(formData));

      // Trigger automated receipt and admin notification emails
      // We don't await this so the user isn't stuck waiting on the checkout screen
      fetch('/api/send-order-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderData.id })
      }).catch(err => console.error('Email trigger failed:', err));

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
            <ChevronLeft size={24} onClick={() => {
              if (!formData.firstName || !formData.postcode || !formData.houseNo) {
                navigate('/cart');
              } else {
                setShowShippingForm(false);
              }
            }} style={{ cursor: 'pointer' }} />
            <h1 style={{ flex: 1, textAlign: 'center', fontSize: '18px', margin: 0 }}>Shipping Address</h1>
          <div style={{ width: '24px' }}></div>
        </div>

        <div style={{ background: '#fff', padding: '16px', marginTop: '8px' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px' }}>Location *</label>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', border: '1px solid #ddd', borderRadius: '4px' }}>
              <select name="location" value={formData.location} onChange={handleInputChange} style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent' }}>
                {Object.keys(COUNTRIES).map(countryName => (
                  <option key={countryName} value={countryName}>{countryName}</option>
                ))}
              </select>
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
              <select name="phoneCode" value={formData.phoneCode} onChange={handleInputChange} style={{ padding: '12px', background: '#f9f9f9', borderRight: '1px solid #ddd', color: '#666', border: 'none', outline: 'none', cursor: 'pointer' }}>
                <option value="+1">US +1</option>
                <option value="+44">UK +44</option>
                <option value="+233">GH +233</option>
                <option value="+234">NG +234</option>
                <option value="+27">ZA +27</option>
                <option value="+61">AU +61</option>
                <option value="+49">DE +49</option>
                <option value="+33">FR +33</option>
              </select>
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
                if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.region || !formData.city || !formData.postcode || !formData.houseNo) {
                  alert("Please fill in all required fields to continue.");
                  return;
                }
                setShowShippingForm(false);
                setIsFetchingRates(true);
                try {
                  const res = await fetch('/api/shipping-rates', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                      destinationZip: formData.postcode, 
                      country: formData.location,
                      cartItems: cartItems 
                    })
                  });
                  const data = await res.json();
                  if (data.success && data.rates && data.rates.length > 0) {
                    setShippingRates(data.rates);
                    // Do not auto-select the first rate, make them choose
                  }
                } catch (err) {
                  console.error('Failed to fetch rates', err);
                } finally {
                  setIsFetchingRates(false);
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
            {shippingRates.map(rate => {
              const isCheapest = cheapestRateId === rate.objectId;
              const isFreeEligible = cartTotal >= shippingThreshold && isCheapest;
              const displayAmount = isFreeEligible ? 0 : rate.amount;
              
              return (
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
                    {rate.estimatedDays && (
                      <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                        Estimated Delivery: {rate.estimatedDays} business day{rate.estimatedDays !== 1 && rate.estimatedDays !== '1' ? 's' : ''}
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ fontWeight: 'bold' }}>{displayAmount === 0 ? 'Free' : formatPrice(displayAmount)}</div>
              </div>
            )})}
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
        
        {(() => {
          const STRIPE_SUPPORTED_CURRENCIES = [
            "usd", "aed", "afn", "all", "amd", "ang", "aoa", "ars", "aud", "awg", "azn", "bam", "bbd", "bdt", "bgn", "bif", "bmd", "bnd", "bob", "brl", "bsd", "bwp", "byn", "bzd", "cad", "cdf", "chf", "clp", "cny", "cop", "crc", "cve", "czk", "djf", "dkk", "dop", "dzd", "egp", "etb", "eur", "fjd", "fkp", "gbp", "gel", "gip", "gmd", "gnf", "gtq", "gyd", "hkd", "hnl", "hrk", "htg", "huf", "idr", "ils", "inr", "isk", "jmd", "jpy", "kes", "kgs", "khr", "kmf", "krw", "kyd", "kzt", "lak", "lbp", "lkr", "lrd", "lsl", "mad", "mdl", "mga", "mkd", "mmk", "mnt", "mop", "mur", "mvr", "mwk", "mxn", "myr", "mzn", "nad", "ngn", "nio", "nok", "npr", "nzd", "pab", "pen", "pgk", "php", "pkr", "pln", "pyg", "qar", "ron", "rsd", "rub", "rwf", "sar", "sbd", "scr", "sek", "sgd", "shp", "sle", "sos", "srd", "std", "szl", "thb", "tjs", "top", "try", "ttd", "twd", "tzs", "uah", "ugx", "uyu", "uzs", "vnd", "vuv", "wst", "xaf", "xcd", "xcg", "xof", "xpf", "yer", "zar", "zmw"
          ];
          const isStripeSupported = STRIPE_SUPPORTED_CURRENCIES.includes((currency || 'USD').toLowerCase());
          
          if (!isStripeSupported) {
            return (
              <div style={{ padding: '12px', background: '#f5f5f5', borderRadius: '4px', fontSize: '12px', color: '#666', marginBottom: '16px' }}>
                <strong>Note:</strong> Your bank will process this payment in US Dollars <strong>(${finalTotal.toFixed(2)})</strong>. The {currency} amount is an estimate based on current exchange rates.
              </div>
            );
          }
          return null;
        })()}

        {!selectedRateId && shippingRates.length > 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', background: '#f9fafb', color: '#666', border: '1px solid #eee', borderRadius: '8px' }}>
            Please select a shipping method above to proceed with payment.
          </div>
        ) : clientSecret ? (
          <Elements options={options} stripe={stripePromise}>
            <CheckoutForm amount={finalTotal} formattedAmount={formatPrice(finalTotal)} onSuccess={handlePaymentSuccess} />
          </Elements>
        ) : paymentError ? (
          <div style={{ padding: '24px', textAlign: 'center', background: '#fee2e2', color: '#dc2626', borderRadius: '8px' }}>
            <strong>Payment Setup Error:</strong><br/>
            {paymentError}<br/>
            <span style={{ fontSize: '12px', marginTop: '8px', display: 'block' }}>If you are the admin, ensure your STRIPE_SECRET_KEY is added to Vercel Environment Variables.</span>
          </div>
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
