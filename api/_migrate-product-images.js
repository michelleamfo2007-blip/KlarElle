import { createClient } from '@supabase/supabase-js';
import { createSignedUpload } from './_cloudinary.js';

const BATCH = 2;

function isHttpUrl(value) {
  return typeof value === 'string' && /^https?:\/\//i.test(value.trim());
}

export function isCloudinaryUrl(value) {
  return isHttpUrl(value) && /res\.cloudinary\.com\//i.test(value);
}

export function isSupabaseStorageUrl(value) {
  return isHttpUrl(value) && /supabase\.co\/storage\//i.test(value);
}

function isVideoUrl(value) {
  return /\.(mp4|webm|mov|m4v)(\?|$)/i.test(value);
}

function collectFromVariantEntry(entry, urls) {
  if (!entry) return;
  if (typeof entry === 'string') {
    urls.add(entry);
    return;
  }
  [entry.image, entry.url, entry.src].forEach((url) => url && urls.add(url));
  if (Array.isArray(entry.images)) entry.images.forEach((url) => url && urls.add(url));
}

export function collectProductUrls(product) {
  const urls = new Set();
  [product.image_url, product.hover_image_url, product.video_url, product.size_guide_url]
    .filter(Boolean)
    .forEach((url) => urls.add(url));
  if (Array.isArray(product.images)) product.images.forEach((url) => url && urls.add(url));
  if (product.variant_images && typeof product.variant_images === 'object') {
    Object.values(product.variant_images).forEach((entry) => collectFromVariantEntry(entry, urls));
  }
  return [...urls];
}

function rewriteUrl(value, mapped) {
  if (typeof value !== 'string') return value;
  return mapped.get(value) || value;
}

function rewriteVariantEntry(entry, mapped) {
  if (!entry) return entry;
  if (typeof entry === 'string') return rewriteUrl(entry, mapped);
  const next = { ...entry };
  if (next.image) next.image = rewriteUrl(next.image, mapped);
  if (next.url) next.url = rewriteUrl(next.url, mapped);
  if (next.src) next.src = rewriteUrl(next.src, mapped);
  if (Array.isArray(next.images)) next.images = next.images.map((url) => rewriteUrl(url, mapped));
  return next;
}

export function rewriteProduct(product, mapped) {
  const patch = {};
  if (product.image_url) patch.image_url = rewriteUrl(product.image_url, mapped);
  if (product.hover_image_url) patch.hover_image_url = rewriteUrl(product.hover_image_url, mapped);
  if (product.video_url) patch.video_url = rewriteUrl(product.video_url, mapped);
  if (product.size_guide_url) patch.size_guide_url = rewriteUrl(product.size_guide_url, mapped);
  if (Array.isArray(product.images)) patch.images = product.images.map((url) => rewriteUrl(url, mapped));
  if (product.variant_images && typeof product.variant_images === 'object') {
    const next = {};
    Object.entries(product.variant_images).forEach(([color, entry]) => {
      next[color] = rewriteVariantEntry(entry, mapped);
    });
    patch.variant_images = next;
  }
  return patch;
}

async function uploadRemoteFile(url) {
  const folder = isVideoUrl(url) ? 'klarelle/products/video' : 'klarelle/products';
  const downloaded = await fetch(url, { headers: { 'User-Agent': 'KlarelleImageMigrate/1.0' } });
  if (!downloaded.ok) {
    throw new Error(`Could not download source image (${downloaded.status})`);
  }
  const buffer = Buffer.from(await downloaded.arrayBuffer());
  const contentType = downloaded.headers.get('content-type') || (isVideoUrl(url) ? 'video/mp4' : 'image/jpeg');
  const dataUri = `data:${contentType};base64,${buffer.toString('base64')}`;

  const signed = createSignedUpload({ folder });
  const body = new URLSearchParams({
    file: dataUri,
    api_key: signed.apiKey,
    timestamp: String(signed.timestamp),
    signature: signed.signature,
    folder: signed.folder
  });
  const response = await fetch(`https://api.cloudinary.com/v1_1/${signed.cloudName}/auto/upload`, {
    method: 'POST',
    body
  });
  const uploaded = await response.json();
  if (!response.ok || !uploaded.secure_url) {
    throw new Error(uploaded.error?.message || 'Cloudinary upload failed');
  }
  return uploaded.secure_url;
}

export async function migrateProductImageBatch() {
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
  );

  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, image_url, hover_image_url, images, variant_images, video_url, size_guide_url');
  if (error) throw error;

  const pending = [];
  (products || []).forEach((product) => {
    collectProductUrls(product).forEach((url) => {
      if (isSupabaseStorageUrl(url) && !isCloudinaryUrl(url) && !pending.includes(url)) {
        pending.push(url);
      }
    });
  });

  const batch = pending.slice(0, BATCH);
  const mapped = new Map();
  const errors = [];

  for (const url of batch) {
    try {
      mapped.set(url, await uploadRemoteFile(url));
    } catch (error) {
      errors.push({ url, message: error.message });
    }
  }

  let updatedProducts = 0;
  if (mapped.size) {
    for (const product of products || []) {
      const used = collectProductUrls(product).some((url) => mapped.has(url));
      if (!used) continue;
      const { error: updateError } = await supabase
        .from('products')
        .update(rewriteProduct(product, mapped))
        .eq('id', product.id);
      if (!updateError) updatedProducts += 1;
    }
  }

  return {
    copied: mapped.size,
    failed: errors.length,
    errors,
    updatedProducts,
    remaining: Math.max(0, pending.length - mapped.size),
    pendingTotal: pending.length
  };
}
