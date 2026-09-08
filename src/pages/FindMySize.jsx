import React, { useState } from 'react';
import SEO from '../components/SEO';
import { supabase } from '../lib/supabase';

function FindMySize() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    bust: '',
    waist: '',
    hip: '',
    unit: 'in'
  });
  const [status, setStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email && !form.phone) {
      setStatus('Please include an email or phone number so we can reply.');
      return;
    }
    setSubmitting(true);
    setStatus('');
    const message = [
      `Name: ${form.name || 'Not provided'}`,
      `Email: ${form.email || 'Not provided'}`,
      `Phone: ${form.phone || 'Not provided'}`,
      `Bust: ${form.bust} ${form.unit}`,
      `Waist: ${form.waist} ${form.unit}`,
      `Hip: ${form.hip} ${form.unit}`
    ].join('\n');

    const { error } = await supabase.from('support_tickets').insert([{
      customer_name: form.name || 'Find My Klarelle Size',
      customer_email: form.email || 'size-request@klarelle.store',
      subject: 'Find My Klarelle Size',
      message,
      status: 'Open',
      priority: 'Medium'
    }]);

    setSubmitting(false);
    if (error) {
      setStatus('We could not send this just now. Please email support@klarelle.store with your measurements.');
      return;
    }
    setStatus('Thank you. Customer service will review your measurements and recommend a Klarelle size.');
    setForm({ name: '', email: '', phone: '', bust: '', waist: '', hip: '', unit: form.unit });
  };

  const fieldStyle = { width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box', fontSize: '15px' };

  return (
    <>
      <SEO title="Find My Klarelle Size" description="Enter your bust, waist and hip measurements for a Klarelle size recommendation." />
      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '60px 20px', fontFamily: 'Inter, sans-serif' }}>
        <p style={{ letterSpacing: '2px', textTransform: 'uppercase', fontSize: '12px', color: '#BCA38F', marginBottom: '8px' }}>Fit</p>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '36px', fontWeight: 400, margin: '0 0 12px' }}>Find My Klarelle Size</h1>
        <p style={{ color: '#555', lineHeight: 1.7, marginBottom: '32px' }}>
          Enter your bust, waist and hip measurements. Our customer service team will recommend a size. A recommendation is guidance and does not guarantee individual fit.
        </p>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['in', 'cm'].map((unit) => (
              <button
                key={unit}
                type="button"
                onClick={() => setForm({ ...form, unit })}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #111',
                  background: form.unit === unit ? '#111' : '#fff',
                  color: form.unit === unit ? '#fff' : '#111',
                  cursor: 'pointer'
                }}
              >
                {unit}
              </button>
            ))}
          </div>
          <input name="name" placeholder="Name" value={form.name} onChange={handleChange} style={fieldStyle} />
          <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} style={fieldStyle} />
          <input name="phone" type="tel" placeholder="Phone" value={form.phone} onChange={handleChange} style={fieldStyle} />
          <input name="bust" required placeholder={`Bust (${form.unit})`} value={form.bust} onChange={handleChange} style={fieldStyle} />
          <input name="waist" required placeholder={`Waist (${form.unit})`} value={form.waist} onChange={handleChange} style={fieldStyle} />
          <input name="hip" required placeholder={`Hip (${form.unit})`} value={form.hip} onChange={handleChange} style={fieldStyle} />
          <button
            type="submit"
            disabled={submitting}
            style={{ padding: '16px', background: '#111', color: '#fff', border: 'none', fontWeight: 700, letterSpacing: '1px', cursor: submitting ? 'wait' : 'pointer' }}
          >
            {submitting ? 'SENDING...' : 'SEND TO CUSTOMER SERVICE'}
          </button>
          {status && <p style={{ color: '#333', lineHeight: 1.6 }}>{status}</p>}
        </form>
      </div>
    </>
  );
}

export default FindMySize;
