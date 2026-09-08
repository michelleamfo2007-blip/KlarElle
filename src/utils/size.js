export function formatSizeLabel(size) {
  const raw = String(size || '').trim();
  const compact = raw.replace(/\s+/g, '').toUpperCase();
  if (/^(XXS|XS|S|M|L|XL|XXL|XXXL|2XL|3XL|4XL)$/.test(compact)) return compact;
  return raw;
}

export function normalizeSizeList(sizes = []) {
  return sizes.map((size) => formatSizeLabel(size)).filter(Boolean);
}

const SIZE_CHART = [
  { size: 'XXS', bust: 72, waist: 58, hip: 82 },
  { size: 'XS', bust: 76, waist: 62, hip: 86 },
  { size: 'S', bust: 80.5, waist: 67, hip: 98 },
  { size: 'M', bust: 84.5, waist: 71, hip: 102 },
  { size: 'L', bust: 90.5, waist: 77, hip: 108 },
  { size: 'XL', bust: 96.5, waist: 83, hip: 114 },
  { size: 'XXL', bust: 102.5, waist: 89, hip: 120 },
  { size: 'XXXL', bust: 108.5, waist: 95, hip: 126 }
];

export function recommendDressSize({ bust, waist, hips, sizes = [] }) {
  const scored = SIZE_CHART
    .map((row) => ({
      ...row,
      score: Math.abs(row.bust - Number(bust || 0)) * 1.4
        + Math.abs(row.waist - Number(waist || 0))
        + Math.abs(row.hip - Number(hips || 0)) * 1.1
    }))
    .sort((a, b) => a.score - b.score);

  const available = normalizeSizeList(sizes);
  if (!available.length) return scored[0].size;

  const match = scored.find((row) => available.some((size) => formatSizeLabel(size) === row.size));
  if (match) {
    return available.find((size) => formatSizeLabel(size) === match.size) || match.size;
  }
  return available[Math.min(1, available.length - 1)] || scored[0].size;
}
