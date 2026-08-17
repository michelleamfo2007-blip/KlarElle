import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';
import { AlertTriangle, Package, Ticket, Users, ArrowRight, Bell, CheckCircle } from 'lucide-react';

function SuperNotifications() {
  const [loading, setLoading] = useState(true);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [urgentTickets, setUrgentTickets] = useState([]);
  const [pendingWaitlist, setPendingWaitlist] = useState([]);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    setLoading(true);

    const [stockRes, ticketsRes, waitlistRes] = await Promise.all([
      supabase.from('products').select('id, name, stock').lte('stock', 5).order('stock', { ascending: true }),
      supabase.from('support_tickets').select('id, subject, customer_name, created_at').eq('status', 'Open').eq('priority', 'High').order('created_at', { ascending: false }),
      supabase.from('waitlist').select('id, email, created_at').eq('status', 'Pending').order('created_at', { ascending: true })
    ]);

    if (stockRes.data) setLowStockProducts(stockRes.data);
    if (ticketsRes.data) setUrgentTickets(ticketsRes.data);
    if (waitlistRes.data) setPendingWaitlist(waitlistRes.data);

    setLoading(false);
  };

  const totalAlerts = lowStockProducts.length + urgentTickets.length + pendingWaitlist.length;

  if (loading) {
    return <div style={{ padding: '60px', textAlign: 'center', color: '#6b7280', fontFamily: 'Inter, sans-serif' }}>Loading alerts...</div>;
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', fontFamily: 'Inter, sans-serif', color: '#111827' }}>
      <div className="admin-header-flex">
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell size={24} /> System Alerts
            {totalAlerts > 0 && (
              <span style={{ background: '#ef4444', color: '#fff', fontSize: '12px', padding: '2px 8px', borderRadius: '100px', marginLeft: '8px' }}>
                {totalAlerts}
              </span>
            )}
          </h1>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>Critical events requiring your attention.</p>
        </div>
      </div>

      {totalAlerts === 0 ? (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '40px', borderRadius: '8px', textAlign: 'center' }}>
          <CheckCircle size={48} color="#22c55e" style={{ margin: '0 auto 16px auto' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#166534', margin: '0 0 8px 0' }}>All Caught Up!</h3>
          <p style={{ color: '#15803d', margin: 0 }}>There are no critical system alerts at this time.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Low Stock Alerts */}
          {lowStockProducts.length > 0 && (
            <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
              <div style={{ background: '#fef2f2', padding: '16px 24px', borderBottom: '1px solid #fee2e2', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={20} color="#dc2626" />
                <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#991b1b', margin: 0 }}>Low Stock Alert ({lowStockProducts.length})</h2>
              </div>
              <div style={{ padding: '0 24px' }}>
                {lowStockProducts.map((product, index) => (
                  <div key={product.id} className="flex-column-mobile" style={{ padding: '16px 0', borderBottom: index < lowStockProducts.length - 1 ? '1px solid #f3f4f6' : 'none', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ background: '#f3f4f6', padding: '8px', borderRadius: '6px' }}><Package size={16} color="#4b5563" /></div>
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '14px' }}>{product.name}</div>
                        <div style={{ fontSize: '13px', color: '#dc2626', fontWeight: '500' }}>Only {product.stock} left in stock</div>
                      </div>
                    </div>
                    <Link to={`/super-admin/products/edit/${product.id}`} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#2563eb', textDecoration: 'none', fontWeight: '500' }}>
                      Update Inventory <ArrowRight size={14} />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Urgent Support Tickets */}
          {urgentTickets.length > 0 && (
            <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
              <div style={{ background: '#fffbeb', padding: '16px 24px', borderBottom: '1px solid #fef3c7', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Ticket size={20} color="#d97706" />
                <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#b45309', margin: 0 }}>Urgent Support Tickets ({urgentTickets.length})</h2>
              </div>
              <div style={{ padding: '0 24px' }}>
                {urgentTickets.map((ticket, index) => (
                  <div key={ticket.id} className="flex-column-mobile" style={{ padding: '16px 0', borderBottom: index < urgentTickets.length - 1 ? '1px solid #f3f4f6' : 'none', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '14px' }}>{ticket.subject}</div>
                      <div style={{ fontSize: '13px', color: '#6b7280' }}>From {ticket.customer_name} • {new Date(ticket.created_at).toLocaleString()}</div>
                    </div>
                    <Link to="/super-admin/support" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#2563eb', textDecoration: 'none', fontWeight: '500' }}>
                      View Ticket <ArrowRight size={14} />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pending Waitlist */}
          {pendingWaitlist.length > 0 && (
            <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
              <div style={{ background: '#f8fafc', padding: '16px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={20} color="#475569" />
                <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#334155', margin: 0 }}>Pending Waitlist Approvals ({pendingWaitlist.length})</h2>
              </div>
              <div style={{ padding: '0 24px' }}>
                {pendingWaitlist.slice(0, 5).map((user, index) => (
                  <div key={user.id} className="flex-column-mobile" style={{ padding: '16px 0', borderBottom: index < Math.min(pendingWaitlist.length, 5) - 1 ? '1px solid #f3f4f6' : 'none', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '14px' }}>{user.email}</div>
                      <div style={{ fontSize: '13px', color: '#6b7280' }}>Waiting since {new Date(user.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                ))}
                {pendingWaitlist.length > 5 && (
                  <div style={{ padding: '12px 0', fontSize: '13px', color: '#6b7280', fontStyle: 'italic' }}>
                    + {pendingWaitlist.length - 5} more pending requests
                  </div>
                )}
                <div style={{ padding: '16px 0', borderTop: '1px solid #f3f4f6' }}>
                  <Link to="/super-admin/waitlist" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#2563eb', textDecoration: 'none', fontWeight: '500' }}>
                    Manage Waitlist <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}

export default SuperNotifications;
