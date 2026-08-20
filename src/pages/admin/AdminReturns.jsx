import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Package, Search, Filter, Eye, Check, X, Truck, CreditCard } from 'lucide-react';

function AdminReturns() {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    fetchReturns();
  }, []);

  const fetchReturns = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('return_requests')
      .select('*, order:orders(id, created_at, status, customer_name, customer_email, shipping_address)')
      .order('created_at', { ascending: false });
      
    if (data) setReturns(data);
    if (error) console.error("Error fetching returns:", error);
    setLoading(false);
  };

  const updateReturnStatus = async (id, status, details = '') => {
    setProcessingId(id);
    try {
      const { error } = await supabase
        .from('return_requests')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      
      const targetReturn = returns.find(r => r.id === id);
      
      // Send email
      await fetch('/api/send-return-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: targetReturn.customer_email,
          returnId: id,
          status: status,
          details: details
        })
      });

      // Update local state
      setReturns(returns.map(r => r.id === id ? { ...r, status } : r));
      
      if (selectedReturn?.id === id) {
        setSelectedReturn({ ...selectedReturn, status });
      }
      
      if (status === 'Rejected') {
        setShowRejectModal(false);
        setRejectReason('');
      }

    } catch (err) {
      console.error('Error updating return status:', err);
      alert('Failed to update return status.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleApprove = (id) => updateReturnStatus(id, 'Approved');
  
  const handleRejectClick = (id) => {
    setProcessingId(id);
    setShowRejectModal(true);
  };
  
  const confirmReject = () => {
    if (!rejectReason) {
      alert("Please provide a reason for rejection.");
      return;
    }
    updateReturnStatus(processingId, 'Rejected', rejectReason);
  };

  const handleMarkReceived = (id) => updateReturnStatus(id, 'Received');
  
  const handleRefundProcessed = (id) => updateReturnStatus(id, 'Refunded');

  const filteredReturns = returns.filter(r => {
    const matchesSearch = r.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.customer_email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || r.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    let bg = '#f3f4f6', color = '#374151';
    switch(status) {
      case 'Pending Review': bg = '#fef3c7'; color = '#92400e'; break;
      case 'Approved': bg = '#dbeafe'; color = '#1e40af'; break;
      case 'Rejected': bg = '#fee2e2'; color = '#991b1b'; break;
      case 'In Transit': bg = '#fef9c3'; color = '#854d0e'; break;
      case 'Received': bg = '#dcfce7'; color = '#166534'; break;
      case 'Refunded': bg = '#dcfce7'; color = '#166534'; break;
    }
    return <span style={{ padding: '4px 10px', borderRadius: '100px', fontSize: '12px', fontWeight: 'bold', background: bg, color: color }}>{status}</span>;
  };

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', color: '#111827' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Returns</h1>
        
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} color="#9ca3af" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Search returns..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: '8px 16px 8px 36px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', width: '250px', outline: 'none' }}
            />
          </div>
          
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '0 12px', background: '#fff' }}>
            <Filter size={16} color="#6b7280" style={{ marginRight: '8px' }} />
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '14px', color: '#374151', cursor: 'pointer', appearance: 'none', paddingRight: '16px' }}
            >
              <option value="All">All Statuses</option>
              <option value="Pending Review">Pending Review</option>
              <option value="Approved">Approved</option>
              <option value="In Transit">In Transit</option>
              <option value="Received">Received</option>
              <option value="Refunded">Refunded</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px' }}>
        
        {/* Returns List */}
        <div style={{ flex: selectedReturn ? '1' : '100%', background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
                <th style={{ padding: '16px', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Return ID</th>
                <th style={{ padding: '16px', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Customer</th>
                <th style={{ padding: '16px', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Items</th>
                <th style={{ padding: '16px', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '16px', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: '#6b7280' }}>Loading returns...</td></tr>
              ) : filteredReturns.length === 0 ? (
                <tr><td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: '#6b7280' }}>No returns found.</td></tr>
              ) : (
                filteredReturns.map(ret => (
                  <tr key={ret.id} style={{ borderBottom: '1px solid #e5e7eb', cursor: 'pointer', background: selectedReturn?.id === ret.id ? '#f3f4f6' : '#fff' }} onClick={() => setSelectedReturn(ret)}>
                    <td style={{ padding: '16px', fontSize: '14px', fontWeight: '500' }}>#{ret.id.substring(0, 8).toUpperCase()}</td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontSize: '14px', fontWeight: '500' }}>{ret.order?.customer_name || 'N/A'}</div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>{ret.customer_email}</div>
                    </td>
                    <td style={{ padding: '16px', fontSize: '14px', color: '#4b5563' }}>{ret.items.length} item(s)</td>
                    <td style={{ padding: '16px' }}>{getStatusBadge(ret.status)}</td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedReturn(ret); }}
                        style={{ padding: '6px 12px', background: '#fff', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '12px', fontWeight: '500', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Eye size={14} /> View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Return Details Panel */}
        {selectedReturn && (
          <div style={{ width: '400px', background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>Return Details</h2>
              <button onClick={() => setSelectedReturn(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}><X size={20} /></button>
            </div>
            
            <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', fontWeight: '600' }}>Return ID</div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold' }}>#{selectedReturn.id.substring(0, 8).toUpperCase()}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', fontWeight: '600', textAlign: 'right' }}>Status</div>
                  <div>{getStatusBadge(selectedReturn.status)}</div>
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Customer</div>
                <div style={{ fontSize: '14px' }}>{selectedReturn.order?.customer_name}</div>
                <div style={{ fontSize: '14px', color: '#4b5563' }}>{selectedReturn.customer_email}</div>
                <div style={{ fontSize: '14px', color: '#4b5563', marginTop: '4px' }}>Order #{selectedReturn.order_id.substring(0,8).toUpperCase()}</div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Reason for Return</div>
                <div style={{ padding: '12px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', color: '#374151' }}>
                  {selectedReturn.reason}
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Items to Return</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedReturn.items.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '13px' }}>
                      <div>
                        <div style={{ fontWeight: '500' }}>{item.name}</div>
                        <div style={{ color: '#6b7280' }}>{item.color} | {item.size}</div>
                      </div>
                      <div style={{ fontWeight: '600' }}>${item.price}</div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedReturn.photos && selectedReturn.photos.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Customer Photos</div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {selectedReturn.photos.map((url, idx) => (
                      <a key={idx} href={url} target="_blank" rel="noopener noreferrer">
                        <img src={url} alt="Return Evidence" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #e5e7eb' }} />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {selectedReturn.tracking_number && (
                <div style={{ marginBottom: '24px', padding: '16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                  <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', marginBottom: '4px' }}>Return Tracking Number</div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a' }}>{selectedReturn.tracking_number}</div>
                </div>
              )}

            </div>
            
            {/* Action Buttons */}
            <div style={{ padding: '20px', borderTop: '1px solid #e5e7eb', background: '#f9fafb', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {selectedReturn.status === 'Pending Review' && (
                <>
                  <button 
                    onClick={() => handleApprove(selectedReturn.id)}
                    disabled={processingId === selectedReturn.id}
                    style={{ width: '100%', padding: '10px', background: '#111827', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: processingId ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                  >
                    <Check size={16} /> Approve Return
                  </button>
                  <button 
                    onClick={() => handleRejectClick(selectedReturn.id)}
                    disabled={processingId === selectedReturn.id}
                    style={{ width: '100%', padding: '10px', background: '#fff', color: '#dc2626', border: '1px solid #dc2626', borderRadius: '6px', fontWeight: '600', cursor: processingId ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                  >
                    <X size={16} /> Reject Return
                  </button>
                </>
              )}
              
              {selectedReturn.status === 'In Transit' && (
                <button 
                  onClick={() => handleMarkReceived(selectedReturn.id)}
                  disabled={processingId === selectedReturn.id}
                  style={{ width: '100%', padding: '10px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: processingId ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                >
                  <Truck size={16} /> Mark as Received
                </button>
              )}
              
              {selectedReturn.status === 'Received' && (
                <button 
                  onClick={() => handleRefundProcessed(selectedReturn.id)}
                  disabled={processingId === selectedReturn.id}
                  style={{ width: '100%', padding: '10px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: processingId ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                >
                  <CreditCard size={16} /> Mark as Refund Processed
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', width: '400px', borderRadius: '12px', padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 16px 0' }}>Reject Return</h3>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>Please provide a reason for rejecting this return request. This will be sent to the customer.</p>
            <textarea 
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Return request is outside the 14-day policy."
              style={{ width: '100%', height: '100px', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', resize: 'none' }}
            />
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => { setShowRejectModal(false); setProcessingId(null); setRejectReason(''); }}
                style={{ padding: '8px 16px', background: '#fff', border: '1px solid #d1d5db', borderRadius: '6px', fontWeight: '500', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                onClick={confirmReject}
                style={{ padding: '8px 16px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}
              >
                Reject Request
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default AdminReturns;
