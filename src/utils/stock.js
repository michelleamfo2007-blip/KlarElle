import { formatSizeLabel } from './size.js';

function toQty(value) {
  return parseInt(value, 10) || 0;
}

function qtyForSize(map, size) {
  if (!map || typeof map !== 'object') return 0;
  const wanted = formatSizeLabel(size);
  if (map[size] != null && map[size] !== '') return toQty(map[size]);
  if (map[wanted] != null && map[wanted] !== '') return toQty(map[wanted]);
  const key = Object.keys(map).find((item) => formatSizeLabel(item) === wanted || String(item).trim().toUpperCase() === String(wanted).toUpperCase());
  return key ? toQty(map[key]) : 0;
}

function sumStockMap(map) {
  if (!map || typeof map !== 'object') return 0;
  return Object.values(map).reduce((sum, qty) => sum + toQty(qty), 0);
}

function isStockMap(map) {
  return Boolean(map && typeof map === 'object' && Object.keys(map).length > 0);
}

function variantHasInventory(value) {
  return Boolean(value && typeof value === 'object' && (isStockMap(value.stock) || isStockMap(value.stock_international)));
}

function productHasVariantInventory(product) {
  const variants = product?.variant_images;
  if (!variants || typeof variants !== 'object') return false;
  return Object.values(variants).some(variantHasInventory);
}

export function getAvailableQty({ us = 0, intl = 0 } = {}) {
  const usQty = toQty(us);
  const intlQty = toQty(intl);
  return usQty > 0 ? usQty : intlQty;
}

export function getProductStockTotals(product) {
  let us = toQty(product?.stock);
  let intl = toQty(product?.stock_international);

  if (productHasVariantInventory(product)) {
    us = 0;
    intl = 0;
    Object.values(product.variant_images).forEach((value) => {
      if (!variantHasInventory(value)) return;
      us += sumStockMap(value.stock);
      intl += sumStockMap(value.stock_international);
    });
  }

  return { us, intl, total: us + intl };
}

export function getAvailabilityMode(product) {
  const raw = String(product?.availability_mode || '').toLowerCase().replace(/-/g, '_');
  if (raw === 'preorder' || raw === 'sold_out') return raw;
  const tags = Array.isArray(product?.tags)
    ? product.tags.map((tag) => String(tag).toLowerCase())
    : [];
  if (tags.includes('availability:preorder')) return 'preorder';
  if (tags.includes('availability:sold-out') || tags.includes('availability:sold_out')) return 'sold_out';
  return 'stock';
}

export function isProductPreorder(product) {
  return getAvailabilityMode(product) === 'preorder';
}

export function isProductSoldOut(product) {
  if (!product) return false;
  const mode = getAvailabilityMode(product);
  if (mode === 'sold_out') return true;
  if (mode === 'preorder') return false;
  return getProductStockTotals(product).total <= 0;
}

export function getVariantStock(product, color, size) {
  if (productHasVariantInventory(product)) {
    const variants = product.variant_images;
    const colorData = (color && variants[color])
      || Object.entries(variants).find(([key]) => String(key).toLowerCase() === String(color || '').toLowerCase())?.[1]
      || Object.values(variants).find(variantHasInventory)
      || null;
    return {
      us: qtyForSize(colorData?.stock, size),
      intl: qtyForSize(colorData?.stock_international, size)
    };
  }

  return {
    us: toQty(product?.stock),
    intl: toQty(product?.stock_international)
  };
}

export function getFulfillmentSource(product, color, size) {
  const { us, intl } = getVariantStock(product, color, size);
  if (us > 0) return 'US';
  if (intl > 0) return 'CN';
  return 'US';
}

export function getItemDeliveryEstimate(item) {
  const color = item?.selectedColor || item?.color;
  const size = item?.selectedSize || item?.size;
  const { us, intl } = getVariantStock(item, color, size);
  if (us > 0) return '3–5 business days';
  if (intl > 0 || item?.fulfilledFrom === 'CN') return '9–15 days';
  return '3–5 business days';
}

export function cartShipsFromInternational(cartItems = []) {
  return cartItems.some((item) => {
    const color = item.selectedColor || item.color;
    const size = item.selectedSize || item.size;
    const { us, intl } = getVariantStock(item, color, size);
    if (us > 0 || intl > 0) return us <= 0 && intl > 0;
    return item.fulfilledFrom === 'CN';
  });
}

export function pickAvailableSize(product, color, sizes = [], preferred) {
  const list = (sizes || []).map((size) => String(size).trim()).filter(Boolean);
  if (!list.length) return preferred || null;

  const matchPreferred = preferred
    ? list.find((size) => formatSizeLabel(size) === formatSizeLabel(preferred) || size === preferred)
    : null;

  if (matchPreferred) {
    const { us, intl } = getVariantStock(product, color, matchPreferred);
    if (us + intl > 0) return matchPreferred;
  }

  const inStock = list.find((size) => {
    const { us, intl } = getVariantStock(product, color, size);
    return us + intl > 0;
  });

  return inStock || matchPreferred || list[0];
}
