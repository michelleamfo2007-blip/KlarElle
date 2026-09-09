import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { cloudinaryConfigured, createSignedUpload } from '../api/_cloudinary.js';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

function isHttpUrl(value) {
  return typeof value === 'string' && /^https?:\/\//i.test(value.trim());
}

function isCloudinaryUrl(value) {
  return isHttpUrl(value) && /res\.cloudinary\.com\//i.test(value);
}

function isSupabaseStorageUrl(value) {
  return isHttpUrl(value) && /supabase\.co\/storage\//i.test(value);
}

function isVideoUrl(value) {
  return /\.(mp4|webm|mov|m4v)(\?|$)/i.test(value) || /\/video\//i.test(value);
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

function collectProductUrls(product) {
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

function rewriteProduct(product, mapped) {
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

function productNeedsUpdate(product, mapped) {
  if (!mapped.size) return false;
  return collectProductUrls(product).some((url) => mapped.has(url));
}

async function uploadRemoteFile(url) {
  const kind = isVideoUrl(url) ? 'video' : 'image';
  const folder = kind === 'video' ? 'klarelle/products/video' : 'klarelle/products';
  const signed = createSignedUpload({ folder });
  const body = new URLSearchParams({
    file: url,
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
    throw new Error(uploaded.error?.message || `Cloudinary rejected ${url}`);
  }
  return uploaded.secure_url;
}

async function migrate() {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }
  if (!cloudinaryConfigured()) {
    throw new Error('Missing CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, or CLOUDINARY_API_SECRET');
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, image_url, hover_image_url, images, variant_images, video_url, size_guide_url');
  if (error) throw error;

  const toCopy = new Set();
  (products || []).forEach((product) => {
    collectProductUrls(product).forEach((url) => {
      if (isSupabaseStorageUrl(url) && !isCloudinaryUrl(url)) toCopy.add(url);
    });
  });

  const mapped = new Map();
  let copied = 0;
  let failed = 0;

  for (const url of toCopy) {
    try {
      const cloudinaryUrl = await uploadRemoteFile(url);
      mapped.set(url, cloudinaryUrl);
      copied += 1;
      console.log(`copied ${copied}/${toCopy.size}`);
      await new Promise((resolve) => setTimeout(resolve, 250));
    } catch (error) {
      failed += 1;
      console.error(`failed: ${url}`);
      console.error(error.message);
    }
  }

  let updatedProducts = 0;
  for (const product of products || []) {
    if (!productNeedsUpdate(product, mapped)) continue;
    const patch = rewriteProduct(product, mapped);
    const { error: updateError } = await supabase.from('products').update(patch).eq('id', product.id);
    if (updateError) {
      console.error(`db update failed for ${product.name}: ${updateError.message}`);
      continue;
    }
    updatedProducts += 1;
  }

  console.log(JSON.stringify({
    products: (products || []).length,
    supabaseUrls: toCopy.size,
    copied,
    failed,
    updatedProducts,
    skippedAlreadyCloudinary: (products || []).filter((product) =>
      collectProductUrls(product).some(isCloudinaryUrl)
    ).length
  }, null, 2));
}

migrate().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
