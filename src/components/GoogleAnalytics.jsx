import { useEffect } from 'react';

const MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-13R3HNGKMK';

const TAG_OPTIONS = {
  send_page_view: true,
  cookie_domain: 'auto',
  first_party_collection: true,
  transport_url: 'https://www.klarelle.store',
  debug_mode: true
};

function ensureGtag() {
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() {
    window.dataLayer.push(arguments);
  };
}

function GoogleAnalytics() {
  useEffect(() => {
    if (!MEASUREMENT_ID) return;
    ensureGtag();

    const alreadyLoaded = document.getElementById('klarelle-ga')
      || document.querySelector('script[src*="/gtag/js"]')
      || document.querySelector('script[src*="googletagmanager.com/gtag/js"]');
    if (!alreadyLoaded) {
      const script = document.createElement('script');
      script.id = 'klarelle-ga';
      script.async = true;
      script.src = `/gtag/js?id=${MEASUREMENT_ID}`;
      document.head.appendChild(script);
      window.gtag('js', new Date());
    }

    window.gtag('consent', 'update', {
      analytics_storage: 'granted',
      functionality_storage: 'granted',
      security_storage: 'granted'
    });
    window.gtag('config', MEASUREMENT_ID, TAG_OPTIONS);
  }, []);

  return null;
}

export default GoogleAnalytics;
