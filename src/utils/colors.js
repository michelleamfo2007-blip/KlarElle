const SHADE_HEX = {
  black: '#111111',
  'jet black': '#0a0a0a',
  'off black': '#1a1a1a',
  white: '#ffffff',
  ivory: '#fffff0',
  cream: '#fffdd0',
  ecru: '#c2b280',
  champagne: '#f7e7ce',
  nude: '#e3bc9a',
  beige: '#f5f5dc',
  tan: '#d2b48c',
  khaki: '#c3b091',
  taupe: '#483c32',
  camel: '#c19a6b',
  brown: '#6b3e26',
  chocolate: '#4a2c0a',
  espresso: '#3c2415',
  mocha: '#967969',
  rust: '#b7410e',
  terracotta: '#e2725b',
  copper: '#b87333',
  gold: '#d4af37',
  silver: '#c0c0c0',
  grey: '#808080',
  gray: '#808080',
  charcoal: '#36454f',
  'heather grey': '#9c9c9c',
  red: '#c41e3a',
  crimson: '#9b111e',
  scarlet: '#ff2400',
  burgundy: '#6d0f1a',
  wine: '#722f37',
  maroon: '#800000',
  oxblood: '#4a000f',
  blush: '#de5d83',
  rose: '#e8b4b8',
  'dusty rose': '#dcae96',
  'rose gold': '#b76e79',
  pink: '#f4c2c2',
  'hot pink': '#ff69b4',
  fuchsia: '#ff00af',
  magenta: '#ca1f7b',
  coral: '#ff7f50',
  peach: '#ffcba4',
  orange: '#e67e22',
  mustard: '#e1ad01',
  yellow: '#f4d35e',
  lemon: '#fff44f',
  green: '#2e6b4f',
  emerald: '#046307',
  forest: '#0b3d2e',
  olive: '#708238',
  sage: '#9caf88',
  mint: '#98ff98',
  teal: '#008080',
  turquoise: '#40e0d0',
  aqua: '#00ffff',
  blue: '#2a4b8d',
  'royal blue': '#1857c4',
  royal: '#1857c4',
  'navy blue': '#001f3f',
  navy: '#001f3f',
  midnight: '#191970',
  'midnight blue': '#191970',
  indigo: '#3f00ff',
  cobalt: '#0047ab',
  sapphire: '#0f52ba',
  sky: '#87ceeb',
  'sea blue': '#4a90a4',
  'baby pink': '#f4c2c2',
  ash: '#b2beb5',
  lime: '#32cd32',
  'sky blue': '#87ceeb',
  'baby blue': '#89cff0',
  'powder blue': '#b0e0e6',
  'light blue': '#add8e6',
  'dark blue': '#00008b',
  denim: '#1560bd',
  purple: '#5b2c6f',
  lilac: '#c8a2c8',
  lavender: '#b57edc',
  plum: '#8e4585',
  violet: '#7f00ff',
  mauve: '#e0b0ff'
};

const COLOR_CODES = {
  black: 'BLK',
  white: 'WHT',
  ivory: 'IVR',
  cream: 'CRM',
  champagne: 'CHP',
  nude: 'NDE',
  beige: 'BGE',
  ash: 'ASH',
  'baby pink': 'BPK',
  'sea blue': 'SBL',
  'light blue': 'LBL',
  lime: 'LIM',
  crimson: 'CRI',
  wine: 'WIN',
  'black and white': 'BWT',
  'black and white ombre': 'BWO',
  'blue ombre': 'BLO',
  'mint green and white ombre': 'MWO',
  'pink and white ombre': 'PWO',
  'red and white': 'RWT',
  multi: 'MLT',
  'multi colored': 'MLT',
  violet: 'VIO',
  purple: 'PUR',
  tan: 'TAN',
  khaki: 'KHK',
  taupe: 'TPE',
  camel: 'CML',
  brown: 'BRN',
  chocolate: 'CHC',
  rust: 'RST',
  gold: 'GLD',
  silver: 'SLV',
  grey: 'GRY',
  gray: 'GRY',
  charcoal: 'CHR',
  red: 'RED',
  burgundy: 'BDG',
  maroon: 'MRN',
  blush: 'BLS',
  rose: 'RSE',
  'dusty rose': 'DRS',
  pink: 'PNK',
  coral: 'CRL',
  peach: 'PCH',
  orange: 'ORG',
  mustard: 'MST',
  yellow: 'YLW',
  green: 'GRN',
  emerald: 'EMR',
  olive: 'OLV',
  sage: 'SGE',
  mint: 'MNT',
  teal: 'TEL',
  blue: 'BLU',
  'royal blue': 'RBL',
  royal: 'RBL',
  'navy blue': 'NVY',
  navy: 'NVY',
  midnight: 'MID',
  'midnight blue': 'MID',
  indigo: 'IND',
  cobalt: 'COB',
  sapphire: 'SPH',
  denim: 'DNM',
  lilac: 'LLC',
  lavender: 'LAV',
  plum: 'PLM'
};

function normalizeColorName(name = '') {
  return String(name)
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function longestShadeMatch(normalized, dictionary) {
  const keys = Object.keys(dictionary).sort((a, b) => b.length - a.length);
  return keys.find((key) => normalized === key || normalized.includes(key)) || '';
}

export function getColorHex(name) {
  const normalized = normalizeColorName(name);
  if (!normalized) return '#cccccc';
  if (SHADE_HEX[normalized]) return SHADE_HEX[normalized];

  const match = longestShadeMatch(normalized, SHADE_HEX);
  if (match) return SHADE_HEX[match];

  const cssName = normalized.replace(/\s+/g, '');
  if (typeof CSS !== 'undefined' && CSS.supports?.('color', cssName)) {
    return cssName;
  }

  return '#cccccc';
}

export function getColorCode(name) {
  const normalized = normalizeColorName(name);
  if (COLOR_CODES[normalized]) return COLOR_CODES[normalized];
  const match = longestShadeMatch(normalized, COLOR_CODES);
  if (match) return COLOR_CODES[match];
  return normalized.replace(/[^a-z0-9]/g, '').slice(0, 3).toUpperCase() || 'CLR';
}

export function getStyleCode(productName = '') {
  const stop = new Set(['the', 'a', 'an', 'and', 'of', 'in', 'with', 'for']);
  const words = String(productName)
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word && !stop.has(word.toLowerCase()));

  if (!words.length) return 'STYLE';
  return words.slice(0, 3).join('-').slice(0, 18);
}

