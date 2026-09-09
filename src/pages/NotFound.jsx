import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

function NotFound() {
  return (
    <>
      <SEO title="Page not found | KlarElle" description="This KlarElle page could not be found." noindex />
      <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 24px', textAlign: 'center', background: '#FAF9F6' }}>
        <div style={{ maxWidth: '520px' }}>
          <p style={{ letterSpacing: '3px', textTransform: 'uppercase', fontSize: '12px', color: '#BCA38F', marginBottom: '12px' }}>KlarElle</p>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '42px', fontWeight: 400, margin: '0 0 16px' }}>Page not found</h1>
          <p style={{ color: '#555', lineHeight: 1.7, marginBottom: '32px' }}>
            This page is missing, but the collection is not. Return home or continue browsing the latest KlarElle styles.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/" style={{ padding: '14px 24px', background: '#111', color: '#fff', textDecoration: 'none', letterSpacing: '1px', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase' }}>
              Return Home
            </Link>
            <Link to="/category/new-in" style={{ padding: '14px 24px', background: '#fff', color: '#111', border: '1px solid #111', textDecoration: 'none', letterSpacing: '1px', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase' }}>
              The New Edit
            </Link>
            <Link to="/category/all" style={{ padding: '14px 24px', background: '#fff', color: '#111', border: '1px solid #111', textDecoration: 'none', letterSpacing: '1px', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase' }}>
              Shop Collections
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default NotFound;
