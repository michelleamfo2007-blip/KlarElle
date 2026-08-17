import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Search, DollarSign, CreditCard, TrendingUp, Download } from 'lucide-react';

function SuperPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    totalTransactions: 0,
    avgTransactionValue: 0
  });

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    
    // We'll treat every order as a transaction for this overview
    const { data, error } = await supabase
      .from('orders')
      .select('id, customer_name, customer_email, total_amount, status, created_at')
      .order('created_at', { ascending: false });

    if (data && !error) {
      setPayments(data);
      
      const totalRevenue = data.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0);
      const totalTransactions = data.length;
      const avgTransactionValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
      
      setMetrics({
        totalRevenue,
        totalTransactions,
        avgTransactionValue
      });
    }
    
    setLoading(false);
  };

  const formatUSD = (amount) => `$${parseFloat(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const filteredPayments = payments.filter(p => 
    (p.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.customer_email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.id || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', fontFamily: 'Inter, sans-serif', color: '#111827' }}>
      <div className="admin-header-flex" style={{ marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 8px 0', color: '#111827' }}>Payments & Transactions</h1>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>Overview of all platform revenue and order transactions.</p>
        </div>
        <button 
          onClick={() => alert("Export functionality coming soon!")}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: '#fff', color: '#111827', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
        >
          <Download size={16} /> Export CSV
        </button>
      </div>

      {/* KPI Grid */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #D2C4B3', boxShadow: '0 4px 15px rgba(188, 163, 143, 0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ color: '#BCA38F', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Revenue</div>
            <div style={{ background: '#FAF9F6', padding: '8px', borderRadius: '8px' }}><DollarSign size={20} color="#111827" /></div>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827' }}>{loading ? '...' : formatUSD(metrics.totalRevenue)}</div>
        </div>

        <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #D2C4B3', boxShadow: '0 4px 15px rgba(188, 163, 143, 0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ color: '#BCA38F', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Transactions</div>
            <div style={{ background: '#FAF9F6', padding: '8px', borderRadius: '8px' }}><CreditCard size={20} color="#111827" /></div>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827' }}>{loading ? '...' : metrics.totalTransactions}</div>
        </div>

        <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #D2C4B3', boxShadow: '0 4px 15px rgba(188, 163, 143, 0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ color: '#BCA38F', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Avg. Transaction Value</div>
            <div style={{ background: '#FAF9F6', padding: '8px', borderRadius: '8px' }}><TrendingUp size={20} color="#111827" /></div>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827' }}>{loading ? '...' : formatUSD(metrics.avgTransactionValue)}</div>
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '20px', marginBottom: '24px' }}>
        <div className="flex-column-mobile" style={{ gap: '16px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, width: '100%', maxWidth: '400px' }}>
            <Search size={18} color="#9ca3af" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Search payments by customer, email or ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1px solid #d1d5db', borderRadius: '6px', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ color: '#6b7280', fontSize: '14px' }}>
            Showing {filteredPayments.length} Transactions
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="table-responsive-wrapper" style={{ background: '#fff', borderRadius: '8px', border: '1px solid #D2C4B3', boxShadow: '0 4px 15px rgba(188, 163, 143, 0.1)' }}>
        <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: '#FAF9F6', borderBottom: '1px solid #D2C4B3' }}>
            <tr>
              <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#BCA38F', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Order ID</th>
              <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#BCA38F', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Customer</th>
              <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#BCA38F', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</th>
              <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#BCA38F', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Amount</th>
              <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#BCA38F', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>Loading payments...</td>
              </tr>
            ) : filteredPayments.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>No payments found.</td>
              </tr>
            ) : (
              filteredPayments.map((payment, index) => (
                <tr key={payment.id || index} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '16px 24px', fontWeight: '600', color: '#111827', fontSize: '14px' }}>
                    {payment.id ? payment.id.split('-')[0].toUpperCase() : 'N/A'}
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ fontWeight: '500', color: '#111827', fontSize: '14px' }}>{payment.customer_name || 'Anonymous'}</div>
                    <div style={{ color: '#6b7280', fontSize: '13px' }}>{payment.customer_email || 'No email provided'}</div>
                  </td>
                  <td style={{ padding: '16px 24px', color: '#6b7280', fontSize: '14px' }}>
                    {new Date(payment.created_at).toLocaleString()}
                  </td>
                  <td style={{ padding: '16px 24px', fontWeight: '600', color: '#111827', fontSize: '14px' }}>
                    {formatUSD(payment.total_amount)}
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{ 
                      padding: '4px 10px', 
                      borderRadius: '100px', 
                      fontSize: '12px', 
                      fontWeight: '600',
                      background: payment.status === 'Refunded' || payment.status === 'Cancelled' ? '#fee2e2' : '#dcfce7',
                      color: payment.status === 'Refunded' || payment.status === 'Cancelled' ? '#991b1b' : '#166534'
                    }}>
                      {payment.status === 'Refunded' ? 'Refunded' : payment.status === 'Cancelled' ? 'Cancelled' : 'Paid'}
                    </span>
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

export default SuperPayments;
