import { useEffect } from 'react';

const MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-13R3HNGKMK';

function ensureGtag() {
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() {
    window.dataLayer.push(arguments);
  };
}

function applyConsentAndConfig() {
  const debugMode = /(?:\?|&)ga_debug=1(?:&|$)/.test(window.location.search);
  window.gtag('consent', 'update', {
    analytics_storage: 'granted',
    functionality_storage: 'granted',
    security_storage: 'granted'
  });
  window.gtag('config', MEASUREMENT_ID, {
    send_page_view: true,
    cookie_domain: 'auto',
    ...(debugMode ? { debug_mode: true } : {})
  });
}

function GoogleAnalytics() {
  useEffect(() => {
    if (!MEASUREMENT_ID) return;
    ensureGtag();

    const alreadyLoaded = document.getElementById('klarelle-ga')
      || document.querySelector('script[src*="googletagmanager.com/gtag/js"]');
    if (!alreadyLoaded) {
      const script = document.createElement('script');
      script.id = 'klarelle-ga';
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
      document.head.appendChild(script);
      window.gtag('js', new Date());
    }

    applyConsentAndConfig();
  }, []);

  return null;
}

export default GoogleAnalytics;
