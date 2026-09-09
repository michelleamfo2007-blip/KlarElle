import React, { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { SITE_PAGES, resolveSitePageBody } from '../../data/sitePages';
import PolicyBody from '../../components/PolicyBody';

function AdminPages() {
  const [selectedSlug, setSelectedSlug] = useState(SITE_PAGES[0].slug);
  const [bodies, setBodies] = useState(() => {
    const next = {};
    SITE_PAGES.forEach((page) => { next[page.slug] = page.body; });
    return next;
  });
  const [savedAt, setSavedAt] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const selected = SITE_PAGES.find((page) => page.slug === selectedSlug) || SITE_PAGES[0];
  const body = bodies[selected.slug] ?? selected.body;

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('site_pages').select('slug, body, updated_at');
    if (!error && data) {
      setBodies((prev) => {
        const next = { ...prev };
        data.forEach((row) => {
          if (row.body) next[row.slug] = resolveSitePageBody(row.slug, row.body);
        });
        return next;
      });
      const times = {};
      data.forEach((row) => { times[row.slug] = row.updated_at; });
      setSavedAt(times);
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const { error } = await supabase.from('site_pages').upsert({
      slug: selected.slug,
      title: selected.title,
      body,
      updated_at: new Date().toISOString()
    });
    setIsSaving(false);
    if (error) {
      setToast(error.message.includes('does not exist') || error.code === '42P01'
        ? 'Run add_site_pages.sql in Supabase, then save again.'
        : `Could not save: ${error.message}`);
    } else {
      setSavedAt((prev) => ({ ...prev, [selected.slug]: new Date().toISOString() }));
      setToast(`${selected.title} saved. It is live on the store.`);
    }
    setTimeout(() => setToast(''), 4000);
  };

  if (isLoading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>Loading pages...</div>;
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', fontFamily: 'Inter, sans-serif', color: '#111827' }}>
      {toast && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', background: '#111827', color: '#fff',
          padding: '16px 24px', borderRadius: '8px', zIndex: 50, boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}>
          {toast}
        </div>
      )}

      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 8px 0', fontFamily: 'Playfair Display, serif' }}>Policies & Pages</h1>
        <p style={{ color: '#6b7280', margin: 0, fontSize: '15px' }}>
          Edit Privacy Policy, Terms, Returns, Shipping, FAQ, and the other storefront pages. Saved changes show on the live site.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div style={{ minWidth: '220px', flex: '0 0 220px', background: '#fff', border: '1px solid #eaeaea', borderRadius: '12px', overflow: 'hidden' }}>
          {SITE_PAGES.map((page) => (
            <button
              key={page.slug}
              type="button"
              onClick={() => { setSelectedSlug(page.slug); setShowPreview(false); }}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: '12px 16px',
                border: 'none',
                borderBottom: '1px solid #f3f4f6',
                background: selected.slug === page.slug ? '#111827' : '#fff',
                color: selected.slug === page.slug ? '#fff' : '#111827',
                fontWeight: selected.slug === page.slug ? '600' : '500',
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              {page.title}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, minWidth: '280px', background: '#fff', border: '1px solid #eaeaea', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #eaeaea', display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '18px' }}>{selected.title}</h2>
              <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#6b7280' }}>
                Live at {selected.path}
                {savedAt[selected.slug] ? ` · Last saved ${new Date(savedAt[selected.slug]).toLocaleString()}` : ' · Using default copy until you save'}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setShowPreview((value) => !value)}
                style={{ padding: '10px 14px', border: '1px solid #d1d5db', background: '#fff', borderRadius: '8px', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}
              >
                {showPreview ? 'Edit' : 'Preview'}
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px',
                  background: '#111827', color: '#fff', border: 'none', borderRadius: '8px',
                  fontSize: '13px', fontWeight: '600', cursor: isSaving ? 'not-allowed' : 'pointer',
                  opacity: isSaving ? 0.7 : 1
                }}
              >
                <Save size={16} /> {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>

          <div style={{ padding: '24px' }}>
            {showPreview ? (
              <div style={{ color: '#444', fontSize: '15px' }}>
                <PolicyBody text={body} />
              </div>
            ) : (
              <>
                <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#6b7280' }}>
                  Use ## for a heading, ### for a subheading, - for a list, and **text** for bold. Blank lines start a new paragraph.
                </p>
                <textarea
                  value={body}
                  onChange={(e) => setBodies((prev) => ({ ...prev, [selected.slug]: e.target.value }))}
                  rows={22}
                  style={{
                    width: '100%',
                    padding: '14px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    lineHeight: 1.5,
                    fontFamily: 'inherit',
                    outline: 'none',
                    resize: 'vertical',
                    boxSizing: 'border-box'
                  }}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPages;
