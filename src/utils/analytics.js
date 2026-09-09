export function trackEvent(name, params = {}) {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag === 'function') {
    window.gtag('event', name, params);
    return;
  }
  window.dataLayer.push({ event: name, ecommerce: params, event_name: name });
}

function itemPayload(product, extras = {}) {
  return {
    item_id: extras.sku || product?.sku || product?.id,
    item_name: product?.name,
    item_brand: 'KlarElle',
    item_category: product?.category || 'occasionwear',
    item_variant: [extras.color, extras.size].filter(Boolean).join(' / ') || undefined,
    price: Number(product?.price || extras.price || 0),
    quantity: extras.quantity || 1
  };
}

export function trackViewItem(product, extras = {}) {
  trackEvent('view_item', {
    currency: 'USD',
    value: Number(product?.price || 0),
    items: [itemPayload(product, extras)]
  });
}

export function trackSelectItem(product) {
  trackEvent('select_item', {
    item_list_name: extrasList(product),
    items: [itemPayload(product)]
  });
}

function extrasList(product) {
  return product?.category || 'KlarElle collection';
}

export function trackAddToCart(product, extras = {}) {
  trackEvent('add_to_cart', {
    currency: 'USD',
    value: Number(product?.price || 0) * (extras.quantity || 1),
    items: [itemPayload(product, extras)]
  });
}

export function trackBeginCheckout(items = [], value = 0) {
  trackEvent('begin_checkout', {
    currency: 'USD',
    value: Number(value || 0),
    items: items.map((item) => itemPayload(item, {
      sku: item.sku,
      color: item.selectedColor || item.color,
      size: item.selectedSize || item.size,
      quantity: item.quantity,
      price: item.price
    }))
  });
}

export function trackPurchase({ transactionId, value, items = [] }) {
  trackEvent('purchase', {
    transaction_id: transactionId,
    currency: 'USD',
    value: Number(value || 0),
    items: items.map((item) => itemPayload(item, {
      sku: item.sku,
      color: item.selectedColor || item.color,
      size: item.selectedSize || item.size,
      quantity: item.quantity,
      price: item.price || item.price_at_time
    }))
  });
}
