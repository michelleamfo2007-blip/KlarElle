import React, { useEffect, useMemo, useState } from 'react';
import { ShoppingBag, Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import './Admin.css';

function AdminCarts() {
  const [carts, setCarts] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [tab, setTab] = useState('carts');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [{ data: cartRows }, { data: activityRows }] = await Promise.all([
        supabase.from('customer_carts').select('*').order('updated_at', { ascending: false }),
        supabase.from('cart_activity').select('*').order('created_at', { ascending: false }).limit(200)
      ]);
      setCarts((cartRows || []).filter((row) => (row.item_count || 0) > 0));
      setActivity(activityRows || []);
      setLoading(false);
    };
    load();
  }, []);

  const filteredCarts = carts.filter((cart) => {
    const haystack = `${cart.customer_email || ''} ${JSON.stringify(cart.items || [])}`.toLowerCase();
    return haystack.includes(searchTerm.toLowerCase());
  });

  const filteredActivity = activity.filter((row) => {
    const haystack = `${row.customer_email || ''} ${row.product_name || ''} ${row.sku || ''} ${row.size || ''} ${row.color || ''}`.toLowerCase();
    return haystack.includes(searchTerm.toLowerCase());
  });

  const popular = useMemo(() => {
    const map = {};
    activity.filter((row) => row.action === 'add').forEach((row) => {
      const key = row.product_id || row.product_name;
      if (!key) return;
      if (!map[key]) {
        map[key] = {
          name: row.product_name || 'Unknown style',
          image: row.image_url,
          quantity: 0,
          adds: 0
        };
      }
      map[key].quantity += row.quantity || 1;
      map[key].adds += 1;
    });
    return Object.values(map).sort((a, b) => b.quantity - a.quantity).slice(0, 8);
  }, [activity]);

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      <div className="admin-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingBag size={24} /> Customer Carts
          </h1>
          <p style={{ color: '#6b7280', margin: 0 }}>See what shoppers are adding to their carts, including guests.</p>
        </div>
      </div>

      {popular.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px', marginBottom: '24px' }}>
          {popular.map((item) => (
            <div key={item.name} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '12px' }}>
              {item.image && <img src={item.image} alt="" style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '4px', marginBottom: '8px' }} />}
              <div style={{ fontSize: '13px', fontWeight: 600 }}>{item.name}</div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>{item.quantity} in carts · {item.adds} adds</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button type="button" onClick={() => setTab('carts')} style={{ padding: '8px 14px', border: '1px solid #111', background: tab === 'carts' ? '#111' : '#fff', color: tab === 'carts' ? '#fff' : '#111', cursor: 'pointer' }}>
          Current carts ({filteredCarts.length})
        </button>
        <button type="button" onClick={() => setTab('activity')} style={{ padding: '8px 14px', border: '1px solid #111', background: tab === 'activity' ? '#111' : '#fff', color: tab === 'activity' ? '#fff' : '#111', cursor: 'pointer' }}>
          Recent adds
        </button>
      </div>

      <div style={{ position: 'relative', marginBottom: '16px', maxWidth: '360px' }}>
        <Search size={16} color="#9ca3af" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by email, product, size..."
          style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box' }}
        />
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>Loading carts...</div>
      ) : tab === 'carts' ? (
        filteredCarts.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}>No carts yet. Once customers add items, they will appear here.</div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {filteredCarts.map((cart) => (
              <div key={cart.session_id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', marginBottom: '12px' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{cart.customer_email || 'Guest shopper'}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>{cart.item_count} item{cart.item_count === 1 ? '' : 's'} · updated {new Date(cart.updated_at).toLocaleString()}</div>
                  </div>
                </div>
                <div style={{ display: 'grid', gap: '8px' }}>
                  {(cart.items || []).map((item, index) => (
                    <div key={`${item.product_id}-${index}`} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      {item.image_url && <img src={item.image_url} alt="" style={{ width: '48px', height: '64px', objectFit: 'cover', borderRadius: '4px' }} />}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: 600 }}>{item.name}</div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                          {item.color ? `Color: ${item.color}` : ''}{item.color && item.size ? ' · ' : ''}{item.size ? `Size: ${item.size}` : ''}{item.sku ? ` · ${item.sku}` : ''}
                        </div>
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 600 }}>x{item.quantity}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="table-responsive-wrapper">
          <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
            <thead>
              <tr style={{ background: '#FAF9F6', textAlign: 'left' }}>
                <th style={{ padding: '12px', fontSize: '12px', textTransform: 'uppercase', color: '#6b7280' }}>When</th>
                <th style={{ padding: '12px', fontSize: '12px', textTransform: 'uppercase', color: '#6b7280' }}>Customer</th>
                <th style={{ padding: '12px', fontSize: '12px', textTransform: 'uppercase', color: '#6b7280' }}>Product</th>
                <th style={{ padding: '12px', fontSize: '12px', textTransform: 'uppercase', color: '#6b7280' }}>Size / Color</th>
                <th style={{ padding: '12px', fontSize: '12px', textTransform: 'uppercase', color: '#6b7280' }}>Qty</th>
              </tr>
            </thead>
            <tbody>
              {filteredActivity.length === 0 ? (
                <tr><td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: '#6b7280' }}>No add-to-cart activity yet.</td></tr>
              ) : (
                filteredActivity.map((row) => (
                  <tr key={row.id} style={{ borderTop: '1px solid #eee' }}>
                    <td style={{ padding: '12px', fontSize: '13px' }}>{new Date(row.created_at).toLocaleString()}</td>
                    <td style={{ padding: '12px', fontSize: '13px' }}>{row.customer_email || 'Guest'}</td>
                    <td style={{ padding: '12px', fontSize: '13px' }}>{row.product_name || '—'}</td>
                    <td style={{ padding: '12px', fontSize: '13px' }}>{[row.size, row.color].filter(Boolean).join(' / ') || '—'}</td>
                    <td style={{ padding: '12px', fontSize: '13px' }}>{row.action === 'remove' ? 'removed' : row.quantity}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminCarts;
