import { createClient } from '@supabase/supabase-js';
import { formatShippingAddress } from '../src/utils/address.js';
import { formatSizeLabel } from '../src/utils/size.js';

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
        if (item.size) details.push(`Size: ${formatSizeLabel(item.size)}`);
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

    itemsHtml += `</table>`;

    const grandTotal = parseFloat(order.total_amount).toFixed(2);
    const shippingCost = Math.max(0, parseFloat(order.total_amount) - orderTotal).toFixed(2);

    const shortOrderId = order_id.split('-')[0].toUpperCase();
    const firstName = (order.customer_name || 'there').split(' ')[0];
    const orderDate = new Date(order.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const formattedAddress = formatShippingAddress(order.shipping_address) || order.shipping_address || '';
    const supportEmail = 'support@klarelle.store';

    // 1. Email to Customer (Receipt)
    const customerHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #111; line-height: 1.6;">
        <div style="text-align: center; padding: 20px 0;">
          <h1 style="margin: 0; color: #000; font-size: 28px; letter-spacing: 2px;">KLARELLE</h1>
        </div>
        <p>Hi ${firstName},</p>
        <p>Thank you for shopping with Klarelle! We’re pleased to confirm that we have received your order and payment.</p>
        <p><strong>Order Number:</strong> #${shortOrderId}<br/>
        <strong>Order Date:</strong> ${orderDate}</p>
        <h3 style="margin-bottom: 8px;">Order Summary:</h3>
        ${itemsHtml}
        <p><strong>Subtotal:</strong> $${orderTotal.toFixed(2)}<br/>
        <strong>Shipping:</strong> $${Math.max(0, parseFloat(shippingCost) || 0).toFixed(2)}<br/>
        <strong>Total:</strong> $${grandTotal}</p>
        <h3 style="margin-bottom: 8px;">Shipping Address:</h3>
        <p style="margin-top: 0; color: #555;">
          ${order.customer_name}<br/>
          ${formattedAddress}
        </p>
        <p>We’re now preparing your order. Once it has shipped, you’ll receive another email containing your tracking information.</p>
        <p>If you notice an error or experience any issue with your order, please contact us at <a href="mailto:${supportEmail}">${supportEmail}</a> and include your order number. We kindly ask that you contact our team before initiating a payment dispute or chargeback. Bank disputes can take several weeks or longer to investigate and may limit our ability to resolve the issue directly. Contacting us first allows our team to review your concern and provide a faster resolution whenever possible.</p>
        <p>With love,<br/>The Klarelle Team<br/><a href="https://www.klarelle.store">www.klarelle.store</a></p>
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
        <p>${formattedAddress}</p>
        
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
