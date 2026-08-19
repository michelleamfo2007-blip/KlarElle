import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

function PageTracker() {
  const location = useLocation();

  useEffect(() => {
    const trackPageView = async () => {
      try {
        const sessionId = sessionStorage.getItem('session_id') || 
                          Math.random().toString(36).substring(2, 15);
        sessionStorage.setItem('session_id', sessionId);

        await supabase.from('page_views').insert([
          {
            path: location.pathname,
            referrer: document.referrer || null,
            user_agent: navigator.userAgent,
            session_id: sessionId
          }
        ]);
      } catch (error) {
        console.error('Error tracking page view:', error);
      }
    };

    trackPageView();
  }, [location]);

  return null;
}

export default PageTracker;
