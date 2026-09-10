import React, { useEffect, useState } from 'react';
import { formatSizeLabel } from '../utils/size';
import { attachEmailToSavedCart } from '../utils/cartTracking';

function NotifyMeForm({ product, selectedSize, onClose, reason = 'oos' }) {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [size, setSize] = useState(selectedSize || product?.parsedSizes?.[0] || product?.sizes?.[0] || '');
  const [status, setStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const sizes = product?.parsedSizes || (Array.isArray(product?.sizes) ? product.sizes : []);

  useEffect(() => {
    if (selectedSize) setSize(selectedSize);
  }, [selectedSize]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() && !phone.trim()) {
      setStatus('Please enter an email or phone number.');
      return;
    }
    setSubmitting(true);
    setStatus('');
    try {
      const response = await fetch('/api/join-waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'notify',
          productId: product.id,
          productName: product.name,
          email: email.trim(),
          phone: phone.trim(),
          size
        })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Could not save your request.');
      if (email.trim()) attachEmailToSavedCart(email.trim());
      setStatus('Thank you. We will notify you when this size is in stock.');
    } catch (error) {
      setStatus(error.message || 'Could not save your request.');
    } finally {
      setSubmitting(false);
    }
  };

  const copy = reason === 'coming-soon'
    ? 'Enter your email or phone number and the size you want. We will message you when this dress launches.'
    : 'This size or color is not available. Enter your email or phone number and we will notify you when it is in stock.';

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '12px' }}>
      <p style={{ margin: 0, fontSize: '13px', color: '#555', lineHeight: 1.5 }}>
        {copy}
      </p>
      <input
        type="email"
        placeholder="Email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
      />
      <input
        type="tel"
        placeholder="Phone number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
      />
      {sizes.length > 0 && (
        <select
          value={size}
          onChange={(e) => setSize(e.target.value)}
          style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px' }}
        >
          {sizes.map((option) => (
            <option key={option} value={option}>{formatSizeLabel(option)}</option>
          ))}
        </select>
      )}
      <button
        type="submit"
        disabled={submitting}
        style={{ padding: '14px', background: '#000', color: '#fff', border: 'none', fontWeight: 700, cursor: submitting ? 'wait' : 'pointer' }}
      >
        {submitting ? 'SAVING...' : 'NOTIFY ME WHEN IN STOCK'}
      </button>
      {status && <p style={{ margin: 0, fontSize: '13px', color: '#333' }}>{status}</p>}
      {onClose && (
        <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer', fontSize: '13px' }}>
          Close
        </button>
      )}
    </form>
  );
}

export default NotifyMeForm;
