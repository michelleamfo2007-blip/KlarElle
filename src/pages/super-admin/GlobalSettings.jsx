import React, { useState, useEffect } from 'react';
import { Save, Mail, Phone, Truck, Shield, AlertCircle, DollarSign, MapPin, Share2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

function GlobalSettings() {
  const [settings, setSettings] = useState({
    shippingThreshold: 100,
    supportEmail: 'support@klarelle.store',
    supportPhone: '+1 (555) 123-4567',
    maintenanceMode: false,
    taxRate: 7.5,
    defaultCurrency: 'USD',
    storeAddress: '123 Fashion Ave, Suite 400, New York, NY 10001',
    instagramUrl: 'https://www.instagram.com/klarelle.store?utm_source=qr',
    tiktokUrl: 'https://www.tiktok.com/@klarelle_store?_r=1&_t=ZT-98rGC422fzK',
    facebookUrl: 'https://www.facebook.com/share/18vRTfzg9V/?mibextid=wwXIfr'
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('store_settings').select('*').eq('id', 1).single();
    if (data && !error) {
      setSettings({
        shippingThreshold: data.shipping_threshold || 100,
        supportEmail: data.support_email || '',
        supportPhone: data.support_phone || '',
        maintenanceMode: data.maintenance_mode || false,
        taxRate: data.tax_rate || 0,
        defaultCurrency: data.default_currency || 'USD',
        storeAddress: data.store_address || '',
        instagramUrl: data.instagram_url || '',
        tiktokUrl: data.tiktok_url || '',
        facebookUrl: data.facebook_url || ''
      });
    }
    setIsLoading(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    const { error } = await supabase.from('store_settings').update({
      shipping_threshold: parseFloat(settings.shippingThreshold) || 0,
      support_email: settings.supportEmail,
      support_phone: settings.supportPhone,
      maintenance_mode: settings.maintenanceMode,
      tax_rate: parseFloat(settings.taxRate) || 0,
      default_currency: settings.defaultCurrency,
      store_address: settings.storeAddress,
      instagram_url: settings.instagramUrl,
      tiktok_url: settings.tiktokUrl,
      facebook_url: settings.facebookUrl,
      updated_at: new Date().toISOString()
    }).eq('id', 1);

    setIsSaving(false);
    
    if (error) {
      setToast('Error saving settings: ' + error.message);
    } else {
      setToast('Settings saved successfully');
    }
    
    setTimeout(() => setToast(''), 3000);
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

      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #eaeaea', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        
        {/* Shipping Settings */}
        <div style={{ padding: '32px', borderBottom: '1px solid #eaeaea' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <div style={{ padding: '10px', background: '#f8f9fa', borderRadius: '12px', border: '1px solid #eee' }}><Truck size={22} color="#111" /></div>
            <h2 style={{ fontSize: '20px', fontWeight: '500', margin: 0, fontFamily: 'Playfair Display, serif', letterSpacing: '0.5px' }}>SHIPPING & DELIVERY</h2>
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

        {/* Financial Settings */}
        <div style={{ padding: '32px', borderBottom: '1px solid #eaeaea' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <div style={{ padding: '10px', background: '#f8f9fa', borderRadius: '12px', border: '1px solid #eee' }}><DollarSign size={22} color="#111" /></div>
            <h2 style={{ fontSize: '20px', fontWeight: '500', margin: 0, fontFamily: 'Playfair Display, serif', letterSpacing: '0.5px' }}>FINANCIAL RULES</h2>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#444', marginBottom: '10px' }}>Default Currency</label>
              <select 
                name="defaultCurrency"
                value={settings.defaultCurrency}
                onChange={handleChange}
                style={{ width: '100%', padding: '12px 16px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '15px', outline: 'none', background: '#fff', cursor: 'pointer' }}
              >
                <option value="USD">USD ($) - US Dollar</option>
                <option value="GHS">GHS (₵) - Ghanaian Cedi</option>
                <option value="EUR">EUR (€) - Euro</option>
                <option value="GBP">GBP (£) - British Pound</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#444', marginBottom: '10px' }}>Store Tax Rate (%)</label>
              <input 
                type="number" 
                step="0.1"
                name="taxRate"
                value={settings.taxRate}
                onChange={handleChange}
                style={{ width: '100%', padding: '12px 16px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '15px', outline: 'none', transition: 'border-color 0.2s' }}
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div style={{ padding: '32px', borderBottom: '1px solid #eaeaea' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <div style={{ padding: '10px', background: '#f8f9fa', borderRadius: '12px', border: '1px solid #eee' }}><Mail size={22} color="#111" /></div>
            <h2 style={{ fontSize: '20px', fontWeight: '500', margin: 0, fontFamily: 'Playfair Display, serif', letterSpacing: '0.5px' }}>STORE CONTACT INFO</h2>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#444', marginBottom: '10px' }}>Support Email</label>
              <input 
                type="email" 
                name="supportEmail"
                value={settings.supportEmail}
                onChange={handleChange}
                style={{ width: '100%', padding: '12px 16px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '15px', outline: 'none', transition: 'border-color 0.2s' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#444', marginBottom: '10px' }}>Support Phone</label>
              <input 
                type="text" 
                name="supportPhone"
                value={settings.supportPhone}
                onChange={handleChange}
                style={{ width: '100%', padding: '12px 16px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '15px', outline: 'none', transition: 'border-color 0.2s' }}
              />
            </div>
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#444', marginBottom: '10px' }}>Official Store Address (Used on invoices and returns)</label>
            <input 
              type="text" 
              name="storeAddress"
              value={settings.storeAddress}
              onChange={handleChange}
              style={{ width: '100%', padding: '12px 16px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '15px', outline: 'none', transition: 'border-color 0.2s' }}
            />
          </div>
        </div>
        
        {/* Social Media Links */}
        <div style={{ padding: '32px', borderBottom: '1px solid #eaeaea' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <div style={{ padding: '10px', background: '#f8f9fa', borderRadius: '12px', border: '1px solid #eee' }}><Share2 size={22} color="#111" /></div>
            <h2 style={{ fontSize: '20px', fontWeight: '500', margin: 0, fontFamily: 'Playfair Display, serif', letterSpacing: '0.5px' }}>SOCIAL MEDIA LINKS</h2>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Instagram URL</label>
              <input 
                type="url" 
                name="instagramUrl"
                value={settings.instagramUrl}
                onChange={handleChange}
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>TikTok URL</label>
              <input 
                type="url" 
                name="tiktokUrl"
                value={settings.tiktokUrl}
                onChange={handleChange}
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Facebook URL</label>
              <input 
                type="url" 
                name="facebookUrl"
                value={settings.facebookUrl}
                onChange={handleChange}
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', outline: 'none' }}
              />
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div style={{ padding: '32px', background: '#fef2f2' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <div style={{ padding: '10px', background: '#fee2e2', borderRadius: '12px', border: '1px solid #fca5a5' }}><Shield size={22} color="#dc2626" /></div>
            <h2 style={{ fontSize: '20px', fontWeight: '500', margin: 0, color: '#991b1b', fontFamily: 'Playfair Display, serif', letterSpacing: '0.5px' }}>SYSTEM STATUS</h2>
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
