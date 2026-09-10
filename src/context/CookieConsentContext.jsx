import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  COOKIE_CONSENT_EVENT,
  getCookieConsent,
  setCookieConsent
} from '../utils/cookieConsent';

const CookieConsentContext = createContext({
  consent: null,
  canShop: false,
  accept: () => {},
  decline: () => {},
  requireCookiesToShop: () => false
});

export function CookieConsentProvider({ children }) {
  const [consent, setConsent] = useState(() => getCookieConsent());

  useEffect(() => {
    const sync = (event) => {
      setConsent(event?.detail || getCookieConsent());
    };
    window.addEventListener(COOKIE_CONSENT_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(COOKIE_CONSENT_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const accept = () => {
    setCookieConsent('accepted');
    setConsent('accepted');
  };

  const decline = () => {
    setCookieConsent('declined');
    setConsent('declined');
  };

  const requireCookiesToShop = () => {
    if (consent === 'accepted') return true;
    window.dispatchEvent(new CustomEvent('klarelle-cookie-prompt'));
    return false;
  };

  return (
    <CookieConsentContext.Provider
      value={{
        consent,
        canShop: consent === 'accepted',
        accept,
        decline,
        requireCookiesToShop
      }}
    >
      {children}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent() {
  return useContext(CookieConsentContext);
}
