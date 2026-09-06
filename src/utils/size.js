export function formatSizeLabel(size) {
  const raw = String(size || '').trim();
  const compact = raw.replace(/\s+/g, '').toUpperCase();
  if (/^(XXS|XS|S|M|L|XL|XXL|XXXL|2XL|3XL|4XL)$/.test(compact)) return compact;
  return raw;
}

export function normalizeSizeList(sizes = []) {
  return sizes.map((size) => formatSizeLabel(size)).filter(Boolean);
}
