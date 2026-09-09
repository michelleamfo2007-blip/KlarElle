import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

function isStaffOnlyPath(path) {
  return path.startsWith('/admin')
    || path.startsWith('/super-admin')
    || path.startsWith('/update-password');
}

async function visitorIsStaff() {
  const { data: sessionData } = await supabase.auth.getSession();
  const email = sessionData?.session?.user?.email;
  if (!email) return false;

  const cached = sessionStorage.getItem('klarelle_is_staff');
  const cachedEmail = sessionStorage.getItem('klarelle_is_staff_email');
  if (cached && cachedEmail === email) return cached === '1';

  const { data, error } = await supabase
    .from('staff')
    .select('id')
    .ilike('email', email)
    .eq('status', 'Active')
    .maybeSingle();

  if (error) return false;
  const isStaff = Boolean(data?.id);
  sessionStorage.setItem('klarelle_is_staff', isStaff ? '1' : '0');
  sessionStorage.setItem('klarelle_is_staff_email', email);
  return isStaff;
}

function PageTracker() {
  const location = useLocation();

  useEffect(() => {
    if (!isStaffOnlyPath(location.pathname) && typeof window.gtag === 'function') {
      window.gtag('event', 'page_view', {
        page_path: `${location.pathname}${location.search}`,
        page_title: document.title,
        page_location: window.location.href
      });
    }

    const trackPageView = async () => {
      try {
        if (isStaffOnlyPath(location.pathname)) return;
        if (await visitorIsStaff()) return;

        const sessionId = sessionStorage.getItem('session_id')
          || Math.random().toString(36).substring(2, 15);
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
