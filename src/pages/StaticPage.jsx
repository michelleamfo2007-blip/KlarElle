import React from 'react';
import { Link } from 'react-router-dom';

function StaticPage({ title }) {
  return (
    <div style={{ padding: '60px 20px', maxWidth: '800px', margin: '0 auto', minHeight: '60vh' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '24px', fontFamily: 'Didot, serif' }}>{title}</h1>
      <div style={{ lineHeight: '1.8', color: '#444', fontSize: '16px' }}>
        <p style={{ marginBottom: '16px' }}>
          This page is currently under construction. Please check back later for full details regarding {title.toLowerCase()}.
        </p>
        <p style={{ marginBottom: '24px' }}>
          If you have any urgent questions, our customer service team is always available to assist you.
        </p>
        <Link 
          to="/" 
          style={{ 
            display: 'inline-block', 
            padding: '12px 24px', 
            backgroundColor: '#000', 
            color: '#fff', 
            textDecoration: 'none', 
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            fontSize: '12px'
          }}
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}

export default StaticPage;
