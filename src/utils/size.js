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
  const bustMin = toNumber(row.bustMin ?? row.bust_min);
  const bustMax = toNumber(row.bustMax ?? row.bust_max);
  const waistMin = toNumber(row.waistMin ?? row.waist_min);
  const waistMax = toNumber(row.waistMax ?? row.waist_max);
  const hipMin = toNumber(row.hipMin ?? row.hip_min ?? row.hipsMin ?? row.hips_min);
  const hipMax = toNumber(row.hipMax ?? row.hip_max ?? row.hipsMax ?? row.hips_max);
  const bust = toNumber(row.bust);
  const waist = toNumber(row.waist);
  const hip = toNumber(row.hip ?? row.hips);

  return {
    size: formatSizeLabel(row.size),
    bust: bust != null ? bust : (bustMin != null && bustMax != null ? (bustMin + bustMax) / 2 : null),
    bustMin,
    bustMax,
    waist: waist != null ? waist : (waistMin != null && waistMax != null ? (waistMin + waistMax) / 2 : null),
    waistMin,
    waistMax,
    hip: hip != null ? hip : (hipMin != null && hipMax != null ? (hipMin + hipMax) / 2 : null),
    hipMin,
    hipMax,
    length: toNumber(row.length),
    guide: row.guide || null
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
    return existing && (existing.bust != null || existing.bustMax != null || existing.waist != null || existing.hip != null)
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

export function cmRangeToDisplay(min, max, mid, unit) {
  if (min != null && max != null) {
    const left = cmToDisplay(min, unit);
    const right = cmToDisplay(max, unit);
    if (left === '—' || right === '—') return '—';
    // Mesh guide shows whole inches for body ranges.
    if (unit === 'in') {
      const a = Math.round(Number(min) / 2.54);
      const b = Math.round(Number(max) / 2.54);
      return a === b ? String(a) : `${a}–${b}`;
    }
    return `${left}–${right}`;
  }
  return cmToDisplay(mid, unit);
}

export function displayToCm(value, unit) {
  if (value == null || value === '') return null;
  const number = Number(value);
  if (Number.isNaN(number)) return null;
  if (unit === 'in') return Math.round(number * 2.54 * 10) / 10;
  return number;
}

function rowFitsMeasurement(row, key, value) {
  if (value == null || Number.isNaN(Number(value))) return true;
  const min = row[`${key}Min`];
  const max = row[`${key}Max`];
  const mid = row[key];
  const n = Number(value);
  if (min != null && max != null) return n >= min - 0.6 && n <= max + 0.6;
  if (mid == null) return true;
  return Math.abs(mid - n) <= 4;
}

/**
 * Prefer the smallest size that fits all measurements.
 * If chart has ranges: size by the largest measurement (size up when between).
 */
export function recommendDressSize({ bust, waist, hips, sizes = [], chart } = {}) {
  const rows = parseSizeChart(chart, sizes).filter((row) => row.bust != null || row.bustMax != null);
  if (!rows.length) return formatSizeLabel(sizes[0]) || 'M';

  const available = normalizeSizeList(sizes);
  const ordered = available.length
    ? available.map((size) => rows.find((row) => formatSizeLabel(row.size) === size)).filter(Boolean)
    : rows;

  const hasRanges = ordered.some((row) => row.bustMax != null || row.hipMax != null || row.waistMax != null);

  if (hasRanges) {
    const fitAll = ordered.find((row) => (
      rowFitsMeasurement(row, 'bust', bust)
      && rowFitsMeasurement(row, 'waist', waist)
      && rowFitsMeasurement(row, 'hip', hips)
    ));
    if (fitAll) return fitAll.size;

    // Fall back: for each measurement, find first size whose max covers it, then take the largest of those.
    const sizeIndex = (size) => ordered.findIndex((row) => row.size === size);
    const neededIndexes = ['bust', 'waist', 'hip'].map((key, idx) => {
      const value = [bust, waist, hips][idx];
      if (value == null || Number.isNaN(Number(value))) return 0;
      const found = ordered.findIndex((row) => {
        const max = row[`${key}Max`] ?? row[key];
        return max != null && Number(value) <= Number(max) + 0.6;
      });
      return found === -1 ? ordered.length - 1 : found;
    });
    const pick = ordered[Math.max(...neededIndexes)] || ordered[ordered.length - 1];
    return pick.size;
  }

  const scored = ordered
    .map((row) => ({
      ...row,
      score: Math.abs(row.bust - Number(bust || 0)) * 1.4
        + Math.abs((row.waist || 0) - Number(waist || 0))
        + Math.abs((row.hip || 0) - Number(hips || 0)) * 1.1
    }))
    .sort((a, b) => a.score - b.score);

  if (!available.length) return scored[0].size;
  const match = scored.find((row) => available.some((size) => formatSizeLabel(size) === row.size));
  if (match) {
    return available.find((size) => formatSizeLabel(size) === match.size) || match.size;
  }
  return available[Math.min(1, available.length - 1)] || scored[0].size;
}
