import { createClient } from '@supabase/supabase-js';
import {
  easyshipRequest,
  getEasyshipOriginAddress,
  isEasyshipSandbox,
  toEasyshipDestination,
  toEasyshipItems
} from './_easyship.js';
import { cartShipsFromInternational } from '../src/utils/stock.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json({ sandbox: isEasyshipSandbox() });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const order_id = req.body.order_id || req.body.orderId;
  if (!order_id) {
    return res.status(400).json({ error: 'Missing order_id' });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: 'Supabase credentials missing' });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', order_id)
      .single();

    if (error || !order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const rateId = order.shippo_rate_id || '';

    const apiKey = process.env.EASYSHIP_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Easyship API key is not configured' });
    }

    const { data: orderItems } = await supabase
      .from('order_items')
      .select(`
        quantity,
        price_at_time,
        product_id,
        size,
        color,
        product:products (
          id,
          name,
          sku,
          variant_images,
          stock,
          stock_international,
          weight,
          length,
          width,
          height,
          country_of_manufacture,
          hs_code,
          price
        )
      `)
      .eq('order_id', order_id);

    const fulfillmentSource = order.fulfilled_from
      || (cartShipsFromInternational((orderItems || []).map((item) => ({
        ...item.product,
        selectedColor: item.color,
        selectedSize: item.size
      }))) ? 'CN' : 'US');

    const originAddress = await getEasyshipOriginAddress(apiKey, order, fulfillmentSource);
    const destinationAddress = toEasyshipDestination(order);
    const items = toEasyshipItems(orderItems || []);

    const shipmentPayload = {
      origin_address: originAddress,
      destination_address: destinationAddress,
      incoterms: 'DDU',
      insurance: { is_insured: false },
      parcels: [{ items }],
      shipping_settings: {
        buy_label: false,
        buy_label_synchronous: false,
        units: {
          weight: 'kg',
          dimensions: 'cm'
        }
      }
    };

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(rateId);
    if (isUuid) {
      shipmentPayload.courier_settings = {
        courier_service_id: rateId,
        allow_fallback: true,
        apply_shipping_rules: true
      };
    } else {
      shipmentPayload.courier_settings = {
        apply_shipping_rules: true,
        allow_fallback: true
      };
    }

    const shipmentData = await easyshipRequest(apiKey, '/shipments', {
      method: 'POST',
      body: JSON.stringify(shipmentPayload)
    });

    const shipment = shipmentData.shipment || shipmentData.shipments?.[0] || {};
    let trackingNumber = shipment.tracking_number || shipment.easyship_shipment_id || '';
    let labelUrl = shipment.label_url || shipment.label?.label_url || '';

    if (shipment.easyship_shipment_id && (!trackingNumber || !labelUrl)) {
      try {
        const labelData = await easyshipRequest(apiKey, '/batches/labels', {
          method: 'POST',
          body: JSON.stringify({
            shipments: [{
              easyship_shipment_id: shipment.easyship_shipment_id,
              ...(isUuid ? { courier_service_id: rateId } : {})
            }]
          })
        });
        const label = labelData.labels?.[0] || labelData.shipments?.[0] || {};
        trackingNumber = label.tracking_number || trackingNumber;
        labelUrl = label.label_url || labelUrl;
      } catch (labelError) {
        if (!trackingNumber) {
          throw labelError;
        }
      }
    }

    if (!trackingNumber) {
      throw new Error('Easyship created the shipment but did not return a tracking number yet. Try again in a moment.');
    }

    const { error: updateError } = await supabase
      .from('orders')
      .update({
        tracking_number: trackingNumber,
        shipping_label_url: labelUrl || null,
        status: 'Shipped'
      })
      .eq('id', order_id);

    if (updateError) {
      throw updateError;
    }

    return res.status(200).json({
      success: true,
      trackingNumber,
      labelUrl,
      sandbox: isEasyshipSandbox(apiKey)
    });
  } catch (error) {
    console.error('Label API Error:', error);
    return res.status(error.status || 500).json({
      error: error.message || 'Internal server error while creating label'
    });
  }
}
