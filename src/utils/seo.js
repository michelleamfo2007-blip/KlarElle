import { productPath } from './productUrl.js';
import { getVariantSkuFromProduct, isOfficialSku } from './sku.js';

export const SITE_URL = 'https://www.klarelle.store';
export const SITE_NAME = 'KlarElle';
export const DEFAULT_SHARE_IMAGE = `${SITE_URL}/og-home.jpg`;

export function absoluteUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${SITE_URL}${url.startsWith('/') ? url : `/${url}`}`;
}

export function shareImageUrl(url) {
  const abs = absoluteUrl(url) || DEFAULT_SHARE_IMAGE;
  if (!abs.includes('res.cloudinary.com') || !abs.includes('/upload/')) return abs;
  if (/\/upload\/[^/]*f_jpg/.test(abs)) return abs;
  return abs.replace('/upload/', '/upload/f_jpg,q_auto,w_1200/');
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

  const url = extras.url || `${SITE_URL}${productPath(product)}`;
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
    sku: getVariantSkuFromProduct(product, extras.color, extras.size) || (isOfficialSku(product.sku) ? product.sku : undefined),
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
