import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { normalizeSizeList } from '../src/utils/size.js';
import {
  collectStyleCodes,
  isOfficialSku,
  lookupStyle,
  nextStyleCode,
  resolveVariantBin,
  resolveVariantSku
} from '../src/utils/sku.js';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}

const supabase = createClient(supabaseUrl, supabaseKey);

function parseList(value) {
  const raw = Array.isArray(value) ? value : (typeof value === 'string' ? [value] : []);
  return raw.flatMap((item) => String(item).split(/[;,]+/)).map((item) => item.trim()).filter(Boolean);
}

async function backfill() {
  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, sku, colors, sizes, variant_images, category');
  if (error) throw error;

  const used = collectStyleCodes(products || []);
  let updated = 0;

  for (const product of products || []) {
    const listed = lookupStyle({ productId: product.id, name: product.name, sku: product.sku });
    let styleCode = listed?.styleCode;
    if (!styleCode) {
      styleCode = nextStyleCode(product.category, used);
      used.add(styleCode);
    }

    const colors = parseList(product.colors);
    const sizes = normalizeSizeList(parseList(product.sizes));
    const variants = product.variant_images && typeof product.variant_images === 'object'
      ? { ...product.variant_images }
      : {};

    let firstSku = '';
    if (colors.length && sizes.length) {
      colors.forEach((color) => {
        const current = variants[color] && typeof variants[color] === 'object'
          ? { ...variants[color] }
          : { stock: {} };
        current.skus = { ...(current.skus || {}) };
        current.bins = { ...(current.bins || {}) };
        sizes.forEach((size) => {
          const sku = resolveVariantSku({
            productId: product.id,
            name: product.name,
            color,
            size,
            existingSku: isOfficialSku(current.skus[size]) ? current.skus[size] : '',
            styleCode
          });
          current.skus[size] = sku;
          current.bins[size] = resolveVariantBin({
            productId: product.id,
            name: product.name,
            color,
            size,
            existingBin: current.bins[size],
            styleCode
          });
          if (!firstSku) firstSku = sku;
        });
        variants[color] = current;
      });
    }

    const nextSku = isOfficialSku(product.sku) ? product.sku : (firstSku || `KLA-${styleCode}`);

    const { error: updateError } = await supabase
      .from('products')
      .update({ sku: nextSku, variant_images: variants })
      .eq('id', product.id);

    if (updateError) {
      console.error(`Failed ${product.id} (${product.name}):`, updateError.message);
      continue;
    }

    updated += 1;
    console.log(`${styleCode}  ${product.name}: ${nextSku}`);
  }

  console.log(`Updated ${updated} of ${(products || []).length} products.`);
}

backfill().catch((error) => {
  console.error(error);
  process.exit(1);
});
