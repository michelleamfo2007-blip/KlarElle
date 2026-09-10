import {
  colorCodes as officialColorCodes,
  prefixes,
  stylesById,
  stylesByName,
  usedStyleCodes,
  variantLookup
} from '../data/skuMaster.js';
import { getColorCode as fallbackColorCode } from './colors.js';
import { formatSizeLabel } from './size.js';

const OFFICIAL_SKU = /^KLA-(D|TOP|SET|SKT|BTM|JMP|SHP|OUT|ACC)\d+-[A-Z0-9]+-[A-Z0-9]+$/i;

export function normalizeSkuName(value = '') {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function isOfficialSku(sku) {
  return OFFICIAL_SKU.test(String(sku || '').trim());
}

export function parseStyleCode(sku) {
  const match = String(sku || '').trim().match(/^KLA-(D|TOP|SET|SKT|BTM|JMP|SHP|OUT|ACC)(\d+)/i);
  if (!match) return '';
  return `${match[1].toUpperCase()}${match[2]}`;
}

export function officialColorCode(color) {
  const normalized = normalizeSkuName(color);
  if (officialColorCodes[normalized]) return officialColorCodes[normalized];
  const keys = Object.keys(officialColorCodes).sort((a, b) => b.length - a.length);
  const match = keys.find((key) => normalized === key || normalized.includes(key));
  if (match) return officialColorCodes[match];
  return fallbackColorCode(color);
}

export function lookupStyle({ productId, name, sku } = {}) {
  if (productId && stylesById[productId]) return stylesById[productId];
  const byName = stylesByName[normalizeSkuName(name)];
  if (byName) return byName;
  const fromSku = parseStyleCode(sku);
  if (fromSku) {
    const listed = Object.values(stylesByName).find((item) => item.styleCode === fromSku);
    return listed || { styleCode: fromSku };
  }
  return null;
}

export function prefixForCategory(category = '', productType = '') {
  const haystack = `${category} ${productType}`.toLowerCase();
  if (haystack.includes('shape')) return prefixes['Shapewear'] || { prefix: 'SHP', nextUnused: 'SHP002' };
  if (haystack.includes('top')) return prefixes.Top || { prefix: 'TOP', nextUnused: 'TOP001' };
  if (haystack.includes('set') || haystack.includes('coord')) return prefixes['Set / Co-ord'] || { prefix: 'SET', nextUnused: 'SET001' };
  if (haystack.includes('skirt')) return prefixes.Skirt || { prefix: 'SKT', nextUnused: 'SKT001' };
  if (haystack.includes('bottom') || haystack.includes('trouser') || haystack.includes('pant')) {
    return prefixes['Bottom / Trouser'] || { prefix: 'BTM', nextUnused: 'BTM001' };
  }
  if (haystack.includes('jump') || haystack.includes('romper')) return prefixes['Jumpsuit / Romper'] || { prefix: 'JMP', nextUnused: 'JMP001' };
  if (haystack.includes('outer') || haystack.includes('coat') || haystack.includes('jacket')) {
    return prefixes.Outerwear || { prefix: 'OUT', nextUnused: 'OUT001' };
  }
  if (haystack.includes('accessor')) return prefixes.Accessory || { prefix: 'ACC', nextUnused: 'ACC001' };
  return prefixes['Dress / Gown'] || { prefix: 'D', nextUnused: 'D060' };
}

function incrementCode(code) {
  const match = String(code || '').match(/^([A-Z]+)(\d+)$/i);
  if (!match) return code;
  const width = match[2].length;
  return `${match[1].toUpperCase()}${String(Number(match[2]) + 1).padStart(width, '0')}`;
}

export function collectStyleCodes(products = []) {
  const used = new Set(usedStyleCodes);
  products.forEach((product) => {
    const fromSku = parseStyleCode(product?.sku);
    if (fromSku) used.add(fromSku);
    Object.values(product?.variant_images || {}).forEach((variant) => {
      Object.values(variant?.skus || {}).forEach((sku) => {
        const code = parseStyleCode(sku);
        if (code) used.add(code);
      });
    });
  });
  return used;
}

export function nextStyleCode(category, used = new Set()) {
  const guide = prefixForCategory(category);
  let candidate = guide.nextUnused || `${guide.prefix}001`;
  while (used.has(candidate)) candidate = incrementCode(candidate);
  return candidate;
}

export function lookupMasterVariant({ productId, styleCode, color, size } = {}) {
  const sizeCode = formatSizeLabel(size);
  const colorKey = normalizeSkuName(color);
  return variantLookup[`${productId}|${colorKey}|${sizeCode}`]
    || variantLookup[`${styleCode}|${colorKey}|${sizeCode}`]
    || null;
}

export function generateOfficialSku(styleCode, color, size) {
  const sizeCode = formatSizeLabel(size) || 'OS';
  return `KLA-${styleCode}-${officialColorCode(color)}-${sizeCode}`;
}

export function resolveVariantSku({
  productId,
  name,
  color,
  size,
  existingSku,
  styleCode,
  sku
} = {}) {
  if (isOfficialSku(existingSku)) return existingSku.trim();
  const style = styleCode || lookupStyle({ productId, name, sku })?.styleCode;
  const master = lookupMasterVariant({ productId, styleCode: style, color, size });
  if (master?.existingSku && isOfficialSku(master.existingSku)) return master.existingSku;
  if (master?.sku) return master.sku;
  if (style) return generateOfficialSku(style, color, size);
  return existingSku || '';
}

export function resolveVariantBin({ productId, name, color, size, existingBin, styleCode } = {}) {
  if (existingBin) return existingBin;
  const style = styleCode || lookupStyle({ productId, name })?.styleCode;
  return lookupMasterVariant({ productId, styleCode: style, color, size })?.bin || '';
}

export function getVariantSkuFromProduct(product, color, size) {
  const colors = Array.isArray(product?.colors)
    ? product.colors
    : String(product?.colors || '').split(/[;,]+/).map((value) => String(value).trim()).filter(Boolean);
  const sizes = Array.isArray(product?.sizes)
    ? product.sizes
    : String(product?.sizes || '').split(/[;,]+/).map((value) => String(value).trim()).filter(Boolean);
  const useColor = color && !/^standard$/i.test(String(color).trim()) ? color : colors[0];
  const useSize = size || sizes[0];
  const sizeCode = formatSizeLabel(useSize);
  const variants = product?.variant_images || {};
  const direct = variants[useColor]?.skus?.[sizeCode] || variants[useColor]?.skus?.[useSize];
  if (isOfficialSku(direct)) return direct;
  const matchColor = Object.keys(variants).find((key) => normalizeSkuName(key) === normalizeSkuName(useColor));
  const fromColor = matchColor
    ? (variants[matchColor]?.skus?.[sizeCode] || variants[matchColor]?.skus?.[useSize])
    : '';
  if (isOfficialSku(fromColor)) return fromColor;
  const resolved = resolveVariantSku({
    productId: product?.id,
    name: product?.name,
    color: useColor,
    size: sizeCode,
    existingSku: isOfficialSku(product?.sku) ? product.sku : '',
    sku: isOfficialSku(product?.sku) ? product.sku : ''
  });
  if (isOfficialSku(resolved)) return resolved;
  return isOfficialSku(product?.sku) ? product.sku : (resolved || '');
}
