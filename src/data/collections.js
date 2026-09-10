export const STORE_COLLECTIONS = [
  {
    slug: 'new-in',
    nav: 'THE NEW EDIT',
    title: 'The New Edit',
    tagline: 'Latest arrivals',
    seoDescription: "Shop KlarElle's newest occasion dresses and evening gowns, chosen for fit, finish, and this season's celebrations.",
    description: 'Newest occasion dresses and evening gowns, just in.'
  },
  {
    slug: 'occasion',
    nav: 'The Occasion Edit',
    title: 'The Occasion Edit',
    tagline: 'Shop by event',
    seoDescription: 'Shop KlarElle occasion dresses for dinners, weddings, birthdays, and formal events, curated for a polished feminine silhouette.',
    description: 'Shop by event: dinners, weddings, and celebrations.'
  },
  {
    slug: 'icons',
    nav: 'KlarElle Icons',
    title: 'KlarElle Icons',
    tagline: 'Bestselling signature pieces',
    seoDescription: 'Shop KlarElle Icons, the signature and bestselling dresses customers return to for formal nights and celebrations.',
    description: 'Signature and bestselling KlarElle silhouettes.'
  },
  {
    slug: 'evening',
    nav: 'The Evening Edit',
    title: 'The Evening Edit',
    tagline: 'Dinners and formal events',
    seoDescription: 'Shop KlarElle evening gowns and formal dresses for dinners, galas, and black-tie occasions.',
    description: 'Evening gowns and formal dresses for dinners and galas.'
  },
  {
    slug: 'celebration',
    nav: 'The Celebration Edit',
    title: 'The Celebration Edit',
    tagline: 'Birthdays and parties',
    seoDescription: 'Shop KlarElle celebration dresses for birthdays, parties, and nights that call for a statement silhouette.',
    description: 'Statement dresses for birthdays, parties, and nights out.'
  },
  {
    slug: 'dinner',
    nav: 'Dinner Wear',
    title: 'Dinner Wear',
    tagline: 'Dinners and nights out',
    seoDescription: 'Shop KlarElle dinner dresses for restaurants, date nights, and polished evenings out.',
    description: 'Refined dresses for dinners, date nights, and evenings out.'
  },
  {
    slug: 'birthday',
    nav: 'Birthday',
    title: 'Birthday Dresses',
    tagline: 'Birthday celebrations',
    seoDescription: 'Shop KlarElle birthday dresses and party gowns for the celebrant and her night.',
    description: 'Dresses for the woman the night is about.'
  },
  {
    slug: 'wedding-guest',
    nav: 'Wedding Guest',
    title: 'Wedding Guest',
    tagline: 'Wedding guest looks',
    seoDescription: "Discover KlarElle's curated wedding-guest dresses, featuring elegant silhouettes, statement embellishments and sophisticated finishes.",
    description: 'Elegant wedding-guest looks for the ceremony and after.'
  }
];

// Only map true legacy spelling variants — do not alias distinct occasions onto other collections.
export const COLLECTION_ALIASES = {
  'dinner-wear': 'dinner',
  'klarelle-icons': 'icons',
  bestsellers: 'icons',
  'best-sellers': 'icons'
};

export function toCollectionSlug(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/&/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function resolveCollectionSlug(slug) {
  const cleaned = toCollectionSlug(slug);
  return COLLECTION_ALIASES[cleaned] || COLLECTION_ALIASES[slug] || cleaned || slug;
}

export function getCollectionBySlug(slug) {
  const resolved = resolveCollectionSlug(slug);
  return STORE_COLLECTIONS.find((collection) => collection.slug === resolved) || null;
}

export function isKnownCollectionSlug(slug) {
  const cleaned = String(slug || '').trim();
  return cleaned === 'all' || cleaned === 'collections' || Boolean(getCollectionBySlug(cleaned));
}

export function productCollection(product) {
  const candidates = [];
  if (Array.isArray(product?.categories)) candidates.push(...product.categories);
  if (product?.category) candidates.push(product.category);
  for (const raw of candidates) {
    const slug = resolveCollectionSlug(raw);
    const collection = getCollectionBySlug(slug);
    if (collection) {
      return {
        slug: collection.slug,
        label: collection.nav || collection.title
      };
    }
  }
  return { slug: 'new-in', label: 'The New Edit' };
}

export const ASSIGNABLE_CATEGORIES = STORE_COLLECTIONS;
