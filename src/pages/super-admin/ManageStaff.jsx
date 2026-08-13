import React, { useState, useEffect } from 'react';
import { UserPlus, MoreVertical, ShieldAlert, CheckCircle2, XCircle, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

function ManageStaff() {
  const [staff, setStaff] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('Admin');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    const { data, error } = await supabase.from('staff').select('*').order('created_at', { ascending: false });
    if (data) {
      setStaff(data);
    }
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    if (!newStaffEmail) return;
    
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      // 1. Send invite email via backend
      const response = await fetch('http://localhost:4242/invite-staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newStaffEmail })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send invite');
      }

      // 2. Add to staff table
      const { error: dbError } = await supabase.from('staff').insert([
        { email: newStaffEmail, role: newStaffRole, status: 'Pending' }
      ]);
      
      if (dbError) throw dbError;

      setSuccessMsg('Invite sent successfully!');
      setNewStaffEmail('');
      setShowAddForm(false);
      fetchStaff();
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  const removeStaff = async (id) => {
    if (confirm("Are you sure you want to remove this staff member?")) {
      const { error } = await supabase.from('staff').delete().eq('id', id);
      if (!error) {
        fetchStaff();
      }
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', fontFamily: 'Inter, sans-serif', color: '#111827' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 4px 0' }}>Manage Staff</h1>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>Invite and manage administrators for the KlarElle store.</p>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: '#111827', color: '#FAF9F6', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}
        >
          <UserPlus size={18} /> Invite Staff
        </button>
      </div>

      {showAddForm && (
        <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', border: '1px solid #D2C4B3', marginBottom: '32px', boxShadow: '0 4px 15px rgba(188, 163, 143, 0.1)' }}>
          <h2 style={{ fontSize: '16px', margin: '0 0 16px 0', color: '#111827' }}>Invite New Staff Member</h2>
          {errorMsg && <div style={{ color: '#ef4444', marginBottom: '16px', fontSize: '14px' }}>{errorMsg}</div>}
          {successMsg && <div style={{ color: '#10b981', marginBottom: '16px', fontSize: '14px' }}>{successMsg}</div>}
          <form onSubmit={handleAddStaff} style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-end' }}>
            <div style={{ flex: '1 1 300px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email Address</label>
              <input 
                type="email" 
                required 
                value={newStaffEmail}
                onChange={(e) => setNewStaffEmail(e.target.value)}
                placeholder="colleague@klarelle.com" 
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #D2C4B3', borderRadius: '6px', outline: 'none', fontSize: '14px', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ flex: '0 0 200px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Role</label>
              <select 
                value={newStaffRole}
                onChange={(e) => setNewStaffRole(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #D2C4B3', borderRadius: '6px', outline: 'none', fontSize: '14px', background: '#fff', boxSizing: 'border-box' }}
              >
                <option value="Admin">Admin</option>
                <option value="Manager">Manager</option>
                <option value="Support">Customer Support</option>
              </select>
            </div>
            <button type="submit" disabled={loading} style={{ padding: '10px 24px', background: '#BCA38F', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '14px', height: '42px', flexShrink: 0, whiteSpace: 'nowrap', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Sending...' : 'Send Invite'}
            </button>
          </form>
        </div>
      )}

      <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #D2C4B3', overflow: 'hidden', boxShadow: '0 4px 15px rgba(188, 163, 143, 0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#FAF9F6', borderBottom: '1px solid #D2C4B3' }}>
              <th style={{ padding: '12px 20px', fontSize: '12px', textTransform: 'uppercase', color: '#BCA38F', letterSpacing: '0.5px' }}>User</th>
              <th style={{ padding: '12px 20px', fontSize: '12px', textTransform: 'uppercase', color: '#BCA38F', letterSpacing: '0.5px' }}>Role</th>
              <th style={{ padding: '12px 20px', fontSize: '12px', textTransform: 'uppercase', color: '#BCA38F', letterSpacing: '0.5px' }}>Status</th>
              <th style={{ padding: '12px 20px', fontSize: '12px', textTransform: 'uppercase', color: '#BCA38F', letterSpacing: '0.5px' }}>Added Date</th>
              <th style={{ padding: '12px 20px', fontSize: '12px', textTransform: 'uppercase', color: '#BCA38F', letterSpacing: '0.5px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {staff.map(member => (
              <tr key={member.id} style={{ borderBottom: '1px solid #FAF9F6' }}>
                <td style={{ padding: '16px 20px', fontWeight: '500' }}>
                  {member.email}
                </td>
                <td style={{ padding: '16px 20px' }}>
                  <span style={{ 
                    padding: '4px 10px', 
                    borderRadius: '100px', 
                    fontSize: '12px', 
                    fontWeight: '600',
                    background: member.role === 'Super Admin' ? 'rgba(17, 24, 39, 0.1)' : 'rgba(188, 163, 143, 0.15)',
                    color: member.role === 'Super Admin' ? '#111827' : '#BCA38F'
                  }}>
                    {member.role}
                  </span>
                </td>
                <td style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '500', color: member.status === 'Active' ? '#16a34a' : '#d97706' }}>
                    {member.status === 'Active' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                    {member.status}
                  </div>
                </td>
                <td style={{ padding: '16px 20px', color: '#6b7280', fontSize: '14px' }}>
                  {new Date(member.created_at).toLocaleDateString()}
                </td>
                <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                  {member.role !== 'Super Admin' && (
                    <button onClick={() => removeStaff(member.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}>
                      <Trash2 size={18} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ManageStaff;
