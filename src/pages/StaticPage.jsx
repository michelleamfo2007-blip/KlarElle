import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { getSitePage, resolveSitePageBody } from '../data/sitePages';
import PolicyBody from '../components/PolicyBody';
import SEO from '../components/SEO';
import { pageDescription } from '../utils/seo';
import { PAGE_META, buildFaqJsonLd } from '../utils/seoPages';

function StaticPage({ slug }) {
  const page = getSitePage(slug);
  const heading = page?.title || 'Page';
  const [body, setBody] = useState(page?.body || '');

  useEffect(() => {
    if (!page?.slug) return;
    let cancelled = false;
    supabase
      .from('site_pages')
      .select('body')
      .eq('slug', page.slug)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) setBody(resolveSitePageBody(page.slug, data?.body));
      });
    return () => { cancelled = true; };
  }, [page?.slug]);

  return (
    <div style={{ padding: '60px 20px', maxWidth: '800px', margin: '0 auto', minHeight: '60vh' }}>
      <SEO
        title={PAGE_META[page?.path]?.title || heading}
        description={PAGE_META[page?.path]?.description || pageDescription(body, `${heading} — KlarElle.`)}
        type="website"
        jsonLd={page?.slug === 'faq' ? buildFaqJsonLd(body) : null}
      />
      <h1 style={{ fontSize: '32px', marginBottom: '24px', fontFamily: 'Playfair Display, serif' }}>{heading}</h1>
      <div style={{ lineHeight: '1.8', color: '#444', fontSize: '15px', fontFamily: 'Inter, sans-serif' }}>
        {body ? (
          <PolicyBody text={body} />
        ) : (
          <p style={{ marginBottom: '16px' }}>Content for {heading} will be available soon.</p>
        )}

        {page?.slug === 'influencer-collaboration' && (
          <a
            href="mailto:support@klarelle.store?subject=Fashion Blogger Collaboration Application"
            style={{
              display: 'inline-block',
              marginTop: '8px',
              padding: '12px 24px',
              backgroundColor: '#000',
              color: '#fff',
              borderRadius: '4px',
              fontWeight: 'bold',
              letterSpacing: '1px',
              textDecoration: 'none'
            }}
          >
            APPLY TO COLLABORATE &rarr;
          </a>
        )}

        <div style={{ marginTop: '40px' }}>
          <Link
            to="/"
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              backgroundColor: '#000',
              color: '#fff',
              textDecoration: 'none',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              fontSize: '13px',
              borderRadius: '8px'
            }}
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default StaticPage;
