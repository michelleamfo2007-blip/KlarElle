import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function SEO({ title, description, canonicalUrl, image }) {
  const location = useLocation();

  useEffect(() => {
    // 1. Update Title
    const siteName = "KLARELLE";
    const fullTitle = title ? `${title} | ${siteName}` : siteName;
    document.title = fullTitle;

    // 2. Update Meta Description
    const defaultDesc = "KLARELLE - Premium Fashion and Apparel. Shop the latest collections of dresses, tops, and more.";
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.name = "description";
      document.head.appendChild(metaDescription);
    }
    metaDescription.content = description || defaultDesc;

    // 3. Update Canonical URL
    const baseUrl = "https://www.klarelle.store";
    const currentUrl = canonicalUrl || `${baseUrl}${location.pathname}`;
    
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.rel = "canonical";
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.href = currentUrl;

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

    upsertMeta('property', 'og:site_name', siteName);
    upsertMeta('property', 'og:title', fullTitle);
    upsertMeta('property', 'og:description', description || defaultDesc);
    upsertMeta('property', 'og:url', currentUrl);
    upsertMeta('property', 'og:type', image ? 'product' : 'website');
    if (image) upsertMeta('property', 'og:image', image);
    upsertMeta('name', 'twitter:card', image ? 'summary_large_image' : 'summary');
    upsertMeta('name', 'twitter:title', fullTitle);
    upsertMeta('name', 'twitter:description', description || defaultDesc);
    if (image) upsertMeta('name', 'twitter:image', image);
    
    // Cleanup on unmount (optional, but usually we just let it be overwritten by the next page)
    return () => {
      // document.title = siteName;
    };
  }, [title, description, canonicalUrl, image, location.pathname]);

  return null;
}

export default SEO;
