import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { DEFAULT_SHARE_IMAGE, SITE_NAME, SITE_URL } from '../utils/seo';
import { formatDocumentTitle, HOME_DESCRIPTION, isNoindexPath } from '../utils/seoPages';

function SEO({ title, description, canonicalUrl, image, type = 'website', jsonLd, noindex }) {
  const location = useLocation();

  useEffect(() => {
    const fullTitle = formatDocumentTitle(title);
    const hideFromGoogle = noindex || isNoindexPath(location.pathname);
    const defaultDesc = HOME_DESCRIPTION;

    document.title = fullTitle;

    const upsertMeta = (attr, key, content) => {
      if (!content) return;
      let tag = document.querySelector(`meta[${attr}="${key}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attr, key);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.name = 'description';
      document.head.appendChild(metaDescription);
    }
    metaDescription.content = description || defaultDesc;

    const currentUrl = canonicalUrl || `${SITE_URL}${location.pathname === '/' ? '/' : location.pathname}`;

    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.rel = 'canonical';
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.href = currentUrl;

    upsertMeta('name', 'robots', hideFromGoogle ? 'noindex, follow' : 'index, follow');
    upsertMeta('property', 'og:site_name', SITE_NAME);
    upsertMeta('property', 'og:title', fullTitle);
    upsertMeta('property', 'og:description', description || defaultDesc);
    upsertMeta('property', 'og:url', currentUrl);
    upsertMeta('property', 'og:type', type === 'product' ? 'product' : 'website');
    upsertMeta('property', 'og:image', image || DEFAULT_SHARE_IMAGE);
    upsertMeta('property', 'og:image:alt', fullTitle);
    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', fullTitle);
    upsertMeta('name', 'twitter:description', description || defaultDesc);
    upsertMeta('name', 'twitter:image', image || DEFAULT_SHARE_IMAGE);

    const scriptId = 'klarelle-jsonld';
    document.querySelectorAll('script[type="application/ld+json"]').forEach((node) => {
      if (node.id === scriptId) return;
      try {
        const parsed = JSON.parse(node.textContent || '');
        const types = Array.isArray(parsed)
          ? parsed.map((item) => item?.['@type']).filter(Boolean)
          : [parsed?.['@type']].filter(Boolean);
        if (types.includes('Product') || types.includes('BreadcrumbList')) node.remove();
      } catch {
        // ignore non-JSON scripts
      }
    });
    let script = document.getElementById(scriptId);
    const payload = Array.isArray(jsonLd) ? jsonLd.filter(Boolean) : jsonLd;
    const jsonLdText = payload && (Array.isArray(payload) ? payload.length : true) ? JSON.stringify(payload) : '';
    if (jsonLdText) {
      if (!script) {
        script = document.createElement('script');
        script.id = scriptId;
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.textContent = jsonLdText;
    } else if (script) {
      script.remove();
    }
  }, [title, description, canonicalUrl, image, type, JSON.stringify(jsonLd || null), noindex, location.pathname]);

  return null;
}

export default SEO;
