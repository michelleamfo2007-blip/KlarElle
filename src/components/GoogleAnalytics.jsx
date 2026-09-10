import { useEffect } from 'react';
import { COOKIE_CONSENT_EVENT, hasAcceptedCookies } from '../utils/cookieConsent';

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

function loadAnalytics() {
  if (!MEASUREMENT_ID || !hasAcceptedCookies()) return;
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
}

function denyAnalytics() {
  ensureGtag();
  window.gtag('consent', 'update', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    functionality_storage: 'denied'
  });
}

function GoogleAnalytics() {
  useEffect(() => {
    ensureGtag();
    window.gtag('consent', 'default', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      functionality_storage: 'denied',
      security_storage: 'granted',
      wait_for_update: 500
    });

    if (hasAcceptedCookies()) loadAnalytics();
    else denyAnalytics();

    const onConsent = (event) => {
      if (event?.detail === 'accepted' || hasAcceptedCookies()) loadAnalytics();
      else denyAnalytics();
    };
    window.addEventListener(COOKIE_CONSENT_EVENT, onConsent);
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, onConsent);
  }, []);

  return null;
}

export default GoogleAnalytics;
