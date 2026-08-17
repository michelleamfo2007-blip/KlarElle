import React, { useState } from 'react';
import { Save, Image as ImageIcon, Layout, Type, Bell } from 'lucide-react';

function SuperWebsite() {
  const [formData, setFormData] = useState({
    announcementText: 'Free shipping on all orders over $100!',
    heroTitle: 'New Arrival Collection',
    heroSubtitle: 'Discover the latest trends in fashion and accessories.',
    featuredCollection: 'Summer 2026',
    aboutText: 'KlarElle is a premium brand dedicated to bringing you the finest clothing and accessories.'
  });
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaving(true);
    // Simulate API call to save website content
    setTimeout(() => {
      setIsSaving(false);
      setToast('Website content saved successfully!');
      setTimeout(() => setToast(''), 3000);
    }, 1000);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', fontFamily: 'Inter, sans-serif', color: '#111827' }}>
      {toast && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', background: '#111827', color: '#fff',
          padding: '16px 24px', borderRadius: '8px', zIndex: 50, boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          <Save size={18} /> {toast}
        </div>
      )}

      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 8px 0', fontFamily: 'Playfair Display, serif' }}>Website Content Manager</h1>
        <p style={{ color: '#6b7280', margin: 0, fontSize: '15px' }}>Manage the copy and content displayed on the storefront.</p>
      </div>

      <form onSubmit={handleSave} style={{ background: '#fff', borderRadius: '16px', border: '1px solid #eaeaea', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        
        {/* Announcement Bar */}
        <div style={{ padding: '32px', borderBottom: '1px solid #eaeaea' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ background: '#f3f4f6', padding: '8px', borderRadius: '8px' }}><Bell size={20} color="#4b5563" /></div>
            <h2 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>Announcement Bar</h2>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Announcement Text</label>
            <input 
              type="text" 
              name="announcementText"
              value={formData.announcementText}
              onChange={handleChange}
              placeholder="e.g. Free shipping on orders over $100!"
              style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        {/* Hero Section */}
        <div style={{ padding: '32px', borderBottom: '1px solid #eaeaea' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ background: '#f3f4f6', padding: '8px', borderRadius: '8px' }}><Layout size={20} color="#4b5563" /></div>
            <h2 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 4px 0' }}>Homepage Hero Section</h2>
          </div>
          
          <div className="flex-column-mobile" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Hero Title</label>
              <input 
                type="text" 
                name="heroTitle"
                value={formData.heroTitle}
                onChange={handleChange}
                style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Featured Collection Name</label>
              <input 
                type="text" 
                name="featuredCollection"
                value={formData.featuredCollection}
                onChange={handleChange}
                style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Hero Subtitle</label>
            <textarea 
              name="heroSubtitle"
              value={formData.heroSubtitle}
              onChange={handleChange}
              rows="3"
              style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        {/* About Section */}
        <div style={{ padding: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ background: '#f3f4f6', padding: '8px', borderRadius: '8px' }}><Type size={20} color="#4b5563" /></div>
            <h2 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>About Text (Footer)</h2>
          </div>
          <div>
            <textarea 
              name="aboutText"
              value={formData.aboutText}
              onChange={handleChange}
              rows="4"
              style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        {/* Form Actions */}
        <div style={{ padding: '24px 32px', background: '#f9fafb', borderTop: '1px solid #eaeaea', display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            type="submit" 
            disabled={isSaving}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', 
              background: '#111827', color: '#fff', border: 'none', borderRadius: '8px', 
              fontSize: '14px', fontWeight: '600', cursor: isSaving ? 'not-allowed' : 'pointer',
              opacity: isSaving ? 0.7 : 1
            }}
          >
            <Save size={16} /> {isSaving ? 'Saving...' : 'Save Content'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default SuperWebsite;
