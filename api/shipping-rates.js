import { Shippo } from 'shippo';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { destinationZip, weightPounds = 0, weightOunces = 10 } = req.body;
  const apiKey = process.env.SHIPPO_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'SHIPPO_API_KEY is not configured' });
  }

  const shippo = new Shippo({ apiKeyHeader: `ShippoToken ${apiKey}` });

  try {
    const shipment = await shippo.shipments.create({
      addressFrom: {
        name: 'Klarelle Store',
        street1: '123 Fashion Ave',
        city: 'New York',
        state: 'NY',
        zip: '10001',
        country: 'US',
      },
      addressTo: {
        name: 'Customer',
        street1: '123 Main St',
        city: 'Anytown',
        state: 'NY',
        zip: destinationZip || '10001',
        country: 'US',
      },
      parcels: [{
        length: '10',
        width: '8',
        height: '4',
        distanceUnit: 'in',
        weight: ((weightPounds * 16) + weightOunces).toString(),
        massUnit: 'oz',
      }],
      async: false
    });

    let rates = [];
    
    if (shipment && shipment.rates && shipment.rates.length > 0) {
      rates = shipment.rates.map(r => ({
        provider: r.provider,
        serviceLevel: r.servicelevel.name,
        amount: parseFloat(r.amount),
        currency: r.currency,
        objectId: r.objectId,
        estimatedDays: r.estimatedDays
      }));
    } else {
      // Mock data for development
      rates = [
        { provider: 'USPS', serviceLevel: 'Priority Mail', amount: 9.50, objectId: 'usps_mock_1', estimatedDays: 3 },
        { provider: 'UPS', serviceLevel: 'UPS Ground', amount: 12.80, objectId: 'ups_mock_1', estimatedDays: 5 },
        { provider: 'USPS', serviceLevel: 'Priority Mail Express', amount: 28.00, objectId: 'usps_mock_2', estimatedDays: 1 },
        { provider: 'UPS', serviceLevel: 'UPS Next Day Air', amount: 45.00, objectId: 'ups_mock_2', estimatedDays: 1 }
      ];
    }

    return res.status(200).json({ success: true, rates });

  } catch (error) {
    console.error('Shippo API Error:', error);
    return res.status(500).json({ error: 'Internal server error while fetching shipping rates' });
  }
}
