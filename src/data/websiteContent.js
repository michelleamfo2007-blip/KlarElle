export const DEFAULT_WEBSITE_CONTENT = {
  announcementText: 'Free U.S. shipping on orders over $100',
  heroTitle: 'LAUNCHING THIS SEPTEMBER',
  heroSubtitle: 'Join our VIP list for first access and exclusive launch updates.',
  featuredCollection: 'A GLIMPSE OF KLARELLE',
  aboutText: 'Klarelle curates elevated pieces chosen for quality, fit, and the feminine silhouette.'
};

const LEGACY_PLACEHOLDERS = {
  announcementText: ['Free shipping on all orders over $100!'],
  heroTitle: ['New Arrival Collection'],
  heroSubtitle: ['Discover the latest trends in fashion and accessories.'],
  featuredCollection: ['Summer 2026'],
  aboutText: ['KlarElle is a premium brand dedicated to bringing you the finest clothing and accessories.']
};

function pick(value, fallback, legacy = []) {
  const text = String(value || '').trim();
  if (!text || legacy.includes(text)) return fallback;
  return text;
}

export function normalizeWebsiteContent(row) {
  return {
    announcementText: pick(row?.announcement_text, DEFAULT_WEBSITE_CONTENT.announcementText, LEGACY_PLACEHOLDERS.announcementText),
    heroTitle: pick(row?.hero_title, DEFAULT_WEBSITE_CONTENT.heroTitle, LEGACY_PLACEHOLDERS.heroTitle),
    heroSubtitle: pick(row?.hero_subtitle, DEFAULT_WEBSITE_CONTENT.heroSubtitle, LEGACY_PLACEHOLDERS.heroSubtitle),
    featuredCollection: pick(row?.featured_collection, DEFAULT_WEBSITE_CONTENT.featuredCollection, LEGACY_PLACEHOLDERS.featuredCollection),
    aboutText: pick(row?.about_text, DEFAULT_WEBSITE_CONTENT.aboutText, LEGACY_PLACEHOLDERS.aboutText)
  };
}
