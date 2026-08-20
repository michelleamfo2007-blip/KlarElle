import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { ChevronLeft, Package, Clock, CheckCircle, Truck, AlertCircle } from 'lucide-react';

function ReturnDetails() {
  const { id } = useParams();
  const { session } = useAuth();
  
  const [returnReq, setReturnReq] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [submittingTracking, setSubmittingTracking] = useState(false);

  useEffect(() => {
    fetchReturnDetails();
  }, [id]);

  const fetchReturnDetails = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('return_requests')
      .select('*')
      .eq('id', id)
      .eq('customer_email', session?.user?.email)
      .single();
      
    if (data) {
      setReturnReq(data);
    }
    setLoading(false);
  };

  const handleTrackingSubmit = async (e) => {
    e.preventDefault();
    if (!trackingNumber) return;
    
    setSubmittingTracking(true);
    try {
      const { error } = await supabase
        .from('return_requests')
        .update({ 
          tracking_number: trackingNumber,
          status: 'In Transit'
        })
        .eq('id', id);

      if (error) throw error;
      
      // Trigger email API
      await fetch('/api/send-return-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: session.user.email,
          returnId: id,
          status: 'In Transit'
        })
      });

      fetchReturnDetails();
    } catch (err) {
      console.error('Error saving tracking number:', err);
      alert('Failed to save tracking number.');
    } finally {
      setSubmittingTracking(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Approved': return '#2563eb'; // blue
      case 'Rejected': return '#dc2626'; // red
      case 'In Transit': return '#f59e0b'; // amber
      case 'Received': return '#10b981'; // green
      case 'Refunded': return '#059669'; // darker green
      default: return '#6b7280'; // gray (Pending Review)
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading return details...</div>;
  if (!returnReq) return <div style={{ padding: '40px', textAlign: 'center' }}>Return request not found.</div>;

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh', fontFamily: '-apple-system, sans-serif' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', background: '#fff', minHeight: '100vh', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
          <Link to="/profile/orders?status=returned" style={{ color: 'inherit' }}>
            <ChevronLeft size={24} style={{ cursor: 'pointer' }} />
          </Link>
          <h1 style={{ flex: 1, textAlign: 'center', fontSize: '18px', margin: 0 }}>Return Details</h1>
          <div style={{ width: '24px' }}></div>
        </div>

        <div style={{ background: '#fafafa', border: '1px solid #eee', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '12px', color: '#666', fontWeight: 'bold' }}>
              ID: {returnReq.id.substring(0, 8).toUpperCase()}
            </span>
            <span style={{ 
              padding: '6px 12px', 
              borderRadius: '20px', 
              fontSize: '12px', 
              fontWeight: 'bold',
              background: `${getStatusColor(returnReq.status)}15`,
              color: getStatusColor(returnReq.status)
            }}>
              {returnReq.status}
            </span>
          </div>
          
          <div style={{ fontSize: '14px', color: '#333', marginBottom: '8px' }}>
            <strong>Reason:</strong> {returnReq.reason}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            Requested on {new Date(returnReq.created_at).toLocaleDateString()}
          </div>
        </div>

        <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>Items to Return</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
          {returnReq.items.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '16px', padding: '12px', border: '1px solid #eee', borderRadius: '8px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{item.name}</div>
                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                  {item.color} | {item.size}
                </div>
              </div>
            </div>
          ))}
        </div>

        {returnReq.status === 'Approved' && (
          <div style={{ background: '#eff6ff', padding: '20px', borderRadius: '12px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', color: '#1e3a8a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={18} /> Return Approved
            </h3>
            <p style={{ fontSize: '14px', color: '#1e40af', marginBottom: '16px', lineHeight: '1.5' }}>
              Please ship your return to the address provided in your email. Once shipped, enter the tracking number below.
            </p>
            <form onSubmit={handleTrackingSubmit} style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="text" 
                placeholder="Enter Tracking Number"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                required
                style={{ flex: 1, padding: '10px 14px', border: '1px solid #bfdbfe', borderRadius: '8px', fontSize: '14px' }}
              />
              <button 
                type="submit"
                disabled={submittingTracking}
                style={{ padding: '10px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: submittingTracking ? 'not-allowed' : 'pointer' }}
              >
                Submit
              </button>
            </form>
          </div>
        )}

        {(returnReq.status === 'In Transit' || returnReq.status === 'Received' || returnReq.status === 'Refunded') && returnReq.tracking_number && (
          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '14px', color: '#475569', marginBottom: '4px' }}>Tracking Information</h3>
            <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>{returnReq.tracking_number}</p>
          </div>
        )}

      </div>
    </div>
  );
}

export default ReturnDetails;
