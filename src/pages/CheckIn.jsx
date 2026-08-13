import React, { useState } from 'react';
import { ChevronLeft, CalendarCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

function CheckIn() {
  const [checkedIn, setCheckedIn] = useState(false);

  const handleCheckIn = () => {
    setCheckedIn(true);
  };

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh', fontFamily: '-apple-system, sans-serif' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', background: '#fff', minHeight: '100vh' }}>
        
        {/* Header */}
        <div style={{ padding: '16px', display: 'flex', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10, background: '#fff', borderBottom: '1px solid #eee' }}>
          <Link to="/profile" style={{ color: 'inherit' }}>
            <ChevronLeft size={24} style={{ cursor: 'pointer' }} />
          </Link>
          <h1 style={{ flex: 1, textAlign: 'center', fontSize: '18px', margin: 0 }}>Daily Check-In</h1>
          <div style={{ width: '24px' }}></div>
        </div>

        {/* Content */}
        <div style={{ padding: '40px 20px', textAlign: 'center' }}>
          <CalendarCheck size={64} style={{ color: checkedIn ? '#00aa00' : '#000', marginBottom: '24px' }} />
          <h2 style={{ fontSize: '24px', marginBottom: '12px' }}>{checkedIn ? 'Checked In!' : 'Check In Today'}</h2>
          <p style={{ color: '#666', marginBottom: '32px', fontSize: '14px', lineHeight: '1.5' }}>
            {checkedIn 
              ? 'You have successfully checked in for today. Come back tomorrow for more rewards!' 
              : 'Tap the button below to check in and earn 10 points towards your next purchase.'}
          </p>

          <button 
            onClick={handleCheckIn}
            disabled={checkedIn}
            style={{
              background: checkedIn ? '#e0e0e0' : '#000',
              color: checkedIn ? '#999' : '#fff',
              border: 'none',
              padding: '16px 40px',
              borderRadius: '24px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: checkedIn ? 'default' : 'pointer',
              width: '100%',
              maxWidth: '300px'
            }}
          >
            {checkedIn ? 'Check In Complete' : 'Check In Now'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CheckIn;
