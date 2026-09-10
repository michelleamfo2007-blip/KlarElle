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

function mergeSizeQtyMap(map) {
  const next = {};
  if (!map || typeof map !== 'object') return next;
  for (const [key, qty] of Object.entries(map)) {
    const size = formatSizeLabel(key) || String(key).trim();
    if (!size) continue;
    const n = toQty(qty);
    next[size] = next[size] == null ? n : Math.max(next[size], n);
  }
  return next;
}

export function getVariantWarehouseTotals(variantImages) {
  let us = 0;
  let intl = 0;
  if (!variantImages || typeof variantImages !== 'object') return { us, intl };
  Object.values(variantImages).forEach((value) => {
    if (!value || typeof value !== 'object') return;
    if (!variantHasInventory(value)) return;
    us += sumStockMap(mergeSizeQtyMap(value.stock));
    intl += sumStockMap(mergeSizeQtyMap(value.stock_international));
  });
  return { us, intl };
}

export function getProductStockTotals(product) {
  if (productHasVariantInventory(product)) {
    const { us, intl } = getVariantWarehouseTotals(product.variant_images);
    return { us, intl, total: us + intl };
  }
  const us = toQty(product?.stock);
  const intl = toQty(product?.stock_international);
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

function cloneJson(value) {
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return value;
  }
}

function findStockKey(map, size) {
  if (!map || typeof map !== 'object') return null;
  if (size && map[size] != null && map[size] !== '') return size;
  const wanted = formatSizeLabel(size);
  if (wanted && map[wanted] != null && map[wanted] !== '') return wanted;
  const match = Object.keys(map).find((item) => (
    formatSizeLabel(item) === wanted
    || String(item).trim().toUpperCase() === String(wanted || '').toUpperCase()
  ));
  if (match) return match;
  const keys = Object.keys(map);
  return keys.length === 1 ? keys[0] : null;
}

function findColorKey(variants, color) {
  if (!variants || typeof variants !== 'object') return null;
  if (color && variants[color]) return color;
  const match = Object.keys(variants).find((key) => String(key).toLowerCase() === String(color || '').toLowerCase());
  if (match) return match;
  const first = Object.entries(variants).find(([, value]) => variantHasInventory(value));
  return first ? first[0] : null;
}

function takeFromCount(current, quantity) {
  const have = toQty(current);
  const take = Math.min(have, toQty(quantity));
  return { next: have - take, deducted: take };
}

function takeFromMap(map, size, quantity) {
  const next = { ...(map || {}) };
  const key = findStockKey(next, size);
  if (!key) return { map: next, deducted: 0 };
  const result = takeFromCount(next[key], quantity);
  next[key] = result.next;
  return { map: next, deducted: result.deducted };
}

function syncProductStockTotals(product) {
  const totals = getProductStockTotals(product);
  return {
    ...product,
    stock: totals.us,
    stock_international: totals.intl
  };
}

export function applyOrderDeduction(product, line = {}) {
  if (!product) return { product, deducted: 0 };
  const quantity = Math.max(0, toQty(line.quantity));
  if (!quantity) return { product, deducted: 0 };
  if (getAvailabilityMode(product) === 'preorder') return { product, deducted: 0 };

  const color = line.color || line.selectedColor || null;
  const size = line.size || line.selectedSize || null;
  const source = String(line.source || line.fulfilledFrom || getFulfillmentSource(product, color, size) || 'US').toUpperCase();
  const preferIntl = source === 'CN' || source === 'INTL' || source === 'INTERNATIONAL';
  let remaining = quantity;
  let next = product;

  if (productHasVariantInventory(product)) {
    const variants = cloneJson(product.variant_images) || {};
    const colorKey = findColorKey(variants, color);
    if (!colorKey || !variants[colorKey]) return { product, deducted: 0 };
    const colorData = { ...variants[colorKey] };
    const primary = preferIntl ? 'stock_international' : 'stock';
    const secondary = preferIntl ? 'stock' : 'stock_international';
    const first = takeFromMap(colorData[primary], size, remaining);
    colorData[primary] = first.map;
    remaining -= first.deducted;
    if (remaining > 0) {
      const second = takeFromMap(colorData[secondary], size, remaining);
      colorData[secondary] = second.map;
      remaining -= second.deducted;
    }
    variants[colorKey] = colorData;
    next = syncProductStockTotals({ ...product, variant_images: variants });
  } else {
    const usFirst = !preferIntl;
    let us = toQty(product.stock);
    let intl = toQty(product.stock_international);
    if (usFirst) {
      const first = takeFromCount(us, remaining);
      us = first.next;
      remaining -= first.deducted;
      if (remaining > 0) {
        const second = takeFromCount(intl, remaining);
        intl = second.next;
        remaining -= second.deducted;
      }
    } else {
      const first = takeFromCount(intl, remaining);
      intl = first.next;
      remaining -= first.deducted;
      if (remaining > 0) {
        const second = takeFromCount(us, remaining);
        us = second.next;
        remaining -= second.deducted;
      }
    }
    next = { ...product, stock: us, stock_international: intl };
  }

  return { product: next, deducted: quantity - remaining };
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
