import { COUNTRIES } from '../src/utils/countries.js';
import { parseShippingAddress } from '../src/utils/address.js';
import { getVariantSkuFromProduct } from '../src/utils/sku.js';

export function isEasyshipSandbox(apiKey = process.env.EASYSHIP_API_KEY || '') {
  return String(apiKey).startsWith('sand_');
}

export function getEasyshipBaseUrl(apiKey) {
  return isEasyshipSandbox(apiKey)
    ? 'https://api-sandbox.easyship.com'
    : 'https://api.easyship.com';
}

export function getCountryCode(countryName) {
  return COUNTRIES[countryName] || countryName || 'US';
}

export { parseShippingAddress };

export async function easyshipRequest(apiKey, path, options = {}) {
  const response = await fetch(`${getEasyshipBaseUrl(apiKey)}${path}`, {
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
    throw error;
  }
  return data;
}

export async function getEasyshipOriginAddress(apiKey, order, fulfillmentSource = 'US') {
  const data = await easyshipRequest(apiKey, '/2023-01/addresses');
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
    state: match.state || '',
    postal_code: match.postal_code || '',
    country_alpha2: match.country_alpha2,
    contact_name: match.contact_name || 'Klarélle',
    company_name: match.company_name || 'Klarélle',
    contact_phone: match.contact_phone || order.phone_number || '',
    contact_email: match.contact_email || order.customer_email
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
      dimensions: { length: 45, width: 35, height: 5 },
      declared_currency: 'USD',
      declared_customs_value: 50,
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
        length: product.length ? parseFloat(product.length) : 45,
        width: product.width ? parseFloat(product.width) : 35,
        height: product.height ? parseFloat(product.height) : 5
      },
      declared_currency: 'USD',
      declared_customs_value: parseFloat(item.price_at_time || product.price || 50),
      quantity: item.quantity || 1
    };
  });
}
