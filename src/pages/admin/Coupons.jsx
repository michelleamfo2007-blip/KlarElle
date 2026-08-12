import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Trash2, Tag, Percent } from 'lucide-react';

function Coupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newCoupon, setNewCoupon] = useState({ code: '', discount_percent: 10, is_active: true });

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
    
    const { error } = await supabase
      .from('coupons')
      .insert([{ 
        code: cleanCode, 
        discount_percent: newCoupon.discount_percent,
        is_active: newCoupon.is_active
      }]);
      
    if (!error) {
      setNewCoupon({ code: '', discount_percent: 10, is_active: true });
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
    <div className="admin-page">
      <div className="admin-header">
        <h2>Manage Coupons</h2>
        <button className="admin-btn primary" onClick={() => setShowAdd(!showAdd)}>
          <Plus size={16} /> {showAdd ? 'Cancel' : 'New Coupon'}
        </button>
      </div>

      {showAdd && (
        <div className="admin-card" style={{ marginBottom: '24px' }}>
          <h3>Create New Coupon</h3>
          <form onSubmit={handleAddCoupon} style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap', marginTop: '16px' }}>
            <div className="form-group" style={{ flex: 1, minWidth: '200px', marginBottom: 0 }}>
              <label>Coupon Code (e.g. SUMMER20)</label>
              <input 
                type="text" 
                className="form-input" 
                value={newCoupon.code}
                onChange={e => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})}
                required
              />
            </div>
            <div className="form-group" style={{ flex: 1, minWidth: '150px', marginBottom: 0 }}>
              <label>Discount Percentage (%)</label>
              <input 
                type="number" 
                className="form-input" 
                value={newCoupon.discount_percent}
                onChange={e => setNewCoupon({...newCoupon, discount_percent: parseInt(e.target.value)})}
                min="1" max="100"
                required
              />
            </div>
            <button type="submit" className="admin-btn primary">Save Coupon</button>
          </form>
        </div>
      )}

      <div className="admin-card p-0">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Discount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.length === 0 ? (
              <tr><td colSpan="4" style={{ textAlign: 'center', padding: '24px' }}>No coupons found. Create one above!</td></tr>
            ) : (
              coupons.map(coupon => (
                <tr key={coupon.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
                      <Tag size={14} color="#666" />
                      {coupon.code}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {coupon.discount_percent}<Percent size={12} /> OFF
                    </div>
                  </td>
                  <td>
                    <span 
                      className={`status-badge ${coupon.is_active ? 'active' : 'inactive'}`}
                      onClick={() => toggleStatus(coupon.id, coupon.is_active)}
                      style={{ cursor: 'pointer' }}
                      title="Click to toggle status"
                    >
                      {coupon.is_active ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-btn delete" onClick={() => handleDelete(coupon.id)} title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Coupons;
