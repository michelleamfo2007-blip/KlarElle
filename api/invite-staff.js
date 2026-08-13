import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, role } = req.body;
  if (!email || !role) {
    return res.status(400).json({ error: "Email and role are required" });
  }

  // We need the service role key to bypass RLS and create users
  const supabaseAdmin = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: { role: role }
    });

    if (error) {
      console.error("Supabase invite error:", error);
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ success: true, user: data.user });
  } catch (error) {
    console.error("Exception inviting user:", error);
    return res.status(500).json({ error: error.message });
  }
}
