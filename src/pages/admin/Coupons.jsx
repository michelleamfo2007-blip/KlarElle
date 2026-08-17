import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Trash2, Tag, Percent, Calendar, Users } from 'lucide-react';

function Coupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newCoupon, setNewCoupon] = useState({ 
    code: '', 
    discount_percent: 10, 
    is_active: true,
    expires_at: '',
    usage_limit: ''
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (!error && data) {
      setCoupons(data);
    }
    setLoading(false);
  };

  const handleAddCoupon = async (e) => {
    e.preventDefault();
    if (!newCoupon.code) return;
    
    // Convert code to uppercase and remove spaces
    const cleanCode = newCoupon.code.toUpperCase().replace(/\s+/g, '');
    
    const insertData = { 
      code: cleanCode, 
      discount_percent: newCoupon.discount_percent,
      is_active: newCoupon.is_active
    };

    if (newCoupon.expires_at) {
      insertData.expires_at = new Date(newCoupon.expires_at).toISOString();
    }
    if (newCoupon.usage_limit) {
      insertData.usage_limit = parseInt(newCoupon.usage_limit);
    }
    
    const { error } = await supabase.from('coupons').insert([insertData]);
      
    if (!error) {
      setNewCoupon({ code: '', discount_percent: 10, is_active: true, expires_at: '', usage_limit: '' });
      setShowAdd(false);
      fetchCoupons();
    } else {
      alert("Error adding coupon (maybe the code already exists?)");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      const { error } = await supabase.from('coupons').delete().eq('id', id);
      if (!error) fetchCoupons();
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    const { error } = await supabase.from('coupons').update({ is_active: !currentStatus }).eq('id', id);
    if (!error) fetchCoupons();
  };

  if (loading) return <div className="admin-loading">Loading coupons...</div>;

  return (
    <div className="admin-page" style={{ maxWidth: '1200px', margin: '0 auto', fontFamily: 'Inter, sans-serif', color: '#111827', padding: '24px' }}>
      <div className="admin-header-flex">
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 4px 0' }}>Manage Coupons</h2>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>Create promo codes for your customers.</p>
        </div>
        <button 
          style={{ padding: '10px 16px', background: '#000', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          onClick={() => setShowAdd(!showAdd)}
        >
          <Plus size={16} /> {showAdd ? 'Cancel' : 'New Coupon'}
        </button>
      </div>

      {showAdd && (
        <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '24px', marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600' }}>Create New Coupon</h3>
          <form onSubmit={handleAddCoupon} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', alignItems: 'flex-end' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>Coupon Code</label>
              <input 
                type="text" 
                value={newCoupon.code}
                onChange={e => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})}
                placeholder="e.g. SUMMER20"
                required
                style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>Discount (%)</label>
              <input 
                type="number" 
                value={newCoupon.discount_percent}
                onChange={e => setNewCoupon({...newCoupon, discount_percent: parseInt(e.target.value)})}
                min="1" max="100"
                required
                style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>Expiration Date (Optional)</label>
              <input 
                type="datetime-local" 
                value={newCoupon.expires_at}
                onChange={e => setNewCoupon({...newCoupon, expires_at: e.target.value})}
                style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>Usage Limit (Optional)</label>
              <input 
                type="number" 
                value={newCoupon.usage_limit}
                onChange={e => setNewCoupon({...newCoupon, usage_limit: e.target.value})}
                placeholder="e.g. 100"
                min="1"
                style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <button type="submit" style={{ padding: '10px 16px', background: '#000', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', height: '42px' }}>
              Save Coupon
            </button>
          </form>
        </div>
      )}

      <div className="table-responsive-wrapper" style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
        <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ padding: '12px 24px', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Code</th>
              <th style={{ padding: '12px 24px', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Discount</th>
              <th style={{ padding: '12px 24px', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Usage Limit</th>
              <th style={{ padding: '12px 24px', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Expires</th>
              <th style={{ padding: '12px 24px', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Status</th>
              <th style={{ padding: '12px 24px', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>No coupons found. Create one above!</td></tr>
            ) : (
              coupons.map(coupon => {
                const isExpired = coupon.expires_at && new Date(coupon.expires_at) < new Date();
                const isMaxedOut = coupon.usage_limit && coupon.times_used >= coupon.usage_limit;
                return (
                  <tr key={coupon.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '14px' }}>
                        <Tag size={16} color="#9ca3af" />
                        {coupon.code}
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', fontWeight: '600', color: '#16a34a' }}>
                        {coupon.discount_percent}<Percent size={14} /> OFF
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ fontSize: '13px', color: '#4b5563', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Users size={14} color="#9ca3af" />
                        {coupon.usage_limit ? `${coupon.times_used} / ${coupon.usage_limit}` : `${coupon.times_used} (Unlimited)`}
                        {isMaxedOut && <span style={{ color: '#dc2626', fontSize: '11px', fontWeight: 'bold' }}>(Maxed)</span>}
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ fontSize: '13px', color: '#4b5563', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {coupon.expires_at ? (
                          <>
                            <Calendar size={14} color="#9ca3af" />
                            {new Date(coupon.expires_at).toLocaleDateString()}
                            {isExpired && <span style={{ color: '#dc2626', fontSize: '11px', fontWeight: 'bold' }}>(Expired)</span>}
                          </>
                        ) : 'Never'}
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <span 
                        onClick={() => toggleStatus(coupon.id, coupon.is_active)}
                        style={{ 
                          cursor: 'pointer',
                          padding: '4px 10px', 
                          borderRadius: '100px', 
                          fontSize: '12px', 
                          fontWeight: '600',
                          background: coupon.is_active ? '#dcfce7' : '#fee2e2',
                          color: coupon.is_active ? '#166534' : '#991b1b',
                          display: 'inline-block'
                        }}
                      >
                        {coupon.is_active ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <button onClick={() => handleDelete(coupon.id)} style={{ padding: '6px', background: 'transparent', border: 'none', color: '#dc2626', cursor: 'pointer' }} title="Delete">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Coupons;
