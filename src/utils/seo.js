export const SITE_URL = 'https://www.klarelle.store';
export const SITE_NAME = 'KlarElle';
export const DEFAULT_SHARE_IMAGE = `${SITE_URL}/og-home.jpg`;

export function absoluteUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${SITE_URL}${url.startsWith('/') ? url : `/${url}`}`;
}

export function pageDescription(text, fallback = '') {
  const cleaned = String(text || '')
    .replace(/^#+\s+/gm, '')
    .replace(/\*\*/g, '')
    .replace(/[_*]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return (cleaned || fallback).slice(0, 160);
}

export function buildProductJsonLd(product, extras = {}) {
  if (!product?.name) return null;

  const url = extras.url || `${SITE_URL}/product/${product.id}`;
  const image = extras.image || absoluteUrl(product.image_url);
  const price = Number(product.price || 0);
  const soldOut = extras.soldOut === true;
  const comingSoon = extras.comingSoon === true;
  const availability = comingSoon
    ? 'https://schema.org/PreOrder'
    : soldOut
      ? 'https://schema.org/OutOfStock'
      : 'https://schema.org/InStock';

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: pageDescription(product.description, `${product.name} from KlarElle.`),
    image: image ? [image] : undefined,
    sku: product.sku || undefined,
    color: extras.color || (Array.isArray(product.colors) ? product.colors[0] : product.colors) || undefined,
    material: product.material || product.composition || undefined,
    brand: {
      '@type': 'Brand',
      name: 'KlarElle'
    },
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: 'USD',
      price: price.toFixed(2),
      availability,
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@type': 'Organization',
        name: 'KlarElle'
      },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'US'
        }
      },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'US',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 7,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/ReturnFeesCustomerResponsibility'
      }
    }
  };

  if (extras.ratingCount > 0 && extras.ratingValue) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: String(extras.ratingValue),
      reviewCount: String(extras.ratingCount)
    };
  }

  return schema;
}
