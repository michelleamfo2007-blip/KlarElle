export const COOKIE_CONSENT_KEY = 'klarelle_cookie_consent';
export const COOKIE_CONSENT_EVENT = 'klarelle-cookie-consent';

export function getCookieConsent() {
  try {
    const value = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (value === 'accepted' || value === 'declined') return value;
  } catch {
    // ignore storage errors
  }
  return null;
}

export function setCookieConsent(value) {
  if (value !== 'accepted' && value !== 'declined') return;
  try {
    localStorage.setItem(COOKIE_CONSENT_KEY, value);
  } catch {
    // ignore storage errors
  }
  window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_EVENT, { detail: value }));
}

export function hasAcceptedCookies() {
  return getCookieConsent() === 'accepted';
}

export function canShopWithCookies() {
  return hasAcceptedCookies();
}
