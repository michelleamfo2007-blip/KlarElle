import Stripe from 'stripe';
import { COUNTRIES } from '../src/utils/countries.js';

const APPAREL_TAX_CODE = 'txcd_30011000';

function toCents(amount) {
  return Math.max(0, Math.round(Number(amount || 0) * 100));
}

function countryCode(nameOrCode) {
  const value = String(nameOrCode || '').trim();
  if (value.length === 2) return value.toUpperCase();
  return COUNTRIES[value] || 'US';
}

async function calculateTax(stripe, { currency, merchandiseCents, shippingCents, address }) {
  if (!address?.postal_code || !address?.country) return null;

  const lineItems = [];
  if (merchandiseCents > 0) {
    lineItems.push({
      amount: merchandiseCents,
      quantity: 1,
      reference: 'cart',
      tax_code: APPAREL_TAX_CODE
    });
  }
  if (!lineItems.length && shippingCents <= 0) return null;

  try {
    return await stripe.tax.calculations.create({
      currency,
      line_items: lineItems.length
        ? lineItems
        : [{ amount: shippingCents, quantity: 1, reference: 'shipping', tax_code: APPAREL_TAX_CODE }],
      shipping_cost: shippingCents > 0 && lineItems.length ? { amount: shippingCents } : undefined,
      customer_details: {
        address: {
          line1: address.line1 || address.postal_code,
          line2: address.line2 || undefined,
          city: address.city || undefined,
          state: address.state || undefined,
          postal_code: address.postal_code,
          country: countryCode(address.country)
        },
        address_source: 'shipping'
      }
    });
  } catch (error) {
    console.error('Stripe Tax calculation failed:', error.message);
    return null;
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { amount, currency, shipping_address, shipping_amount } = req.body || {};

  if (!amount || !currency) {
    return res.status(400).json({ error: 'Amount and currency are required.' });
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const stripeCurrency = String(currency).toLowerCase();
    const shippingCents = toCents(shipping_amount);
    const totalPreTaxCents = toCents(amount);
    const merchandiseCents = Math.max(0, totalPreTaxCents - shippingCents);

    const calculation = await calculateTax(stripe, {
      currency: stripeCurrency,
      merchandiseCents,
      shippingCents,
      address: shipping_address
    });

    const taxCents = calculation?.tax_amount_exclusive || 0;
    const chargeCents = (calculation?.amount_total != null)
      ? calculation.amount_total
      : totalPreTaxCents + taxCents;

    const paymentIntentParams = {
      amount: chargeCents,
      currency: stripeCurrency,
      automatic_payment_methods: { enabled: true },
      metadata: {
        tax_amount: String(taxCents),
        tax_calculation: calculation?.id || ''
      }
    };

    if (calculation?.id) {
      paymentIntentParams.hooks = { inputs: { tax: { calculation: calculation.id } } };
    }

    let paymentIntent;
    try {
      paymentIntent = await stripe.paymentIntents.create(paymentIntentParams);
    } catch (error) {
      if (paymentIntentParams.hooks) {
        delete paymentIntentParams.hooks;
        paymentIntent = await stripe.paymentIntents.create(paymentIntentParams);
      } else {
        throw error;
      }
    }

    return res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      taxAmount: taxCents / 100,
      taxInclusiveTotal: chargeCents / 100
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return res.status(400).json({
      error: {
        message: error.message,
      },
    });
  }
}
