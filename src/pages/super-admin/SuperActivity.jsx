import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Activity, ShoppingCart, Package, Shield, Settings, User } from 'lucide-react';

function SuperActivity() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false });

    if (data && !error) {
      setLogs(data);
    }
    setLoading(false);
  };

  const getIconForAction = (actionType) => {
    switch (actionType) {
      case 'Order':
        return <ShoppingCart size={20} color="#16a34a" />;
      case 'Product':
        return <Package size={20} color="#2563eb" />;
      case 'Auth':
        return <User size={20} color="#d97706" />;
      case 'System':
        return <Settings size={20} color="#4b5563" />;
      default:
        return <Activity size={20} color="#6b7280" />;
    }
  };

  const getBgForAction = (actionType) => {
    switch (actionType) {
      case 'Order':
        return '#dcfce7';
      case 'Product':
        return '#dbeafe';
      case 'Auth':
        return '#fef3c7';
      case 'System':
        return '#f3f4f6';
      default:
        return '#f3f4f6';
    }
  };

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', { 
      month: 'short', day: 'numeric', year: 'numeric', 
      hour: 'numeric', minute: '2-digit', hour12: true 
    });
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', fontFamily: 'Inter, sans-serif', color: '#111827' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 8px 0', fontFamily: 'Playfair Display, serif' }}>System Activity Logs</h1>
        <p style={{ color: '#6b7280', margin: 0, fontSize: '15px' }}>Monitor platform events, admin actions, and automated system logs.</p>
      </div>

      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #eaeaea', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', padding: '32px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>Loading activity logs...</div>
        ) : logs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>No activity recorded yet.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {logs.map((log) => (
              <div key={log.id} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{ 
                  background: getBgForAction(log.action_type), 
                  padding: '12px', 
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {getIconForAction(log.action_type)}
                </div>
                
                <div style={{ flex: 1, paddingBottom: '24px', borderBottom: '1px solid #f3f4f6' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                    <div style={{ fontWeight: '600', fontSize: '15px', color: '#111827' }}>
                      {log.description}
                    </div>
                    <div style={{ fontSize: '13px', color: '#9ca3af', whiteSpace: 'nowrap', marginLeft: '16px' }}>
                      {formatTime(log.created_at)}
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                    <span style={{ 
                      fontSize: '12px', 
                      fontWeight: '600', 
                      background: '#f3f4f6', 
                      color: '#4b5563', 
                      padding: '4px 10px', 
                      borderRadius: '100px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      {log.action_type}
                    </span>
                    <span style={{ fontSize: '13px', color: '#6b7280' }}>
                      by <strong style={{ color: '#374151', fontWeight: '500' }}>{log.actor}</strong>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SuperActivity;
