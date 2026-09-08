export function formatSizeLabel(size) {
  const raw = String(size || '').trim();
  const compact = raw.replace(/\s+/g, '').toUpperCase();
  if (/^(XXS|XS|S|M|L|XL|XXL|XXXL|2XL|3XL|4XL)$/.test(compact)) return compact;
  return raw;
}

export function normalizeSizeList(sizes = []) {
  return sizes.map((size) => formatSizeLabel(size)).filter(Boolean);
}

export const SIZE_CHART = [
  { size: 'XXS', bust: 72, waist: 58, hip: 82, length: 142 },
  { size: 'XS', bust: 76, waist: 62, hip: 86, length: 143.5 },
  { size: 'S', bust: 80.5, waist: 67, hip: 98, length: 145 },
  { size: 'M', bust: 84.5, waist: 71, hip: 102, length: 148 },
  { size: 'L', bust: 90.5, waist: 77, hip: 108, length: 151 },
  { size: 'XL', bust: 96.5, waist: 83, hip: 114, length: 154 },
  { size: 'XXL', bust: 102.5, waist: 89, hip: 120, length: 157 },
  { size: 'XXXL', bust: 108.5, waist: 95, hip: 126, length: 160 }
];

function toNumber(value) {
  if (value == null || value === '') return null;
  const number = Number(value);
  return Number.isNaN(number) ? null : number;
}

function normalizeRow(row = {}) {
  return {
    size: formatSizeLabel(row.size),
    bust: toNumber(row.bust),
    waist: toNumber(row.waist),
    hip: toNumber(row.hip ?? row.hips),
    length: toNumber(row.length)
  };
}

export function parseSizeChart(raw, sizes = []) {
  let rows = [];
  if (Array.isArray(raw)) {
    rows = raw.map(normalizeRow).filter((row) => row.size);
  } else if (raw && typeof raw === 'object') {
    rows = Object.entries(raw).map(([size, values]) => normalizeRow({ size, ...(values || {}) }));
  }

  const available = normalizeSizeList(sizes);
  const source = available.length ? available : (rows.length ? rows.map((row) => row.size) : SIZE_CHART.map((row) => row.size));

  return source.map((size) => {
    const existing = rows.find((row) => formatSizeLabel(row.size) === size);
    const fallback = SIZE_CHART.find((row) => row.size === size);
    return existing && (existing.bust != null || existing.waist != null || existing.hip != null)
      ? { ...fallback, ...existing, size }
      : (fallback || { size, bust: null, waist: null, hip: null, length: null });
  });
}

export function getSizeChartRows(sizes = [], customChart) {
  return parseSizeChart(customChart, sizes);
}

export function cmToDisplay(cm, unit) {
  if (cm == null || Number.isNaN(Number(cm))) return '—';
  const value = Number(cm);
  if (unit === 'in') return (value / 2.54).toFixed(1);
  return value.toFixed(1);
}

export function displayToCm(value, unit) {
  if (value == null || value === '') return null;
  const number = Number(value);
  if (Number.isNaN(number)) return null;
  if (unit === 'in') return Math.round(number * 2.54 * 10) / 10;
  return number;
}

export function recommendDressSize({ bust, waist, hips, sizes = [], chart } = {}) {
  const rows = parseSizeChart(chart, sizes).filter((row) => row.bust != null);
  if (!rows.length) return formatSizeLabel(sizes[0]) || 'M';

  const scored = rows
    .map((row) => ({
      ...row,
      score: Math.abs(row.bust - Number(bust || 0)) * 1.4
        + Math.abs((row.waist || 0) - Number(waist || 0))
        + Math.abs((row.hip || 0) - Number(hips || 0)) * 1.1
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
