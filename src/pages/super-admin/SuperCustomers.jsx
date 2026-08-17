import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, Search, Mail } from 'lucide-react';
import '../admin/Admin.css';

function SuperCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    // Fetch from orders to get all unique customers (both guest and registered)
    const { data: orders, error } = await supabase
      .from('orders')
      .select('customer_email, customer_name, total_amount, created_at, id')
      .order('created_at', { ascending: false });

    if (orders) {
      const customerMap = {};
      
      orders.forEach(order => {
        const email = order.customer_email || 'Guest';
        if (!customerMap[email]) {
          customerMap[email] = {
            email: email,
            name: order.customer_name || 'Unknown',
            totalSpent: 0,
            orderCount: 0,
            lastOrderDate: order.created_at
          };
        }
        
        customerMap[email].totalSpent += parseFloat(order.total_amount || 0);
        customerMap[email].orderCount += 1;
        
        if (new Date(order.created_at) > new Date(customerMap[email].lastOrderDate)) {
          customerMap[email].lastOrderDate = order.created_at;
          customerMap[email].name = order.customer_name || customerMap[email].name; // take most recent name
        }
      });
      
      setCustomers(Object.values(customerMap));
    }
    setLoading(false);
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatUSD = (amount) => `$${parseFloat(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      <div className="admin-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 8px 0', color: '#111827' }}>Customers</h1>
          <p style={{ color: '#6b7280', margin: 0 }}>View and manage all store customers and guest checkout histories.</p>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '20px', marginBottom: '24px' }}>
        <div className="flex-column-mobile" style={{ gap: '16px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
            <Search size={18} color="#9ca3af" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Search customers by name or email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1px solid #d1d5db', borderRadius: '6px', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ color: '#6b7280', fontSize: '14px' }}>
            {filteredCustomers.length} Total Customers
          </div>
        </div>
      </div>

      <div className="table-responsive-wrapper" style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
        <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
            <tr>
              <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Customer</th>
              <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Contact</th>
              <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Orders</th>
              <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Total Spent</th>
              <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Last Order</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>Loading customers...</td>
              </tr>
            ) : filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>No customers found.</td>
              </tr>
            ) : (
              filteredCustomers.map((customer, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '16px 24px', fontWeight: '500', color: '#111827' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4b5563', fontWeight: 'bold' }}>
                        {customer.name.charAt(0).toUpperCase()}
                      </div>
                      {customer.name}
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px', color: '#4b5563', fontSize: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Mail size={14} color="#9ca3af" /> {customer.email}
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px', color: '#111827', fontWeight: '500' }}>
                    {customer.orderCount}
                  </td>
                  <td style={{ padding: '16px 24px', color: '#111827', fontWeight: '500' }}>
                    {formatUSD(customer.totalSpent)}
                  </td>
                  <td style={{ padding: '16px 24px', color: '#6b7280', fontSize: '14px' }}>
                    {new Date(customer.lastOrderDate).toLocaleDateString()}
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

export default SuperCustomers;
