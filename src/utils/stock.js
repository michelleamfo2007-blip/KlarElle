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
