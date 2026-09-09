export function cloudinaryUrl(url, { width, height } = {}) {
  if (!url || !String(url).includes('res.cloudinary.com') || !String(url).includes('/upload/')) {
    return url;
  }
  const parts = [];
  parts.push('f_auto', 'q_auto');
  if (width) parts.push(`w_${width}`);
  if (height) parts.push(`h_${height}`, 'c_fill');
  return String(url).replace('/upload/', `/upload/${parts.join(',')}/`);
}

export function imageSrcSet(url, widths = [400, 800, 1200]) {
  if (!url) return undefined;
  return widths.map((width) => `${cloudinaryUrl(url, { width })} ${width}w`).join(', ');
}

const VIEW_LABELS = ['front view', 'side view', 'back view', 'detail view'];

export function galleryViewLabel(index) {
  return VIEW_LABELS[index] || `view ${index + 1}`;
}

export function productImageAlt(product, extras = {}) {
  const name = product?.name || 'KlarElle dress';
  const color = extras.color || (Array.isArray(product?.colors) ? product.colors[0] : '');
  const view = extras.view || 'front view';
  const material = extras.material || product?.material || '';
  return [name, color, material, view].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
}
