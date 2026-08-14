import React, { useState, useEffect } from 'react';
import { UserPlus, MoreVertical, ShieldAlert, CheckCircle2, XCircle, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

function ManageStaff() {
  const [staff, setStaff] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffName, setNewStaffName] = useState('');
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

    const emailToUse = newStaffEmail.toLowerCase().trim();

    try {
      const response = await fetch('/api/invite-staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToUse, role: newStaffRole })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send invite');
      }

      // 2. Add to staff table
      const { error: dbError } = await supabase.from('staff').insert([
        { email: emailToUse, name: newStaffName, role: newStaffRole, status: 'Pending' }
      ]);
      
      if (dbError) throw dbError;

      setSuccessMsg('Invite sent successfully!');
      setNewStaffEmail('');
      setNewStaffName('');
      setShowAddForm(false);
      fetchStaff();
      
      // Clear success message after 4 seconds
      setTimeout(() => {
        setSuccessMsg('');
      }, 4000);
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

      {/* Global Messages */}
      {errorMsg && <div style={{ padding: '12px', background: '#feeaea', color: '#d93025', borderRadius: '6px', marginBottom: '24px', border: '1px solid #fecaca' }}>{errorMsg}</div>}
      {successMsg && <div style={{ padding: '12px', background: '#e6f4ea', color: '#10b981', borderRadius: '6px', marginBottom: '24px', border: '1px solid #a7f3d0' }}>{successMsg}</div>}

      {showAddForm && (
        <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', border: '1px solid #D2C4B3', marginBottom: '32px', boxShadow: '0 4px 15px rgba(188, 163, 143, 0.1)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 16px 0' }}>Invite New Admin</h2>

          <form onSubmit={handleAddStaff} style={{ display: 'grid', gap: '16px', gridTemplateColumns: '1fr 1fr 1fr auto', alignItems: 'end' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#4b5563', marginBottom: '8px' }}>Staff Name</label>
              <input 
                type="text" 
                value={newStaffName}
                onChange={(e) => setNewStaffName(e.target.value)}
                placeholder="e.g. Tessy"
                required
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#4b5563', marginBottom: '8px' }}>Email Address</label>
              <input 
                type="email" 
                value={newStaffEmail}
                onChange={(e) => setNewStaffEmail(e.target.value)}
                placeholder="admin@klarelle.store"
                required
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
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
        <div className="table-responsive-wrapper">
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
            <thead>
              <tr style={{ background: '#FAF9F6', borderBottom: '1px solid #D2C4B3' }}>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontWeight: '600', color: '#4b5563', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Name</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontWeight: '600', color: '#4b5563', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontWeight: '600', color: '#4b5563', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Role</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontWeight: '600', color: '#4b5563', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontWeight: '600', color: '#4b5563', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Added</th>
                <th style={{ padding: '16px 24px', textAlign: 'right', fontWeight: '600', color: '#4b5563', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {staff.map(member => (
                <tr key={member.id} style={{ borderTop: '1px solid #f3f4f6', transition: 'background-color 0.2s' }}>
                  <td style={{ padding: '16px 24px', fontSize: '14px', color: '#111827', fontWeight: '500' }}>
                    {member.name || 'Unknown'}
                  </td>
                  <td style={{ padding: '16px 24px', fontSize: '14px', color: '#4b5563', fontWeight: '500' }}>
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
              {staff.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: '#6b7280' }}>
                    No staff members found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ManageStaff;
