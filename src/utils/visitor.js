import { supabase } from '../lib/supabase';

export async function visitorIsStaff() {
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
