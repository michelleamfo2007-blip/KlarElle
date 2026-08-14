import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';

function UpdatePassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.updateUser({
      password: password
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      setTimeout(() => {
        navigate('/admin');
      }, 2000);
    }
    
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f5f5f5', fontFamily: 'Inter, sans-serif' }}>
      <form onSubmit={handleUpdate} style={{ background: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '8px', fontWeight: 'bold' }}>Set Your Password</h2>
        <p style={{ textAlign: 'center', marginBottom: '24px', color: '#6b7280', fontSize: '14px' }}>Welcome to KlarElle! Please set a secure password for your admin account.</p>
        
        {error && <div style={{ color: 'red', marginBottom: '16px', fontSize: '14px', padding: '8px', background: '#fee2e2', borderRadius: '4px' }}>{error}</div>}
        {success && <div style={{ color: '#059669', marginBottom: '16px', fontSize: '14px', padding: '8px', background: '#d1fae5', borderRadius: '4px' }}>Password set successfully! Redirecting to dashboard...</div>}
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>New Password</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '4px', boxSizing: 'border-box' }}
            required
          />
        </div>
        
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>Confirm Password</label>
          <input 
            type="password" 
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '4px', boxSizing: 'border-box' }}
            required
          />
        </div>

        <button 
          type="submit" 
          disabled={loading || success}
          style={{ width: '100%', padding: '12px', background: '#a89f91', color: 'white', border: 'none', borderRadius: '4px', cursor: (loading || success) ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
        >
          {loading ? 'Saving...' : 'Set Password'}
        </button>
      </form>
    </div>
  );
}

export default UpdatePassword;
