import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function SEO({ title, description, canonicalUrl }) {
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
    
    // Cleanup on unmount (optional, but usually we just let it be overwritten by the next page)
    return () => {
      // document.title = siteName;
    };
  }, [title, description, canonicalUrl, location.pathname]);

  return null;
}

export default SEO;
