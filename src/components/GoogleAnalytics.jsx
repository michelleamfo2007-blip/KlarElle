import { useEffect } from 'react';

const MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-13R3HNGKMK';

function GoogleAnalytics() {
  useEffect(() => {
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function gtag() {
      window.dataLayer.push(arguments);
    };
    if (!MEASUREMENT_ID) return;

    if (document.getElementById('klarelle-ga')) return;
    const script = document.createElement('script');
    script.id = 'klarelle-ga';
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
    document.head.appendChild(script);
    window.gtag('js', new Date());
    window.gtag('config', MEASUREMENT_ID);
  }, []);

  return null;
}

export default GoogleAnalytics;
