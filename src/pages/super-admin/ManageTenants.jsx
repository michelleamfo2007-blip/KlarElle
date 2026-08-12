import React from 'react';

function ManageTenants() {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', fontFamily: 'Inter, sans-serif', color: '#111827' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 4px 0' }}>Manage Tenants</h1>
        <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>View and manage all tenant stores on the platform.</p>
      </div>
      
      <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', padding: '40px', textAlign: 'center', color: '#6b7280' }}>
        <p>Tenant management features will be implemented here.</p>
        <p style={{ fontSize: '14px', marginTop: '8px' }}>You will be able to add, suspend, and view details for each vendor/tenant.</p>
      </div>
    </div>
  );
}

export default ManageTenants;
