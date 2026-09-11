export const MATERIAL_DETAILS = {
  Cotton: {
    composition: '100% Cotton',
    pattern_type: 'Plain',
    style: 'Casual',
    care_instructions: 'Machine wash cold. Tumble dry low. Do not bleach.',
    features: 'Slight stretch'
  },
  Spandex: {
    composition: '90% Polyester, 10% Spandex',
    pattern_type: 'Plain',
    style: 'Casual',
    care_instructions: 'Machine wash cold. Hang dry. Do not bleach or iron.',
    features: 'High stretch'
  },
  Polyester: {
    composition: '100% Polyester',
    pattern_type: 'Plain',
    style: 'Casual',
    care_instructions: 'Machine wash cold. Hang dry. Cool iron if needed.',
    features: 'Slight stretch'
  },
  Silk: {
    composition: '100% Silk',
    pattern_type: 'Plain',
    style: 'Elegant',
    care_instructions: 'Dry clean only or hand wash cold. Do not wring. Lay flat to dry.',
    features: 'No stretch'
  },
  Linen: {
    composition: '100% Linen',
    pattern_type: 'Plain',
    style: 'Casual',
    care_instructions: 'Machine wash cold. Hang dry. Warm iron while slightly damp.',
    features: 'No stretch'
  },
  Wool: {
    composition: '100% Wool',
    pattern_type: 'Plain',
    style: 'Elegant',
    care_instructions: 'Dry clean only. Do not machine wash or tumble dry.',
    features: 'Slight stretch'
  },
  Denim: {
    composition: '98% Cotton, 2% Elastane',
    pattern_type: 'Plain',
    style: 'Casual',
    care_instructions: 'Machine wash cold inside out. Hang dry. Do not bleach.',
    features: 'Slight stretch'
  },
  Leather: {
    composition: '100% Leather',
    pattern_type: 'Plain',
    style: 'Elegant',
    care_instructions: 'Wipe clean with a damp cloth. Do not wash or dry clean.',
    features: 'No stretch'
  },
  Velvet: {
    composition: '100% Polyester Velvet',
    pattern_type: 'Plain',
    style: 'Elegant',
    care_instructions: 'Dry clean only. Do not wring or tumble dry.',
    features: 'Slight stretch'
  },
  'Knitted Fabric': {
    composition: '95% Polyester, 5% Elastane',
    pattern_type: 'Plain',
    style: 'Elegant',
    care_instructions: 'Hand wash cold. Lay flat to dry. Do not wring.',
    features: 'Slight stretch'
  },
  Chiffon: {
    composition: '100% Polyester',
    pattern_type: 'Plain',
    style: 'Elegant',
    care_instructions: 'Hand wash cold or dry clean. Hang dry. Cool iron on reverse.',
    features: 'No stretch'
  },
  Lace: {
    composition: '90% Nylon, 10% Spandex',
    pattern_type: 'Floral',
    style: 'Elegant',
    care_instructions: 'Hand wash cold. Hang dry. Do not wring or bleach.',
    features: 'Slight stretch'
  }
};

export function normalizeMaterialName(material = '') {
  const trimmed = String(material || '').trim();
  if (!trimmed) return '';
  const key = trimmed.toLowerCase();
  if (key === 'knitted' || key === 'knitted fabric') return 'Knitted Fabric';
  const match = Object.keys(MATERIAL_DETAILS).find((name) => name.toLowerCase() === key);
  return match || trimmed;
}

export function getMaterialDetails(material) {
  return MATERIAL_DETAILS[normalizeMaterialName(material)] || null;
}

export function applyMaterialDetails(product = {}) {
  const defaults = getMaterialDetails(product.material) || {};
  const stored = String(product.composition || '').trim();
  const materialName = String(product.material || '').trim();
  const compositionIsGeneric = !stored
    || stored.toLowerCase() === materialName.toLowerCase()
    || (!/\d/.test(stored) && stored.split(/\s+/).length <= 2);
  return {
    composition: compositionIsGeneric ? (defaults.composition || stored) : stored,
    pattern_type: product.pattern_type || defaults.pattern_type || '',
    style: product.style || defaults.style || '',
    care_instructions: product.care_instructions || defaults.care_instructions || '',
    features: product.features || defaults.features || ''
  };
}
