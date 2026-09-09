import { createClient } from '@supabase/supabase-js';
import { cloudinaryConfigured, createSignedUpload } from './_cloudinary.js';
import { migrateProductImageBatch } from './_migrate-product-images.js';

function setCors(res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
}

async function requireStaff(req) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token || !process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_ANON_KEY) {
    return null;
  }

  const authClient = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
  const { data: { user }, error } = await authClient.auth.getUser(token);
  if (error || !user?.email) return null;

  const admin = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
  );
  const { data: staff } = await admin
    .from('staff')
    .select('id, email, status')
    .ilike('email', user.email)
    .eq('status', 'Active')
    .maybeSingle();

  return staff || null;
}

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!cloudinaryConfigured()) {
    return res.status(500).json({ error: 'Cloudinary is not configured on the server.' });
  }

  const staff = await requireStaff(req);
  if (!staff) {
    return res.status(401).json({ error: 'Admin sign-in is required to upload.' });
  }

  if (req.body?.action === 'migrate') {
    try {
      const result = await migrateProductImageBatch();
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ error: error.message || 'Migration batch failed.' });
    }
  }

  const kind = req.body?.kind === 'video' ? 'video' : 'image';
  const folder = kind === 'video' ? 'klarelle/products/video' : 'klarelle/products';

  return res.status(200).json(createSignedUpload({ folder }));
}
