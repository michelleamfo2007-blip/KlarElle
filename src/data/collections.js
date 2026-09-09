export const STORE_COLLECTIONS = [
  {
    slug: 'new-in',
    nav: 'THE NEW EDIT',
    title: 'The New Edit',
    tagline: 'Latest arrivals',
    seoDescription: "Shop KlarElle's newest occasion dresses and evening gowns, chosen for fit, finish, and this season's celebrations.",
    description: "The New Edit is KlarElle's latest arrival edit: occasion dresses and evening gowns selected for silhouette, fabric, and the way they photograph in real light. Browse new pieces for dinners, weddings, birthdays, and nights that need a finished look."
  },
  {
    slug: 'occasion',
    nav: 'The Occasion Edit',
    title: 'The Occasion Edit',
    tagline: 'Shop by event',
    seoDescription: 'Shop KlarElle occasion dresses for dinners, weddings, birthdays, and formal events, curated for a polished feminine silhouette.',
    description: "The Occasion Edit gathers KlarElle dresses by event, so you can move from dinner to wedding guest to celebration without guessing the dress code. Each piece is chosen for proportion, embellishment, and how it sits on the body."
  },
  {
    slug: 'icons',
    nav: 'KlarElle Icons',
    title: 'KlarElle Icons',
    tagline: 'Bestselling signature pieces',
    seoDescription: 'Shop KlarElle Icons, the signature and bestselling dresses customers return to for formal nights and celebrations.',
    description: 'KlarElle Icons are the house signatures: bestselling silhouettes and statement pieces that define the collection. These are the gowns and dresses to keep when you want a look that already has a following.'
  },
  {
    slug: 'evening',
    nav: 'The Evening Edit',
    title: 'The Evening Edit',
    tagline: 'Dinners and formal events',
    seoDescription: 'Shop KlarElle evening gowns and formal dresses for dinners, galas, and black-tie occasions.',
    description: 'The Evening Edit is for dinners, galas, and formal nights. Expect longer hemlines, crystal and floral detail, and shapes that hold their line from the first photograph to the last toast.'
  },
  {
    slug: 'celebration',
    nav: 'The Celebration Edit',
    title: 'The Celebration Edit',
    tagline: 'Birthdays and parties',
    seoDescription: 'Shop KlarElle celebration dresses for birthdays, parties, and nights that call for a statement silhouette.',
    description: 'The Celebration Edit is built for birthdays, parties, and evenings that should feel marked. Look for color, sheen, and silhouettes that read clearly in a room and in photos.'
  },
  {
    slug: 'dinner',
    nav: 'Dinner Wear',
    title: 'Dinner Wear',
    tagline: 'Dinners and nights out',
    seoDescription: 'Shop KlarElle dinner dresses for restaurants, date nights, and polished evenings out.',
    description: 'Dinner Wear is KlarElle at the table: refined dresses for restaurants, date nights, and evenings out. The cut should feel considered, not costume, with enough presence to carry the night.'
  },
  {
    slug: 'birthday',
    nav: 'Birthday',
    title: 'Birthday Dresses',
    tagline: 'Birthday celebrations',
    seoDescription: 'Shop KlarElle birthday dresses and party gowns for the celebrant and her night.',
    description: "KlarElle birthday dresses are chosen for the woman the night is about. Think fitted lines, light-catching detail, and a silhouette that looks finished from every angle."
  },
  {
    slug: 'wedding-guest',
    nav: 'Wedding Guest',
    title: 'Wedding Guest',
    tagline: 'Wedding guest looks',
    seoDescription: "Discover KlarElle's curated wedding-guest dresses, featuring elegant silhouettes, statement embellishments and sophisticated finishes.",
    description: "Discover KlarElle's curated wedding-guest dresses, featuring elegant silhouettes, statement embellishments and sophisticated finishes selected for unforgettable celebrations. These looks are refined enough for a ceremony and comfortable enough for the hours after."
  }
];

export function getCollectionBySlug(slug) {
  return STORE_COLLECTIONS.find((collection) => collection.slug === slug) || null;
}

export const ASSIGNABLE_CATEGORIES = STORE_COLLECTIONS;

