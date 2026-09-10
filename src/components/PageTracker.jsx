import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { visitorIsStaff } from '../utils/visitor';
import { hasAcceptedCookies } from '../utils/cookieConsent';

function isStaffOnlyPath(path) {
  return path.startsWith('/admin')
    || path.startsWith('/super-admin')
    || path.startsWith('/update-password');
}

function PageTracker() {
  const location = useLocation();

  useEffect(() => {
    if (!hasAcceptedCookies()) return;

    if (!isStaffOnlyPath(location.pathname) && typeof window.gtag === 'function') {
      window.gtag('event', 'page_view', {
        send_to: 'G-13R3HNGKMK',
        page_path: `${location.pathname}${location.search}`,
        page_title: document.title,
        page_location: window.location.href
      });
    }

    const trackPageView = async () => {
      try {
        if (isStaffOnlyPath(location.pathname)) return;
        if (location.pathname.startsWith('/product/')) return;
        if (await visitorIsStaff()) return;

        const sessionId = sessionStorage.getItem('session_id')
          || Math.random().toString(36).substring(2, 15);
        sessionStorage.setItem('session_id', sessionId);

        const { error } = await supabase.from('page_views').insert([
          {
            path: location.pathname,
            referrer: document.referrer || null,
            user_agent: navigator.userAgent,
            session_id: sessionId
          }
        ]);
        if (error) console.error('Error tracking page view:', error.message);
      } catch (error) {
        console.error('Error tracking page view:', error);
      }
    };

    trackPageView();
  }, [location]);

  return null;
}

export default PageTracker;
