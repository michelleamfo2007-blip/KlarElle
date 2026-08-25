import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [hasSession, setHasSession] = useState(true);
  const [checkingSession, setCheckingSession] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setHasSession(false);
        setError("This reset link has expired or is invalid. Please request a new one.");
      }
      setCheckingSession(false);
    });
  }, []);

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
        navigate('/login');
      }, 2000);
    }
    
    setLoading(false);
  };

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', padding: '60px 20px', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <div style={{ width: '100%', maxWidth: '400px', background: '#fff', padding: '32px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #eaeaea', height: 'fit-content' }}>
        <h1 style={{ fontSize: '24px', marginBottom: '8px', textAlign: 'center' }}>Set New Password</h1>
        <p style={{ color: '#666', textAlign: 'center', marginBottom: '24px' }}>Enter your new password below.</p>

        {checkingSession && <div style={{ textAlign: 'center', marginBottom: '16px', color: '#666' }}>Verifying link...</div>}
        
        {error && <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '12px', borderRadius: '4px', marginBottom: '16px', fontSize: '14px' }}>{error}</div>}
        {success && <div style={{ background: '#d1fae5', color: '#059669', padding: '12px', borderRadius: '4px', marginBottom: '16px', fontSize: '14px' }}>Password updated successfully! Redirecting to login...</div>}

        <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px', fontWeight: '500' }}>New Password</label>
            <input 
              type="password" 
              required
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px', fontWeight: '500' }}>Confirm Password</label>
            <input 
              type="password" 
              required
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <button 
            type="submit" 
            disabled={loading || success || !hasSession || checkingSession}
            style={{ width: '100%', padding: '12px', background: '#000', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: (loading || success || !hasSession || checkingSession) ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '8px', opacity: (hasSession && !checkingSession) ? 1 : 0.5 }}
          >
            {loading && <Loader2 size={16} className="spin" />}
            {loading ? 'SAVING...' : 'UPDATE PASSWORD'}
          </button>
        </form>
      </div>
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } } .spin { animation: spin 1s linear infinite; }`}</style>
    </div>
  );
}

export default ResetPassword;
