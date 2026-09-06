import { formatSizeLabel } from './size.js';

function toQty(value) {
  return parseInt(value, 10) || 0;
}

function sumStockMap(map) {
  if (!map || typeof map !== 'object') return 0;
  return Object.values(map).reduce((sum, qty) => sum + toQty(qty), 0);
}

export function getProductStockTotals(product) {
  let us = toQty(product?.stock);
  let intl = toQty(product?.stock_international);

  const variants = product?.variant_images;
  if (variants && typeof variants === 'object') {
    let variantUs = 0;
    let variantIntl = 0;
    let hasVariantInventory = false;

    Object.values(variants).forEach((value) => {
      if (value && typeof value === 'object' && (value.stock || value.stock_international)) {
        hasVariantInventory = true;
        variantUs += sumStockMap(value.stock);
        variantIntl += sumStockMap(value.stock_international);
      }
    });

    if (hasVariantInventory) {
      us = variantUs;
      intl = variantIntl;
    }
  }

  return { us, intl, total: us + intl };
}

export function isProductSoldOut(product) {
  return getProductStockTotals(product).total <= 0;
}

export function getVariantStock(product, color, size) {
  const variants = product?.variant_images;
  if (variants && typeof variants === 'object') {
    const hasVariantInventory = Object.values(variants).some((value) => (
      value && typeof value === 'object' && (value.stock || value.stock_international)
    ));
    if (hasVariantInventory) {
      const sizeCode = formatSizeLabel(size);
      const colorData = (color && variants[color])
        || Object.entries(variants).find(([key]) => String(key).toLowerCase() === String(color || '').toLowerCase())?.[1]
        || null;
      return {
        us: toQty(colorData?.stock?.[sizeCode] ?? colorData?.stock?.[size]),
        intl: toQty(colorData?.stock_international?.[sizeCode] ?? colorData?.stock_international?.[size])
      };
    }
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
