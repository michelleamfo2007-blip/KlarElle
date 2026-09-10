import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCookieConsent } from '../context/CookieConsentContext';

function CookieConsent() {
  const location = useLocation();
  const { consent, accept, decline } = useCookieConsent();
  const [promptOpen, setPromptOpen] = useState(false);

  const hideOnAdmin = location.pathname.startsWith('/admin')
    || location.pathname.startsWith('/super-admin')
    || location.pathname.startsWith('/update-password');

  useEffect(() => {
    const openPrompt = () => setPromptOpen(true);
    window.addEventListener('klarelle-cookie-prompt', openPrompt);
    return () => window.removeEventListener('klarelle-cookie-prompt', openPrompt);
  }, []);

  useEffect(() => {
    if (consent === 'accepted') setPromptOpen(false);
  }, [consent]);

  if (hideOnAdmin) return null;

  const showBanner = consent == null;
  const showDeclinedBar = consent === 'declined';

  if (!showBanner && !showDeclinedBar && !promptOpen) return null;

  return (
    <>
      {(showBanner || showDeclinedBar) && (
        <div className="cookie-banner" role="dialog" aria-live="polite" aria-label="Cookie consent">
          <div className="cookie-banner-inner">
            <div className="cookie-banner-copy">
              <strong>{showDeclinedBar ? 'Cookies are required to shop' : 'We use cookies'}</strong>
              <p>
                {showDeclinedBar
                  ? 'You declined cookies, so checkout and adding to cart are paused. Accept cookies to shop KlarElle. See our '
                  : 'KlarElle uses cookies to keep your bag, remember preferences, and run the store securely. You must accept cookies to shop. Read our '}
                <Link to="/page/privacy-policy">Privacy Policy</Link>.
              </p>
            </div>
            <div className="cookie-banner-actions">
              {showBanner && (
                <button type="button" className="cookie-btn cookie-btn-secondary" onClick={decline}>
                  Decline
                </button>
              )}
              <button type="button" className="cookie-btn cookie-btn-primary" onClick={accept}>
                Accept cookies
              </button>
            </div>
          </div>
        </div>
      )}

      {promptOpen && consent !== 'accepted' && (
        <div className="cookie-prompt-overlay" onClick={() => setPromptOpen(false)}>
          <div className="cookie-prompt" onClick={(e) => e.stopPropagation()} role="alertdialog" aria-labelledby="cookie-prompt-title">
            <h3 id="cookie-prompt-title">Accept cookies to shop</h3>
            <p>
              Shopping, cart, and checkout need cookies. Decline keeps you on the site for browsing, but you cannot place an order until you accept.
            </p>
            <div className="cookie-banner-actions">
              <button type="button" className="cookie-btn cookie-btn-secondary" onClick={() => { decline(); setPromptOpen(false); }}>
                Keep declined
              </button>
              <button type="button" className="cookie-btn cookie-btn-primary" onClick={accept}>
                Accept & continue
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default CookieConsent;
