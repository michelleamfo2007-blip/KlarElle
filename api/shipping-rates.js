import {
  easyshipRequest,
  getCountryCode,
  getEasyshipOriginAddress,
  mapEasyshipRates
} from './_easyship.js';
import { getVariantSkuFromProduct } from '../src/utils/sku.js';
import { cartShipsFromInternational } from '../src/utils/stock.js';
import { PACKAGE_HEIGHT_CM, PACKAGE_LENGTH_CM, PACKAGE_WIDTH_CM } from '../src/utils/package.js';

function toRateItems(cartItems = []) {
  const items = cartItems.map((item) => {
    const weight = item.weight ? parseFloat(item.weight) : 1.2;
    const price = parseFloat(item.price ?? item.sale_price ?? item.price_at_time ?? 50) || 50;
    return {
      description: item.name || 'Apparel',
      sku: getVariantSkuFromProduct(item, item.selectedColor || item.color, item.selectedSize || item.size) || item.sku || `SKU-${item.id}`,
      category: 'fashion',
      origin_country_alpha2: getCountryCode(item.country_of_manufacture || 'China'),
      hs_code: item.hs_code || undefined,
      actual_weight: Number.isFinite(weight) && weight > 0 ? weight : 1.2,
      dimensions: {
        length: PACKAGE_LENGTH_CM,
        width: PACKAGE_WIDTH_CM,
        height: PACKAGE_HEIGHT_CM
      },
      declared_currency: 'USD',
      declared_customs_value: price,
      quantity: item.quantity || 1
    };
  });

  if (!items.length) {
    items.push({
      description: 'Apparel',
      sku: 'DEFAULT',
      category: 'fashion',
      origin_country_alpha2: 'CN',
      actual_weight: 1.2,
      dimensions: {
        length: PACKAGE_LENGTH_CM,
        width: PACKAGE_WIDTH_CM,
        height: PACKAGE_HEIGHT_CM
      },
      declared_currency: 'USD',
      declared_customs_value: 50,
      quantity: 1
    });
  }

  return items;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    destinationZip,
    country = 'United States',
    cartItems = [],
    city = '',
    state = '',
    street = '',
    line2 = ''
  } = req.body || {};

  const destCountryCode = getCountryCode(country);
  const items = toRateItems(cartItems);
  const totalWeight = items.reduce((sum, item) => sum + (item.actual_weight * (item.quantity || 1)), 0);

  // US stock can ship to any country. International warehouse only when US stock is 0.
  const isFulfilledFromChina = cartShipsFromInternational(cartItems);
  const fulfillmentSource = isFulfilledFromChina ? 'CN' : 'US';

  const apiKey = process.env.EASYSHIP_API_KEY;
  if (!apiKey) {
    const mockRates = [
      { provider: 'ePost Global', serviceLevel: 'Economy International', amount: 19.99, objectId: 'easyship_mock_1', estimatedDays: '7-16' },
      { provider: 'DHL Express', serviceLevel: 'Express Worldwide', amount: 45.00, objectId: 'easyship_mock_2', estimatedDays: '3-5' }
    ];
    return res.status(200).json({ success: true, rates: mockRates, fulfillmentSource });
  }

  try {
    const originAddress = await getEasyshipOriginAddress(apiKey, null, fulfillmentSource);

    const destinationAddress = {
      line_1: street || 'Address pending',
      line_2: line2 || null,
      city: city || (destCountryCode === 'US' ? 'New York' : 'City'),
      state: state || '',
      postal_code: destinationZip || '',
      country_alpha2: destCountryCode
    };

    if (['US', 'CA', 'AU'].includes(destCountryCode) && !destinationAddress.postal_code) {
      return res.status(400).json({ error: 'Postal/ZIP code is required for shipping rates.' });
    }

    const data = await easyshipRequest(apiKey, '/rates', {
      method: 'POST',
      body: JSON.stringify({
        origin_address: originAddress,
        destination_address: destinationAddress,
        incoterms: 'DDU',
        insurance: { is_insured: false },
        courier_settings: {
          apply_shipping_rules: true,
          show_courier_logo_url: false
        },
        shipping_settings: {
          units: {
            weight: 'kg',
            dimensions: 'cm'
          }
        },
        parcels: [{
          items,
          total_actual_weight: Number(totalWeight.toFixed(3)) || 1.2,
          box: {
            length: PACKAGE_LENGTH_CM,
            width: PACKAGE_WIDTH_CM,
            height: PACKAGE_HEIGHT_CM
          }
        }]
      })
    });

    const rates = mapEasyshipRates(data.rates || []);
    return res.status(200).json({ success: true, rates, fulfillmentSource });
  } catch (error) {
    console.error('Easyship API Error:', error);
    return res.status(error.status || 500).json({
      error: error.message || 'Internal server error while fetching shipping rates',
      code: error.code || undefined
    });
  }
}
