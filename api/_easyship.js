import { COUNTRIES } from '../src/utils/countries.js';
import { parseShippingAddress } from '../src/utils/address.js';
import { getVariantSkuFromProduct } from '../src/utils/sku.js';
import { PACKAGE_HEIGHT_CM, PACKAGE_LENGTH_CM, PACKAGE_WIDTH_CM } from '../src/utils/package.js';

export const EASYSHIP_API_VERSION = '2024-09';

export function isEasyshipSandbox(apiKey = process.env.EASYSHIP_API_KEY || '') {
  return String(apiKey).startsWith('sand_');
}

export function getEasyshipBaseUrl(apiKey) {
  // Public API 2024-09 hosts (tokens are version-scoped to 2024-09+)
  return isEasyshipSandbox(apiKey)
    ? 'https://public-api-sandbox.easyship.com'
    : 'https://public-api.easyship.com';
}

export function getCountryCode(countryName) {
  return COUNTRIES[countryName] || countryName || 'US';
}

export { parseShippingAddress };

export async function easyshipRequest(apiKey, path, options = {}) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const versionedPath = normalizedPath.startsWith('/20')
    ? normalizedPath
    : `/${EASYSHIP_API_VERSION}${normalizedPath}`;

  const response = await fetch(`${getEasyshipBaseUrl(apiKey)}${versionedPath}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      ...(options.headers || {})
    }
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data.error?.message || data.error?.details?.[0] || `Easyship request failed (${response.status})`;
    const error = new Error(message);
    error.status = response.status;
    error.details = data.error;
    error.code = data.error?.code;
    throw error;
  }
  return data;
}

export async function getEasyshipOriginAddress(apiKey, order, fulfillmentSource = 'US') {
  const data = await easyshipRequest(apiKey, '/addresses');
  const addresses = data.addresses || [];
  if (!addresses.length) {
    throw new Error('No pickup address found in Easyship. Add a warehouse/pickup address in your Easyship dashboard.');
  }

  const wantCountry = fulfillmentSource === 'CN' ? 'CN' : 'US';
  const match = addresses.find((address) => address.country_alpha2 === wantCountry)
    || (fulfillmentSource === 'CN'
      ? addresses.find((address) => address.country_alpha2 !== 'US')
      : addresses.find((address) => address.country_alpha2 === 'US'))
    || addresses[0];

  return {
    line_1: match.line_1,
    line_2: match.line_2 || null,
    city: match.city,
    state: match.state || (match.country_alpha2 === 'US' ? 'NY' : '') || '',
    postal_code: match.postal_code || '',
    country_alpha2: match.country_alpha2,
    contact_name: match.contact_name || 'Klarélle',
    company_name: match.company_name || 'Klarélle',
    contact_phone: match.contact_phone || order?.phone_number || '',
    contact_email: match.contact_email || order?.customer_email
  };
}

export function toEasyshipDestination(order) {
  const address = parseShippingAddress(order.shipping_address);
  if (!address?.street || !address.city || !address.country) {
    throw new Error('This order is missing a complete shipping address. Ask the customer for street, city, and country.');
  }

  const country = getCountryCode(address.country);
  if (['US', 'CA', 'AU'].includes(country) && !address.zip) {
    throw new Error('This order is missing a postal/ZIP code, which Easyship needs to buy a label.');
  }

  return {
    line_1: address.street,
    line_2: address.line2 || null,
    city: address.city,
    state: address.state || '',
    postal_code: address.zip || '',
    country_alpha2: country,
    contact_name: order.customer_name || 'Customer',
    contact_phone: (order.phone_number || '').replace(/\s+/g, ' ').trim(),
    contact_email: order.customer_email
  };
}

export function toEasyshipItems(orderItems = []) {
  if (!orderItems.length) {
    return [{
      description: 'Apparel',
      sku: 'DEFAULT',
      category: 'fashion',
      actual_weight: 1.2,
      dimensions: { length: PACKAGE_LENGTH_CM, width: PACKAGE_WIDTH_CM, height: PACKAGE_HEIGHT_CM },
      declared_currency: 'USD',
      declared_customs_value: 50,
      origin_country_alpha2: 'CN',
      quantity: 1
    }];
  }

  return orderItems.map((item) => {
    const product = item.product || {};
    return {
      description: product.name || 'Apparel',
      sku: getVariantSkuFromProduct(product, item.color, item.size) || product.sku || `SKU-${item.product_id || item.id}`,
      category: 'fashion',
      origin_country_alpha2: getCountryCode(product.country_of_manufacture || 'China'),
      hs_code: product.hs_code || undefined,
      actual_weight: product.weight ? parseFloat(product.weight) : 1.2,
      dimensions: {
        length: PACKAGE_LENGTH_CM,
        width: PACKAGE_WIDTH_CM,
        height: PACKAGE_HEIGHT_CM
      },
      declared_currency: 'USD',
      declared_customs_value: parseFloat(item.price_at_time || product.price || 50),
      quantity: item.quantity || 1
    };
  });
}

export function mapEasyshipRates(rates = []) {
  return rates.map((r) => {
    const service = r.courier_service || {};
    return {
      provider: service.umbrella_name || service.name || r.courier_name || 'Courier',
      serviceLevel: service.name || r.courier_service_name || r.description || 'Standard',
      amount: parseFloat(r.total_charge ?? r.shipment_charge_total ?? r.shipment_charge ?? 0),
      currency: r.currency || 'USD',
      objectId: service.id || r.courier_service_id || r.courier_id || r.easyship_rate_id,
      estimatedDays: `${r.min_delivery_time ?? '?'}-${r.max_delivery_time ?? '?'}`
    };
  }).filter((rate) => Number.isFinite(rate.amount) && rate.amount >= 0 && rate.objectId);
}
