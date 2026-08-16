import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, Search, CheckCircle } from 'lucide-react';

function Waitlist() {
  const [waitlist, setWaitlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchWaitlist();
  }, []);

  const fetchWaitlist = async () => {
    const { data, error } = await supabase
      .from('waitlist')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setWaitlist(data);
    setLoading(false);
  };

  const updateStatus = async (id, newStatus) => {
    // Optimistic UI update
    setWaitlist(prev => prev.map(w => w.id === id ? { ...w, status: newStatus } : w));
    
    const { error } = await supabase
      .from('waitlist')
      .update({ status: newStatus })
      .eq('id', id);
      
    if (error) {
      alert('Failed to update status');
      fetchWaitlist();
    }
  };

  const filteredWaitlist = waitlist.filter(w => 
    w.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingCount = waitlist.filter(w => w.status !== 'Checked Off').length;
  const checkedOffCount = waitlist.filter(w => w.status === 'Checked Off').length;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Header */}
      <div className="admin-header-flex">
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={24} /> Waitlist
          </h1>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>Manage and track your early subscribers.</p>
        </div>
        
        <div className="stats-row">
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', padding: '12px 20px', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827' }}>{waitlist.length}</div>
            <div style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase' }}>Total Subscribers</div>
          </div>
          <div style={{ background: '#fef9c3', border: '1px solid #fef08a', padding: '12px 20px', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#854d0e' }}>{pendingCount}</div>
            <div style={{ fontSize: '12px', color: '#a16207', textTransform: 'uppercase' }}>Pending</div>
          </div>
          <div style={{ background: '#dcfce7', border: '1px solid #bbf7d0', padding: '12px 20px', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#166534' }}>{checkedOffCount}</div>
            <div style={{ fontSize: '12px', color: '#15803d', textTransform: 'uppercase' }}>Checked Off</div>
          </div>
        </div>
      </div>

      <div style={{ position: 'relative', marginBottom: '20px', maxWidth: '300px' }}>
        <Search size={18} color="#9ca3af" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
        <input 
          type="text" 
          placeholder="Search by email..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: '10px 12px 10px 36px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', outline: 'none', width: '100%', boxSizing: 'border-box' }}
        />
      </div>

      {/* Table */}
      <div className="table-responsive-wrapper">
        <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#FAF9F6', borderBottom: '1px solid #D2C4B3' }}>
              <th style={{ padding: '12px 20px', fontSize: '12px', textTransform: 'uppercase', color: '#BCA38F', letterSpacing: '0.5px' }}>Email Address</th>
              <th style={{ padding: '12px 20px', fontSize: '12px', textTransform: 'uppercase', color: '#BCA38F', letterSpacing: '0.5px' }}>Date Joined</th>
              <th style={{ padding: '12px 20px', fontSize: '12px', textTransform: 'uppercase', color: '#BCA38F', letterSpacing: '0.5px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="3" style={{ textAlign: 'center', padding: '40px', color: '#BCA38F' }}>Loading waitlist...</td></tr>
            ) : filteredWaitlist.length === 0 ? (
              <tr><td colSpan="3" style={{ textAlign: 'center', padding: '40px', color: '#111827' }}>No subscribers found.</td></tr>
            ) : (
              filteredWaitlist.map(user => (
                <tr key={user.id} style={{ borderBottom: '1px solid #FAF9F6', color: '#111827', background: user.status === 'Checked Off' ? '#f8fafc' : 'white' }}>
                  <td style={{ padding: '16px 20px', fontWeight: '500' }}>
                    {user.email}
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: '14px', color: '#4b5563' }}>
                    {new Date(user.created_at).toLocaleString()}
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <select 
                      value={user.status || 'Pending'}
                      onChange={(e) => updateStatus(user.id, e.target.value)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: '600',
                        border: '1px solid',
                        borderColor: user.status === 'Checked Off' ? '#86efac' : '#fcd34d',
                        background: user.status === 'Checked Off' ? '#dcfce7' : '#fef9c3',
                        color: user.status === 'Checked Off' ? '#166534' : '#854d0e',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Invited">Invited</option>
                      <option value="Checked Off">Checked Off ✔</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      </div>
    </div>
  );
}

export default Waitlist;