export function generateVariantSku(productName, color, size) {
  const style = getStyleCode(productName);
  const colorCode = getColorCode(color);
  const sizeCode = String(size || '').replace(/\s+/g, '').toUpperCase() || 'OS';
  return `KLA-${style}-${colorCode}-${sizeCode}`;
}

export function parseProductColors(colors) {
  if (!colors) return [];
  const raw = Array.isArray(colors) ? colors : [colors];
  return raw
    .flatMap((value) => String(value).split(/[;,]+/))
    .map((value) => value.trim())
    .filter(Boolean);
}

function uniqueImageUrls(urls) {
  const out = [];
  urls.forEach((url) => {
    if (url && typeof url === 'string' && !out.includes(url)) out.push(url);
  });
  return out;
}

function urlsFromVariantEntry(entry) {
  if (!entry) return [];
  if (typeof entry === 'string') return [entry];
  const urls = [];
  [entry.image, entry.url, entry.src].forEach((url) => {
    if (url) urls.push(url);
  });
  if (Array.isArray(entry.images)) urls.push(...entry.images);
  return uniqueImageUrls(urls);
}

export function findVariantEntry(variantImages, color) {
  if (!variantImages || typeof variantImages !== 'object' || !color) return null;
  if (variantImages[color]) return variantImages[color];
  const needle = String(color).trim().toLowerCase();
  const keys = Object.keys(variantImages);
  const exact = keys.find((key) => key.trim().toLowerCase() === needle);
  if (exact) return variantImages[exact];
  const partial = keys.find((key) => {
    const normalized = key.trim().toLowerCase();
    return normalized.includes(needle) || needle.includes(normalized);
  });
  return partial ? variantImages[partial] : null;
}

export function getVariantImage(variantImages, color) {
  return urlsFromVariantEntry(findVariantEntry(variantImages, color))[0] || null;
}

export function getColorGallery(product) {
  return uniqueImageUrls([
    product?.image_url,
    product?.hover_image_url,
    ...(Array.isArray(product?.images) ? product.images : [])
  ]);
}

function urlLooksLikeColor(url, color) {
  const path = decodeURIComponent(String(url || '')).toLowerCase();
  const name = normalizeColorName(color);
  if (!path || !name) return false;
  const tokens = name.split(' ').filter((token) => token.length >= 4);
  const slug = name.replace(/\s+/g, '-');
  const compact = name.replace(/\s+/g, '');
  const code = getColorCode(color).toLowerCase();
  if (path.includes(slug) || path.includes(compact) || path.includes(name)) return true;
  if (code.length >= 3 && new RegExp(`(?:^|[^a-z0-9])${code}(?:[^a-z0-9]|$)`, 'i').test(path)) return true;
  return tokens.some((token) => path.includes(token));
}

function matchColorKey(keys, color) {
  if (!keys?.length || !color) return '';
  const needle = normalizeColorName(color);
  return keys.find((key) => normalizeColorName(key) === needle)
    || keys.find((key) => {
      const name = normalizeColorName(key);
      return name.includes(needle) || needle.includes(name);
    })
    || '';
}

function splitEvenly(list, bucketCount) {
  const buckets = Array.from({ length: bucketCount }, () => []);
  if (!list.length || bucketCount < 1) return buckets;
  const base = Math.floor(list.length / bucketCount);
  const extra = list.length % bucketCount;
  let index = 0;
  for (let i = 0; i < bucketCount; i += 1) {
    const count = base + (i < extra ? 1 : 0);
    buckets[i] = list.slice(index, index + count);
    index += count;
  }
  return buckets;
}

export function galleryByColor(product) {
  const colors = parseProductColors(product?.colors);
  const gallery = getColorGallery(product);
  const groups = {};
  colors.forEach((color) => {
    groups[color] = urlsFromVariantEntry(findVariantEntry(product?.variant_images, color));
  });

  gallery.forEach((url) => {
    const named = colors.find((color) => urlLooksLikeColor(url, color));
    if (named && !groups[named].includes(url)) groups[named].push(url);
  });

  const used = new Set(Object.values(groups).flat());
  const leftover = gallery.filter((url) => !used.has(url));
  const empty = colors.filter((color) => !groups[color].length);

  if (leftover.length && empty.length) {
    const buckets = splitEvenly(leftover, empty.length);
    empty.forEach((color, index) => {
      groups[color] = buckets[index] || [];
    });
  }

  return groups;
}

function imagesForColor(product, color) {
  const groups = galleryByColor(product);
  const key = matchColorKey(Object.keys(groups), color) || parseProductColors(product?.colors)[0];
  const grouped = (key && groups[key]) || [];
  if (grouped.length) return grouped;
  return getColorGallery(product);
}

export function collectImagesForColor(product, color) {
  const urls = uniqueImageUrls(imagesForColor(product, color));
  return urls.length ? urls : ['/placeholder.png'];
}

export function getDisplayImageForColor(product, color) {
  if (!product) return '/placeholder.png';
  return imagesForColor(product, color)[0] || '/placeholder.png';
}
