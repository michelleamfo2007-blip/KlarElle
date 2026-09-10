import { getCollectionBySlug, STORE_COLLECTIONS } from '../data/collections.js';
import { getSitePage } from '../data/sitePages.js';
import { DEFAULT_SHARE_IMAGE, SITE_NAME, SITE_URL, pageDescription } from './seo.js';

export const HOME_TITLE = 'Elegant Occasion Dresses & Evening Gowns | KlarElle';
export const HOME_DESCRIPTION = "Discover KlarElle's curated collection of elegant occasion dresses, evening gowns and statement pieces chosen for exceptional fit and unforgettable moments.";

export const PAGE_META = {
  '/': {
    title: HOME_TITLE,
    description: HOME_DESCRIPTION
  },
  '/page/about-us': {
    title: 'About KlarElle | Curated Occasionwear for Women',
    description: 'KlarElle curates elevated occasionwear chosen for quality, fit, and the feminine silhouette. Learn how we select pieces for dinners, weddings, and celebrations.'
  },
  '/page/faq': {
    title: 'KlarElle FAQ | Orders, Sizing, Shipping & Returns',
    description: 'Answers about KlarElle orders, sizing, payments, shipping, returns, and launch details. Contact support@klarelle.store if you need more help.'
  },
  '/page/shipping-info': {
    title: 'Shipping Information | U.S. & International | KlarElle',
    description: 'KlarElle shipping times, delivery estimates, and international customs notes for U.S. and selected worldwide destinations.'
  },
  '/page/returns': {
    title: 'Returns & Exchanges | KlarElle',
    description: 'KlarElle offers exchanges or store credit within seven days. See eligibility, how to start a return, and what we cannot accept.'
  },
  '/page/contact-us': {
    title: 'Contact KlarElle | Customer Care',
    description: 'Contact KlarElle through the Contact Us form, WhatsApp, or support@klarelle.store for order and product questions.'
  },
  '/page/payment-method': {
    title: 'Payment Methods | KlarElle',
    description: 'KlarElle accepts Visa, Mastercard, American Express, Discover, and Klarna where available. Payments are processed securely at checkout.'
  },
  '/page/privacy-policy': {
    title: 'Privacy Policy | KlarElle',
    description: 'How KlarElle collects, uses, and protects personal information when you browse or place an order at www.klarelle.store.'
  },
  '/page/terms-and-conditions': {
    title: 'Terms & Conditions | KlarElle',
    description: 'Terms for using www.klarelle.store, placing orders, and shopping KlarElle occasionwear.'
  },
  '/page/how-to-order': {
    title: 'How to Order From KlarElle',
    description: 'How to browse KlarElle, choose a size, and complete checkout for U.S. and international delivery.'
  },
  '/page/social-responsibility': {
    title: 'Social Responsibility | KlarElle',
    description: 'How KlarElle approaches thoughtful curation, packaging, and community as the brand grows.'
  },
  '/page/influencer-collaboration': {
    title: 'Influencer Collaborations | KlarElle',
    description: 'KlarElle collaborates with creators on gifted and selected paid campaigns. Apply at support@klarelle.store.'
  },
  '/page/rewards': {
    title: 'Rewards | KlarElle',
    description: 'KlarElle does not currently offer a points program. Use voucher codes at checkout when available.'
  }
};

export const NOINDEX_PREFIXES = [
  '/cart',
  '/checkout',
  '/favorites',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/track-order',
  '/search',
  '/order-success',
  '/profile',
  '/admin',
  '/super-admin',
  '/update-password',
  '/find-my-size'
];

export const PERMANENT_REDIRECTS = {
  '/returns': '/page/returns',
  '/privacy': '/page/privacy-policy',
  '/terms': '/page/terms-and-conditions',
  '/check-in': '/profile',
  '/find-my-size': '/',
  '/category/coming-soon': '/category/new-in',
  '/category/dinner-wear': '/category/dinner',
  '/category/party-wear': '/category/celebration',
  '/category/maxi-dresses': '/category/evening',
  '/category/dinner-&-date-night': '/category/dinner-date-night',
  '/category/cocktail-&-party': '/category/cocktail-party',
  '/category/gala-&-formal-events': '/category/gala-formal-events',
  '/category/christmas-&-holidays': '/category/christmas-holidays'
};

export const INDEXABLE_POLICY_PATHS = Object.keys(PAGE_META).filter((path) => path.startsWith('/page/'));

export function normalizePath(pathname = '/') {
  const path = String(pathname || '/').split('?')[0];
  if (path.length > 1 && path.endsWith('/')) return path.slice(0, -1);
  return path || '/';
}

export function formatDocumentTitle(title) {
  if (!title) return SITE_NAME;
  if (title.includes('KlarElle') || title.includes('|')) return title;
  return `${title} | ${SITE_NAME}`;
}

export function isNoindexPath(pathname) {
  const path = normalizePath(pathname);
  return NOINDEX_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

export function getStaticPageMeta(pathname) {
  return PAGE_META[normalizePath(pathname)] || null;
}

export function getCollectionSeo(slug) {
  const collection = getCollectionBySlug(slug);
  if (slug === 'all' || slug === 'collections') {
    return {
      title: 'Occasion Dresses & Gowns | KlarElle',
      description: "Shop KlarElle's full collection of occasion dresses, evening gowns, and celebration looks chosen for fit and presence.",
      heading: 'All Collections',
      copy: 'Occasion dresses, evening gowns, and celebration looks.'
    };
  }
  if (!collection) return null;
  return {
    title: `${collection.title} Dresses & Gowns | KlarElle`,
    description: collection.seoDescription || `Shop ${collection.title.toLowerCase()} dresses and gowns at KlarElle.`,
    heading: collection.title,
    copy: collection.description || collection.tagline
  };
}

export function buildOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        name: SITE_NAME,
        url: SITE_URL,
        logo: DEFAULT_SHARE_IMAGE,
        email: 'support@klarelle.store',
        sameAs: [
          'https://www.instagram.com/klarelle.store',
          'https://www.tiktok.com/@klarelle_store'
        ]
      },
      {
        '@type': 'WebSite',
        name: SITE_NAME,
        url: SITE_URL,
        potentialAction: {
          '@type': 'SearchAction',
          target: `${SITE_URL}/search?q={search_term_string}`,
          'query-input': 'required name=search_term_string'
        }
      }
    ]
  };
}

export function buildBreadcrumbJsonLd(items = []) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
}

export function buildFaqJsonLd(body) {
  const parts = String(body || '').split(/^### /m).slice(1);
  const entities = parts.map((part) => {
    const [question, ...rest] = part.split('\n');
    const answer = pageDescription(rest.join(' '), '');
    return question && answer
      ? {
          '@type': 'Question',
          name: question.trim(),
          acceptedAnswer: {
            '@type': 'Answer',
            text: answer
          }
        }
      : null;
  }).filter(Boolean);
  if (!entities.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: entities
  };
}

export function getFaqBody() {
  return getSitePage('faq')?.body || '';
}
