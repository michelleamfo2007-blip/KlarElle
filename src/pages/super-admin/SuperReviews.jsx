import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Star, CheckCircle, XCircle, Trash2, Search, Filter } from 'lucide-react';

function SuperReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('product_reviews')
      .select('*, products(name, image_url)')
      .order('created_at', { ascending: false });
      
    if (data) setReviews(data);
    setLoading(false);
  };

  const updateStatus = async (id, status) => {
    // Optimistic UI update
    setReviews(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    
    const { error } = await supabase
      .from('product_reviews')
      .update({ status })
      .eq('id', id);
      
    if (error) {
      alert('Failed to update review status. Did you run the setup_reviews_status.sql script?');
      fetchReviews();
    }
  };

  const deleteReview = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this review?')) return;
    
    setReviews(prev => prev.filter(r => r.id !== id));
    
    await supabase.from('product_reviews').delete().eq('id', id);
  };

  const filteredReviews = reviews.filter(r => {
    const matchesSearch = (r.user_name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (r.text || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (r.products?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' ? true : (r.status || 'Approved') === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', fontFamily: 'Inter, sans-serif', color: '#111827' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 4px 0' }}>Customer Reviews</h1>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>Moderate and manage product reviews.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} color="#9ca3af" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Search reviews..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: '8px 12px 8px 36px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', outline: 'none', width: '250px' }}
            />
          </div>
          <select 
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', outline: 'none', background: '#fff' }}
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="table-responsive-wrapper" style={{ background: '#fff', borderRadius: '8px', border: '1px solid #D2C4B3', boxShadow: '0 4px 15px rgba(188, 163, 143, 0.1)', overflow: 'hidden' }}>
        <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#FAF9F6', borderBottom: '1px solid #D2C4B3' }}>
              <th style={{ padding: '12px 20px', fontSize: '12px', textTransform: 'uppercase', color: '#BCA38F', fontWeight: '600', letterSpacing: '0.5px' }}>Product & Review</th>
              <th style={{ padding: '12px 20px', fontSize: '12px', textTransform: 'uppercase', color: '#BCA38F', fontWeight: '600', letterSpacing: '0.5px' }}>Customer</th>
              <th style={{ padding: '12px 20px', fontSize: '12px', textTransform: 'uppercase', color: '#BCA38F', fontWeight: '600', letterSpacing: '0.5px' }}>Status</th>
              <th style={{ padding: '12px 20px', fontSize: '12px', textTransform: 'uppercase', color: '#BCA38F', fontWeight: '600', letterSpacing: '0.5px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#BCA38F' }}>Loading reviews...</td></tr>
            ) : filteredReviews.length === 0 ? (
              <tr><td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>No reviews found matching criteria.</td></tr>
            ) : (
              filteredReviews.map(review => (
                <tr key={review.id} style={{ borderBottom: '1px solid #FAF9F6' }}>
                  <td style={{ padding: '20px', maxWidth: '400px' }}>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '4px', background: '#f3f4f6', overflow: 'hidden', flexShrink: 0 }}>
                        {review.products?.image_url && <img src={review.products.image_url} alt="Product" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', marginBottom: '4px' }}>{review.products?.name || 'Unknown Product'}</div>
                        <div style={{ display: 'flex', color: '#fcc419', marginBottom: '4px' }}>
                          {[1, 2, 3, 4, 5].map(s => <Star key={s} size={12} fill={s <= review.rating ? "currentColor" : "none"} stroke="currentColor" />)}
                        </div>
                        <div style={{ fontSize: '14px', lineHeight: '1.4', fontWeight: '500' }}>"{review.text}"</div>
                        <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>Size: {review.size_bought || 'N/A'} | Color: {review.color_bought || 'N/A'} | Fit: {review.fit || 'N/A'}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '20px' }}>
                    <div style={{ fontWeight: '600' }}>{review.user_name || 'Anonymous'}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>{new Date(review.created_at).toLocaleDateString()}</div>
                  </td>
                  <td style={{ padding: '20px' }}>
                    {(() => {
                      const status = review.status || 'Approved'; // Default to approved for older reviews
                      if (status === 'Approved') return <span style={{ background: '#dcfce7', color: '#166534', padding: '4px 8px', borderRadius: '100px', fontSize: '12px', fontWeight: '600' }}>Approved</span>;
                      if (status === 'Pending') return <span style={{ background: '#fef9c3', color: '#854d0e', padding: '4px 8px', borderRadius: '100px', fontSize: '12px', fontWeight: '600' }}>Pending</span>;
                      if (status === 'Rejected') return <span style={{ background: '#fee2e2', color: '#991b1b', padding: '4px 8px', borderRadius: '100px', fontSize: '12px', fontWeight: '600' }}>Rejected</span>;
                      return status;
                    })()}
                  </td>
                  <td style={{ padding: '20px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      {(review.status || 'Approved') !== 'Approved' && (
                        <button onClick={() => updateStatus(review.id, 'Approved')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '4px', background: '#dcfce7', color: '#166534', border: 'none', cursor: 'pointer' }} title="Approve">
                          <CheckCircle size={16} />
                        </button>
                      )}
                      {(review.status || 'Approved') !== 'Rejected' && (
                        <button onClick={() => updateStatus(review.id, 'Rejected')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '4px', background: '#fef9c3', color: '#854d0e', border: 'none', cursor: 'pointer' }} title="Reject">
                          <XCircle size={16} />
                        </button>
                      )}
                      <button onClick={() => deleteReview(review.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '4px', background: '#fee2e2', color: '#991b1b', border: 'none', cursor: 'pointer' }} title="Delete">
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

export default SuperReviews;
