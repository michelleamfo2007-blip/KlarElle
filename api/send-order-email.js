import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { order_id } = req.body;
    if (!order_id) {
      return res.status(400).json({ error: "Missing order_id" });
    }

    if (!process.env.RESEND_API_KEY || !process.env.VITE_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return res.status(500).json({ error: "Missing Environment Variables" });
    }

    // Connect to DB securely
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Fetch order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', order_id)
      .single();

    if (orderError || !order) {
      throw new Error("Order not found");
    }

    // Fetch order items with product names
    const { data: items } = await supabase
      .from('order_items')
      .select(`
        *,
        product:products (
          name
        )
      `)
      .eq('order_id', order_id);

    // Prepare items HTML table
    let itemsHtml = `
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-family: Arial, sans-serif;">
        <tr style="border-bottom: 2px solid #eee;">
          <th style="text-align: left; padding: 10px 0; color: #333;">Item</th>
          <th style="text-align: center; padding: 10px 0; color: #333;">Qty</th>
          <th style="text-align: right; padding: 10px 0; color: #333;">Price</th>
        </tr>
    `;

    let orderTotal = 0;
    
    if (items && items.length > 0) {
      items.forEach(item => {
        const productName = item.product?.name || 'Product';
        const price = parseFloat(item.price_at_time).toFixed(2);
        orderTotal += (item.quantity * parseFloat(item.price_at_time));
        
        let details = [];
        if (item.size) details.push(`Size: ${item.size}`);
        if (item.color) details.push(`Color: ${item.color}`);
        const variantText = details.length > 0 ? `<br/><span style="font-size: 12px; color: #666;">${details.join(' | ')}</span>` : '';

        itemsHtml += `
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 15px 0;">
              <strong>${productName}</strong>
              ${variantText}
            </td>
            <td style="text-align: center; padding: 15px 0;">${item.quantity}</td>
            <td style="text-align: right; padding: 15px 0;">$${price}</td>
          </tr>
        `;
      });
    }

    // Include shipping dynamically if the DB order total is higher than the items total
    const grandTotal = parseFloat(order.total_amount).toFixed(2);
    const shippingCost = (parseFloat(order.total_amount) - orderTotal).toFixed(2);
    
    if (shippingCost > 0) {
      itemsHtml += `
        <tr>
          <td colspan="2" style="text-align: right; padding: 15px 0; font-weight: bold;">Shipping:</td>
          <td style="text-align: right; padding: 15px 0;">$${shippingCost}</td>
        </tr>
      `;
    }

    itemsHtml += `
        <tr>
          <td colspan="2" style="text-align: right; padding: 15px 0; font-weight: bold; font-size: 18px;">Total:</td>
          <td style="text-align: right; padding: 15px 0; font-weight: bold; font-size: 18px;">$${grandTotal}</td>
        </tr>
      </table>
    `;

    const shortOrderId = order_id.split('-')[0].toUpperCase();

    // 1. Email to Customer (Receipt)
    const customerHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #111;">
        <div style="text-align: center; padding: 20px 0;">
          <h1 style="margin: 0; color: #000; font-size: 28px; letter-spacing: 2px;">KLARELLE</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 8px;">
          <h2 style="margin-top: 0;">Thank you for your purchase!</h2>
          <p>Hi ${order.customer_name.split(' ')[0] || 'there'},</p>
          <p>We're getting your order ready to be shipped. We will notify you when it has been sent.</p>
          
          <div style="margin-top: 30px; background: #fff; padding: 20px; border-radius: 4px; border: 1px solid #eee;">
            <h3 style="margin-top: 0; margin-bottom: 15px;">Order Summary (#${shortOrderId})</h3>
            ${itemsHtml}
          </div>

          <div style="margin-top: 30px;">
            <h3 style="margin-bottom: 10px;">Shipping Address</h3>
            <p style="margin: 0; color: #555; line-height: 1.6;">
              ${order.customer_name}<br/>
              ${order.shipping_address}
            </p>
          </div>
        </div>
        <div style="text-align: center; padding: 20px 0; color: #888; font-size: 12px;">
          <p>If you have any questions, reply to this email or contact us at orders@klarelle.store</p>
          <p>&copy; ${new Date().getFullYear()} KlarElle Store</p>
        </div>
      </div>
    `;

    // 2. Email to Admin (Notification)
    const adminHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #111;">
        <h2>🎉 New Order Received!</h2>
        <p><strong>Order ID:</strong> #${shortOrderId} (${order_id})</p>
        <p><strong>Customer:</strong> ${order.customer_name} (${order.customer_email})</p>
        <p><strong>Total Paid:</strong> $${grandTotal}</p>
        
        <h3>Order Items:</h3>
        ${itemsHtml}

        <h3>Shipping Address:</h3>
        <p>${order.shipping_address}</p>
        
        <p style="margin-top: 30px;">
          <a href="https://klarelle.store/admin/orders/${order_id}" style="background: #000; color: #fff; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">View Order in Dashboard</a>
        </p>
      </div>
    `;

    // Send Customer Email
    const customerRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'KlarElle Orders <orders@klarelle.store>',
        to: order.customer_email,
        subject: `Order Confirmation - KlarElle #${shortOrderId}`,
        html: customerHtml
      })
    });

    if (!customerRes.ok) {
      console.error("Failed to send customer email", await customerRes.text());
    }

    // Send Admin Notification
    const adminRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'KlarElle Store <orders@klarelle.store>',
        to: 'orders@klarelle.store', // The requested admin email
        subject: `New Order Received - $${grandTotal}`,
        html: adminHtml
      })
    });

    if (!adminRes.ok) {
      console.error("Failed to send admin email", await adminRes.text());
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Exception in send-order-email:", error);
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}
