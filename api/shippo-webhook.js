import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const payload = req.body;

  // Ensure it is a track_updated event
  if (payload && payload.event === 'track_updated') {
    const trackingData = payload.data;
    
    if (!trackingData || !trackingData.tracking_number) {
      return res.status(400).json({ error: 'Missing tracking number in payload' });
    }

    const trackingNumber = trackingData.tracking_number;
    const trackingStatus = trackingData.tracking_status?.status; 

    // Shippo Statuses: PRE_TRANSIT, TRANSIT, DELIVERED, RETURNED, FAILURE
    if (!trackingStatus) {
      return res.status(400).json({ error: 'Missing tracking status in payload' });
    }

    let newOrderStatus = null;
    
    // Map Shippo tracking status to our database order status
    if (trackingStatus === 'TRANSIT') {
      newOrderStatus = 'Shipped';
    } else if (trackingStatus === 'DELIVERED') {
      newOrderStatus = 'Delivered';
    } else if (trackingStatus === 'RETURNED' || trackingStatus === 'FAILURE') {
      newOrderStatus = 'Returned';
    }

    if (newOrderStatus) {
      const supabaseAdmin = createClient(
        process.env.VITE_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );

      // Update the order in the database matching this tracking number
      const { error } = await supabaseAdmin
        .from('orders')
        .update({ status: newOrderStatus })
        .eq('tracking_number', trackingNumber);

      if (error) {
        console.error('Failed to update order status in Supabase:', error);
        return res.status(500).json({ error: 'Database update failed' });
      }

      console.log(`Successfully updated order with tracking ${trackingNumber} to status ${newOrderStatus}`);
      return res.status(200).json({ success: true, newStatus: newOrderStatus });
    } else {
      // If it's a status we don't map (like PRE_TRANSIT), just ignore and acknowledge
      return res.status(200).json({ success: true, message: `Status ${trackingStatus} ignored.` });
    }
  }

  // Acknowledge other events so Shippo doesn't retry
  return res.status(200).json({ success: true, message: 'Not a tracking update event.' });
}
