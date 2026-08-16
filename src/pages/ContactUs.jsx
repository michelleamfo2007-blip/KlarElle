import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

function ContactUs() {
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    subject: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customer_name || !formData.customer_email || !formData.subject || !formData.message) {
      return alert("Please fill in all fields.");
    }

    setSubmitting(true);
    
    const { error } = await supabase.from('support_tickets').insert([{
      customer_name: formData.customer_name,
      customer_email: formData.customer_email,
      subject: formData.subject,
      message: formData.message,
      status: 'Open',
      priority: 'Medium'
    }]);

    setSubmitting(false);

    if (error) {
      alert("Failed to submit request: " + error.message);
    } else {
      setSuccess(true);
      setFormData({ customer_name: '', customer_email: '', subject: '', message: '' });
      setTimeout(() => setSuccess(false), 5000);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 20px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '16px' }}>Contact Us</h1>
        <p style={{ color: '#666', fontSize: '16px', maxWidth: '600px', margin: '0 auto' }}>
          Have a question or need assistance? We're here to help! Fill out the form below or reach out to us directly.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
        {/* Contact Info */}
        <div style={{ background: '#f9f9f9', padding: '40px', borderRadius: '8px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '24px' }}>Get in Touch</h2>
          
          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', alignItems: 'flex-start' }}>
            <MapPin size={24} color="#000" />
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 4px 0' }}>Our Office</h3>
              <p style={{ color: '#666', margin: 0, lineHeight: '1.5' }}>123 Fashion Ave<br/>Suite 400<br/>New York, NY 10001</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', alignItems: 'flex-start' }}>
            <Mail size={24} color="#000" />
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 4px 0' }}>Email Us</h3>
              <p style={{ color: '#666', margin: 0 }}>support@klarelle.store</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <Phone size={24} color="#000" />
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 4px 0' }}>Call Us</h3>
              <p style={{ color: '#666', margin: 0 }}>+1 (555) 123-4567</p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div style={{ background: '#fff', padding: '40px', borderRadius: '8px', border: '1px solid #eee' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '24px' }}>Send us a Message</h2>
          
          {success && (
            <div style={{ background: '#dcfce7', color: '#166534', padding: '16px', borderRadius: '6px', marginBottom: '24px', fontWeight: '500' }}>
              Thank you! Your message has been received and we will get back to you shortly.
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>Your Name</label>
              <input 
                type="text" 
                name="customer_name" 
                value={formData.customer_name} 
                onChange={handleInputChange} 
                required 
                placeholder="Jane Doe"
                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>Email Address</label>
              <input 
                type="email" 
                name="customer_email" 
                value={formData.customer_email} 
                onChange={handleInputChange} 
                required 
                placeholder="jane@example.com"
                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>Subject</label>
              <input 
                type="text" 
                name="subject" 
                value={formData.subject} 
                onChange={handleInputChange} 
                required 
                placeholder="What is this regarding?"
                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>Message</label>
              <textarea 
                name="message" 
                value={formData.message} 
                onChange={handleInputChange} 
                required 
                rows="5"
                placeholder="How can we help you?"
                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '15px', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
              ></textarea>
            </div>

            <button 
              type="submit" 
              disabled={submitting}
              style={{ background: '#000', color: '#fff', padding: '16px', border: 'none', borderRadius: '6px', fontSize: '16px', fontWeight: 'bold', cursor: submitting ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
            >
              <Send size={18} />
              {submitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ContactUs;
