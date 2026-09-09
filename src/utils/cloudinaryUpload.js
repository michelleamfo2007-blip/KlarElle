import { supabase } from '../lib/supabase';

async function signedCloudinaryUpload(file, kind = 'image') {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;
  if (!token) {
    throw new Error('Please sign in to the admin dashboard before uploading.');
  }

  const signResponse = await fetch('/api/cloudinary-sign', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ kind })
  });

  const signed = await signResponse.json();
  if (!signResponse.ok) {
    throw new Error(signed.error || 'Could not start Cloudinary upload.');
  }

  const form = new FormData();
  form.append('file', file);
  form.append('api_key', signed.apiKey);
  form.append('timestamp', String(signed.timestamp));
  form.append('signature', signed.signature);
  form.append('folder', signed.folder);

  const uploadResponse = await fetch(
    `https://api.cloudinary.com/v1_1/${signed.cloudName}/auto/upload`,
    { method: 'POST', body: form }
  );
  const uploaded = await uploadResponse.json();
  if (!uploadResponse.ok || !uploaded.secure_url) {
    throw new Error(uploaded.error?.message || 'Cloudinary upload failed.');
  }
  return uploaded.secure_url;
}

async function supabaseStorageUpload(file, prefix = '') {
  const fileExt = file.name.split('.').pop();
  const fileName = `${prefix}${Math.random()}.${fileExt}`;
  const { error } = await supabase.storage.from('product-images').upload(fileName, file);
  if (error) throw error;
  const { data } = supabase.storage.from('product-images').getPublicUrl(fileName);
  return data.publicUrl;
}

export async function uploadProductAsset(file, { kind = 'image', prefix = '' } = {}) {
  try {
    return await signedCloudinaryUpload(file, kind);
  } catch (error) {
    const message = String(error?.message || '');
    if (message.includes('not configured')) {
      return supabaseStorageUpload(file, prefix);
    }
    throw error;
  }
}
