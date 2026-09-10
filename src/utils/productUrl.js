export function slugifyProductName(name) {
  const slug = String(name || 'product')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  return slug || 'product';
}

export function isProductUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(value || ''));
}

export function productSlug(product) {
  if (product?.slug) return String(product.slug);
  return slugifyProductName(product?.name);
}

export function productPath(product) {
  if (!product) return '/category/new-in';
  return `/product/${productSlug(product)}`;
}

export function findProductByParam(products, param) {
  const key = decodeURIComponent(String(param || '')).toLowerCase();
  if (!key) return null;
  if (isProductUuid(key)) return products.find((item) => String(item.id).toLowerCase() === key) || null;
  const matches = products.filter((item) => productSlug(item).toLowerCase() === key);
  return matches[0] || null;
}
