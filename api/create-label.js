import { Shippo } from 'shippo';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { orderId, name, address, destinationZip, rateObjectId } = req.body;
  const apiKey = process.env.SHIPPO_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'SHIPPO_API_KEY is not configured' });
  }

  const shippo = new Shippo({ apiKeyHeader: `ShippoToken ${apiKey}` });

  try {
    let transaction;

    if (rateObjectId && !rateObjectId.includes('mock')) {
      // If we have a real rate object ID, generate the label directly
      transaction = await shippo.transactions.create({
        rate: rateObjectId,
        labelFileType: 'PDF',
        async: false
      });
    } else {
      // For development/mock fallback: just generate a generic mock label
      transaction = {
        status: 'SUCCESS',
        trackingNumber: 'SHIPPO_' + Math.floor(Math.random() * 1000000000),
        labelUrl: 'https://shippo-delivery-mock-label.pdf'
      };
    }

    if (transaction.status === 'SUCCESS' || transaction.status === 'QUEUED') {
      return res.status(200).json({ 
        success: true, 
        trackingNumber: transaction.trackingNumber,
        labelUrl: transaction.labelUrl 
      });
    } else {
      return res.status(400).json({ error: 'Failed to generate label from Shippo', details: transaction.messages });
    }

  } catch (error) {
    console.error('Shippo Label Error:', error);
    return res.status(500).json({ error: 'Internal server error while generating label' });
  }
}
