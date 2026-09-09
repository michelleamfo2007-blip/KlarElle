export function isPublishedOnStorefront(product) {
  if (!product) return false;
  if (product.visibility === false) return false;
  const status = String(product.status || 'active').toLowerCase();
  return status === 'active';
}

export function isComingSoon(product) {
  if (!product) return false;
  const releasePassed = hasReachedReleaseDate(product);
  if (product.coming_soon === true || product.coming_soon === 'true') {
    return !releasePassed;
  }
  const tags = Array.isArray(product.tags)
    ? product.tags.map((tag) => String(tag).toLowerCase())
    : [];
  return tags.includes('coming-soon') || tags.includes('coming soon');
}

export function hasReachedReleaseDate(product) {
  if (!product?.release_date) return false;
  const release = new Date(product.release_date);
  if (Number.isNaN(release.getTime())) return false;
  release.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return release <= today;
}

export function getReleaseLabel(product) {
  if (!isComingSoon(product)) return null;
  if (product.release_date) {
    const release = new Date(product.release_date);
    if (!Number.isNaN(release.getTime())) {
      return `Releasing ${release.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })}`;
    }
  }
  return 'Releasing next week';
}

const launchedIds = new Set();

export async function maybeLaunchProduct(product) {
  if (!product?.id || launchedIds.has(product.id)) return false;
  const markedComingSoon = product.coming_soon === true || product.coming_soon === 'true';
  if (!markedComingSoon || !hasReachedReleaseDate(product)) return false;
  launchedIds.add(product.id);
  try {
    await fetch('/api/join-waitlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'launch',
        productId: product.id,
        productName: product.name
      })
    });
    return true;
  } catch {
    return false;
  }
}

function haystack(product) {
  const tags = Array.isArray(product?.tags) ? product.tags : [];
  return [product?.category, product?.style, product?.occasion, product?.name, ...tags]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

export function getProductCategorySlugs(product) {
  const slugs = [];
  const add = (value) => {
    if (!value) return;
    if (Array.isArray(value)) {
      value.forEach(add);
      return;
    }
    const slug = String(value).trim().toLowerCase();
    if (slug) slugs.push(slug);
  };
  add(product?.categories);
  add(product?.category);
  (Array.isArray(product?.tags) ? product.tags : []).forEach((tag) => {
    const text = String(tag || '');
    if (text.toLowerCase().startsWith('cat:')) add(text.slice(4));
  });
  return [...new Set(slugs)];
}

const OCCASION_KEYS = ['formal', 'evening', 'wedding', 'party', 'birthday', 'occasion', 'event', 'gala', 'dinner', 'date', 'night out', 'celebration'];
const EVENING_KEYS = ['evening', 'formal', 'dinner', 'gala', 'black tie', 'cocktail', 'night out'];
const CELEBRATION_KEYS = ['birthday', 'party', 'celebration', 'wedding', 'bachelorette', 'homecoming'];
const ICON_KEYS = ['icon', 'bestseller', 'signature', 'icons'];
const OCCASION_SLUGS = ['occasion', 'evening', 'celebration', 'dinner', 'birthday', 'wedding-guest'];

export function matchesCollection(product, slug) {
  if (!product) return false;
  if (slug === 'coming-soon') return false;
  if (slug === 'all' || slug === 'collections' || slug === 'new-in') return true;
  const assigned = getProductCategorySlugs(product);
  if (assigned.includes(slug)) return true;
  if (slug === 'occasion' && assigned.some((item) => OCCASION_SLUGS.includes(item))) return true;
  if (slug === 'evening' && assigned.includes('dinner')) return true;
  if (slug === 'celebration' && (assigned.includes('birthday') || assigned.includes('wedding-guest'))) return true;
  const text = haystack(product);
  if (slug === 'icons') return ICON_KEYS.some((key) => text.includes(key));
  if (slug === 'evening') return EVENING_KEYS.some((key) => text.includes(key));
  if (slug === 'celebration') return CELEBRATION_KEYS.some((key) => text.includes(key));
  if (slug === 'occasion') return OCCASION_KEYS.some((key) => text.includes(key));
  return product.category === slug;
}
