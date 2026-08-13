import React, { useState, useEffect } from 'react';
import { Save, Mail, Phone, Truck, Shield, AlertCircle } from 'lucide-react';

function GlobalSettings() {
  const [settings, setSettings] = useState({
    shippingThreshold: 100,
    supportEmail: 'support@klarelle.store',
    supportPhone: '+1 (555) 123-4567',
    maintenanceMode: false
  });
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('klarelle_global_settings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      localStorage.setItem('klarelle_global_settings', JSON.stringify(settings));
      setIsSaving(false);
      setToast('Settings saved successfully');
      setTimeout(() => setToast(''), 3000);
    }, 800);
  };

  return (
    <div style={{ maxWidth: '800px', fontFamily: 'Inter, sans-serif' }}>
      {toast && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', background: '#111', color: '#fff',
          padding: '16px 24px', borderRadius: '8px', zIndex: 50, boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          {toast}
        </div>
      )}

      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 8px 0', fontFamily: 'Playfair Display, serif' }}>Global Settings</h1>
        <p style={{ color: '#6b7280', margin: 0, fontSize: '15px' }}>Configure platform-wide rules, contact information, and store status.</p>
      </div>

      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #eaeaea', overflow: 'hidden' }}>
        
        {/* Shipping Settings */}
        <div style={{ padding: '24px', borderBottom: '1px solid #eaeaea' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ padding: '8px', background: '#f3f4f6', borderRadius: '8px' }}><Truck size={20} color="#374151" /></div>
            <h2 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>Shipping & Delivery</h2>
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Free Shipping Threshold ($)</label>
            <input 
              type="number" 
              name="shippingThreshold"
              value={settings.shippingThreshold}
              onChange={handleChange}
              style={{ width: '100%', maxWidth: '300px', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', outline: 'none' }}
            />
            <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '6px' }}>Orders above this amount will automatically receive free shipping at checkout.</p>
          </div>
        </div>

        {/* Contact Information */}
        <div style={{ padding: '24px', borderBottom: '1px solid #eaeaea' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ padding: '8px', background: '#f3f4f6', borderRadius: '8px' }}><Mail size={20} color="#374151" /></div>
            <h2 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>Store Contact Info</h2>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Support Email</label>
              <input 
                type="email" 
                name="supportEmail"
                value={settings.supportEmail}
                onChange={handleChange}
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Support Phone</label>
              <input 
                type="text" 
                name="supportPhone"
                value={settings.supportPhone}
                onChange={handleChange}
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', outline: 'none' }}
              />
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div style={{ padding: '24px', background: '#fafafa' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ padding: '8px', background: '#fee2e2', borderRadius: '8px' }}><Shield size={20} color="#dc2626" /></div>
            <h2 style={{ fontSize: '18px', fontWeight: '600', margin: 0, color: '#991b1b' }}>System Status</h2>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: '#fff', border: '1px solid #fecaca', borderRadius: '8px' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#111', margin: '0 0 4px 0' }}>Maintenance Mode</h3>
              <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>Temporarily disable the storefront for customers during major updates.</p>
            </div>
            <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px' }}>
              <input 
                type="checkbox" 
                name="maintenanceMode"
                checked={settings.maintenanceMode}
                onChange={handleChange}
                style={{ opacity: 0, width: 0, height: 0 }} 
              />
              <span style={{
                position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: settings.maintenanceMode ? '#dc2626' : '#d1d5db', transition: '.4s', borderRadius: '24px'
              }}>
                <span style={{
                  position: 'absolute', content: '""', height: '18px', width: '18px', left: '3px', bottom: '3px',
                  backgroundColor: 'white', transition: '.4s', borderRadius: '50%',
                  transform: settings.maintenanceMode ? 'translateX(20px)' : 'translateX(0)'
                }}></span>
              </span>
            </label>
          </div>
        </div>

      </div>

      <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: '#111', color: '#fff', border: 'none', padding: '12px 24px',
            borderRadius: '6px', fontSize: '14px', fontWeight: '500', cursor: isSaving ? 'not-allowed' : 'pointer',
            opacity: isSaving ? 0.7 : 1
          }}
        >
          <Save size={18} />
          {isSaving ? 'Saving...' : 'Save All Settings'}
        </button>
      </div>
    </div>
  );
}

export default GlobalSettings;
