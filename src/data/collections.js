export const STORE_COLLECTIONS = [
  { slug: 'new-in', nav: 'The New Edit', title: 'The New Edit', tagline: 'Latest arrivals' },
  { slug: 'coming-soon', nav: 'Coming Next', title: 'Coming Next', tagline: "Next week's release" },
  { slug: 'occasion', nav: 'The Occasion Edit', title: 'The Occasion Edit', tagline: 'Shop by event' },
  { slug: 'icons', nav: 'Klarelle Icons', title: 'Klarelle Icons', tagline: 'Bestselling signature pieces' },
  { slug: 'evening', nav: 'The Evening Edit', title: 'The Evening Edit', tagline: 'Dinners and formal events' },
  { slug: 'celebration', nav: 'The Celebration Edit', title: 'The Celebration Edit', tagline: 'Birthdays and parties' },
  { slug: 'dinner', nav: 'Dinner Wear', title: 'Dinner Wear', tagline: 'Dinners and nights out' },
  { slug: 'birthday', nav: 'Birthday', title: 'Birthday Dresses', tagline: 'Birthday celebrations' },
  { slug: 'wedding-guest', nav: 'Wedding Guest', title: 'Wedding Guest', tagline: 'Wedding guest looks' }
];

export function getCollectionBySlug(slug) {
  return STORE_COLLECTIONS.find((collection) => collection.slug === slug) || null;
}

export const ASSIGNABLE_CATEGORIES = STORE_COLLECTIONS.filter((collection) => collection.slug !== 'coming-soon');

