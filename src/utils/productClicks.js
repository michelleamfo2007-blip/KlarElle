import { findProductByParam } from './productUrl';

export function productParamFromPath(path) {
  const match = String(path || '').split('?')[0].match(/^\/product\/([^/]+)/i);
  return match ? decodeURIComponent(match[1]) : null;
}

export function rankClickedProducts(views = [], products = []) {
  const counts = {};

  for (const row of views) {
    const param = productParamFromPath(row.path);
    if (!param) continue;
    const product = findProductByParam(products, param);
    if (!product) continue;
    if (!counts[product.id]) {
      counts[product.id] = {
        id: product.id,
        name: product.name,
        image: product.image_url,
        clicks: 0
      };
    }
    counts[product.id].clicks += 1;
  }

  return Object.values(counts).sort((a, b) => b.clicks - a.clicks);
}
