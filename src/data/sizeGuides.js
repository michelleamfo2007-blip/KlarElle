import { formatSizeLabel } from '../utils/size.js';

/** Mesh dress body measurements (inches) from KlarElle size guide. */
const MESH_DRESS_INCHES = [
  { size: 'S', bust: [32, 34], waist: [24, 26], hips: [36, 39], length: 57.1 },
  { size: 'M', bust: [34, 36], waist: [26, 28], hips: [39, 42], length: 58.3 },
  { size: 'L', bust: [36, 38], waist: [28, 30], hips: [42, 44], length: 59.4 },
  { size: 'XL', bust: [38, 40], waist: [30, 33], hips: [44, 47], length: 60.6 }
];

function inchToCm(value) {
  return Math.round(Number(value) * 2.54 * 10) / 10;
}

function rangeToCm(range) {
  const [min, max] = range;
  return {
    min: inchToCm(min),
    max: inchToCm(max),
    mid: inchToCm((min + max) / 2)
  };
}

/** Size chart rows stored in cm (system standard), with ranges for display + fit. */
export const MESH_DRESS_SIZE_CHART = MESH_DRESS_INCHES.map((row) => {
  const bust = rangeToCm(row.bust);
  const waist = rangeToCm(row.waist);
  const hip = rangeToCm(row.hips);
  return {
    size: row.size,
    bust: bust.mid,
    bustMin: bust.min,
    bustMax: bust.max,
    waist: waist.mid,
    waistMin: waist.min,
    waistMax: waist.max,
    hip: hip.mid,
    hipMin: hip.min,
    hipMax: hip.max,
    length: inchToCm(row.length),
    guide: 'mesh'
  };
});

export const MESH_DRESS_GUIDE_NOTE =
  'This mesh dress offers slight stretch. Select the size that accommodates your largest measurement. If you are between sizes, we recommend sizing up.';

/**
 * Exact product titles that use the mesh dress size guide.
 * Matching is normalized (trim, case, accents, extra spaces).
 */
export const MESH_DRESS_PRODUCT_NAMES = [
  'Mia-Analise Gown',
  'Avrielle Gown',
  'Zarellia Rhinestone Gown',
  'Estrallia Fringe Gown',
  'Brielle Fringe Gown',
  'Zaria Crystal Gown',
  'Amara Rhinestone Gown',
  'Elaris Mini Crystal Gown',
  'Zavielle Luxe Gown',
  'Arielle Fringe Gown',
  'Golden Prism Royale',
  'Gilded Cascade Royale',
  'Luxurelle Royal Ember',
  'Zaina Cascade Gown',
  'Zainia Cascade Gown',
  'Fleur de Roselle Dress',
  'Éloria Noir Gown',
  'Eloria Noir Gown',
  'Elaris Heavy Crystal Gown',
  'Ellaris Heavy Crystal Gown'
];

function normalizeProductName(name = '') {
  return String(name)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

const MESH_NAME_SET = new Set(MESH_DRESS_PRODUCT_NAMES.map(normalizeProductName));

export function isMeshDressProduct(productOrName) {
  const name = typeof productOrName === 'string' ? productOrName : productOrName?.name;
  return MESH_NAME_SET.has(normalizeProductName(name));
}

export function getMeshDressSizeChart(sizes = []) {
  const available = (sizes || []).map((size) => formatSizeLabel(size)).filter(Boolean);
  const standard = available.filter((size) => ['S', 'M', 'L', 'XL'].includes(size));
  if (!standard.length) return MESH_DRESS_SIZE_CHART;

  return standard.map((size) => {
    const row = MESH_DRESS_SIZE_CHART.find((item) => item.size === size);
    return row || { size, bust: null, waist: null, hip: null, length: null, guide: 'mesh' };
  }).filter((row) => row.bust != null || row.bustMax != null);
}

export function resolveProductSizeChart(product) {
  if (!product) return null;
  if (isMeshDressProduct(product)) {
    return getMeshDressSizeChart(product.parsedSizes || product.sizes || []);
  }
  return product.size_chart || null;
}
