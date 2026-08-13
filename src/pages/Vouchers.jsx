import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Ticket, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

function Vouchers() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    const { data } = await supabase.from('coupons').select('*').eq('is_active', true).order('discount_percent', { ascending: false });
    if (data) setCoupons(data);
    setLoading(false);
  };

  return (
    <div style={{ background: '#f9f9f9', minHeight: '100vh', fontFamily: '-apple-system, sans-serif' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', background: '#f9f9f9', minHeight: '100vh' }}>
        
        {/* Header */}
        <div style={{ background: '#fff', padding: '16px', display: 'flex', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10, borderBottom: '1px solid #eee' }}>
          <Link to="/profile" style={{ color: 'inherit' }}>
            <ChevronLeft size={24} style={{ cursor: 'pointer' }} />
          </Link>
          <h1 style={{ flex: 1, textAlign: 'center', fontSize: '18px', margin: 0 }}>My Vouchers</h1>
          <div style={{ width: '24px' }}></div>
        </div>

        {/* Content */}
        <div style={{ padding: '16px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>Loading vouchers...</div>
          ) : coupons.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#666' }}>
              <Ticket size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
              <p>You don't have any active vouchers right now.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {coupons.map((coupon) => (
                <div key={coupon.id} style={{ 
                  background: '#fff', 
                  borderRadius: '12px', 
                  display: 'flex', 
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {/* Left Side (Discount) */}
                  <div style={{ 
                    background: '#ff4444', 
                    color: '#fff', 
                    padding: '20px 16px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    minWidth: '100px'
                  }}>
                    <span style={{ fontSize: '28px', fontWeight: 'bold', lineHeight: 1 }}>{coupon.discount_percent}%</span>
                    <span style={{ fontSize: '12px', fontWeight: 'bold' }}>OFF</span>
                  </div>
                  
                  {/* Right Side (Details) */}
                  <div style={{ padding: '20px 16px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '4px' }}>Storewide Discount</div>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '12px' }}>Valid for all items</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ 
                        background: '#ffeeee', 
                        color: '#ff4444', 
                        padding: '4px 8px', 
                        borderRadius: '4px', 
                        fontSize: '12px', 
                        fontWeight: 'bold',
                        letterSpacing: '1px'
                      }}>
                        {coupon.code}
                      </div>
                      <Link to="/" style={{ 
                        background: '#000', 
                        color: '#fff', 
                        padding: '6px 12px', 
                        borderRadius: '16px', 
                        fontSize: '12px', 
                        textDecoration: 'none',
                        fontWeight: 'bold'
                      }}>
                        Use Now
                      </Link>
                    </div>
                  </div>
                  
                  {/* Jagged Edge Effect (Optional Visual Polish) */}
                  <div style={{
                    position: 'absolute',
                    left: '96px',
                    top: 0,
                    bottom: 0,
                    width: '8px',
                    background: 'radial-gradient(circle at 0 50%, transparent 4px, #fff 4.5px) 0 0/8px 12px',
                    transform: 'rotate(180deg)'
                  }}></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Vouchers;
