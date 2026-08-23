import { supabase } from '../lib/supabase';
import * as XLSX from 'xlsx';

export const exportDashboardDataToExcel = async (startDate = null, endDate = null, isAdmin = false) => {
  try {
    const workbook = XLSX.utils.book_new();

    // Helper to fetch data with date filters
    const fetchData = async (table, dateField = 'created_at') => {
      let query = supabase.from(table).select('*').order(dateField, { ascending: false });
      if (startDate) query = query.gte(dateField, new Date(startDate).toISOString());
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query = query.lte(dateField, end.toISOString());
      }
      return await query;
    };

    // --- 1. Dashboard Tab ---
    // (A simplified KPI view for the Dashboard tab)
    const { data: allOrders } = await fetchData('orders');
    let totalRev = 0;
    if (allOrders) totalRev = allOrders.reduce((acc, o) => acc + parseFloat(o.total_amount || 0), 0);
    
    const { data: allProducts } = await supabase.from('products').select('*');
    let invUnits = 0;
    let invCost = 0;
    if (allProducts) {
      allProducts.forEach(p => {
        invUnits += (p.stock || 0);
        // Assuming unit cost is unknown, we just use 0, but if we have it we calculate
        invCost += (p.stock || 0) * 0; 
      });
    }

    const dashboardData = [
      { 'KPI': 'Total Revenue', 'Current': `$${totalRev.toFixed(2)}`, '': '', 'Launch Snapshot': 'Ready', 'Count': 0 },
      { 'KPI': 'Total Expenses', 'Current': '$0.00', '': '', 'Launch Snapshot': 'In Progress', 'Count': 0 },
      { 'KPI': 'Gross Profit', 'Current': `$${totalRev.toFixed(2)}`, '': '', 'Launch Snapshot': 'Not Started', 'Count': 0 },
      { 'KPI': 'Inventory Units', 'Current': invUnits, '': '', 'Launch Snapshot': 'Blocked', 'Count': 0 },
      { 'KPI': 'Inventory Cost Value', 'Current': `$${invCost.toFixed(2)}`, '': '', 'Launch Snapshot': 'Total Tasks', 'Count': 0 },
      { 'KPI': 'Open Customer Orders', 'Current': allOrders ? allOrders.filter(o => o.status === 'Pending' || o.status === 'Processing').length : 0, '': '', 'Launch Snapshot': '', 'Count': '' }
    ];
    const wsDashboard = XLSX.utils.json_to_sheet(dashboardData);
    XLSX.utils.book_append_sheet(workbook, wsDashboard, "Dashboard");

    // --- 2. Inventory Tab ---
    // SKU | Style / Dress Name | Color | S | M | L | XL | XXL | Total Received | Units Sold | Stock Remaining | Unit Cost | Selling Price | Inventory Cost Value | Potential Revenue | Stock Status
    const { data: productsData } = await fetchData('products');
    const invRows = (productsData || []).map(p => {
      const stock = p.stock || 0;
      const price = parseFloat(p.price || 0);
      const unitCost = 0; // Not tracked in DB
      
      let stockStatus = 'In Stock';
      if (stock === 0) stockStatus = 'Out of Stock';
      else if (stock <= (p.low_stock_threshold || 5)) stockStatus = 'Low Stock';

      return {
        'SKU': p.sku || '',
        'Style / Dress Name': p.name || '',
        'Color': Array.isArray(p.colors) ? p.colors.join(', ') : (p.colors || ''),
        'S': '', 'M': '', 'L': '', 'XL': '', 'XXL': '', // Specific size stock not tracked
        'Total Received': 0,
        'Units Sold': 0, // Would need to calculate from order_items
        'Stock Remaining': stock,
        'Unit Cost': unitCost ? `$${unitCost.toFixed(2)}` : '$0.00',
        'Selling Price': `$${price.toFixed(2)}`,
        'Inventory Cost Value': `$${(stock * unitCost).toFixed(2)}`,
        'Potential Revenue': `$${(stock * price).toFixed(2)}`,
        'Stock Status': stockStatus
      };
    });
    // Add empty rows if no data to match template look
    if (invRows.length === 0) invRows.push({ 'SKU': '', 'Style / Dress Name': '', 'Color': '', 'S': '', 'M': '', 'L': '', 'XL': '', 'XXL': '', 'Total Received': '', 'Units Sold': '', 'Stock Remaining': '', 'Unit Cost': '', 'Selling Price': '', 'Inventory Cost Value': '', 'Potential Revenue': '', 'Stock Status': '' });
    
    const wsInventory = XLSX.utils.json_to_sheet(invRows);
    XLSX.utils.book_append_sheet(workbook, wsInventory, "Inventory");

    // --- 3. Orders Tab ---
    // Order # | Order Date | Customer Name | SKU | Product | Size | Qty | Order Total | COGS | Payment Status | Fulfillment Status | Tracking # | Carrier | Notes
    const { data: ordersWithItems } = await supabase
      .from('orders')
      .select('*, order_items(quantity, price_at_time, product_id, size, products(sku, name))')
      .order('created_at', { ascending: false });

    // Date filtering manually since it's a join
    let filteredOrders = ordersWithItems || [];
    if (startDate) {
      filteredOrders = filteredOrders.filter(o => new Date(o.created_at) >= new Date(startDate));
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filteredOrders = filteredOrders.filter(o => new Date(o.created_at) <= end);
    }

    const orderRows = [];
    filteredOrders.forEach(order => {
      const orderDate = new Date(order.created_at).toLocaleDateString();
      if (order.order_items && order.order_items.length > 0) {
        order.order_items.forEach(item => {
          orderRows.push({
            'Order #': order.id.split('-')[0], // Short ID
            'Order Date': orderDate,
            'Customer Name': order.customer_name || '',
            'SKU': item.products ? item.products.sku : '',
            'Product': item.products ? item.products.name : '',
            'Size': item.size || '',
            'Qty': item.quantity || 1,
            'Order Total': `$${parseFloat(order.total_amount || 0).toFixed(2)}`,
            'COGS': '$0.00',
            'Payment Status': 'Paid', // Assuming paid if it's an order
            'Fulfillment Status': order.status || 'Pending',
            'Tracking #': order.tracking_number || '',
            'Carrier': order.carrier || '',
            'Notes': ''
          });
        });
      } else {
        // Fallback if no items found for some reason
        orderRows.push({
          'Order #': order.id.split('-')[0],
          'Order Date': orderDate,
          'Customer Name': order.customer_name || '',
          'SKU': '', 'Product': '', 'Size': '', 'Qty': '',
          'Order Total': `$${parseFloat(order.total_amount || 0).toFixed(2)}`,
          'COGS': '$0.00',
          'Payment Status': 'Paid',
          'Fulfillment Status': order.status || 'Pending',
          'Tracking #': order.tracking_number || '', 'Carrier': order.carrier || '', 'Notes': ''
        });
      }
    });
    if (orderRows.length === 0) orderRows.push({ 'Order #': '', 'Order Date': '', 'Customer Name': '', 'SKU': '', 'Product': '', 'Size': '', 'Qty': '', 'Order Total': '', 'COGS': '', 'Payment Status': '', 'Fulfillment Status': '', 'Tracking #': '', 'Carrier': '', 'Notes': '' });
    
    const wsOrders = XLSX.utils.json_to_sheet(orderRows);
    XLSX.utils.book_append_sheet(workbook, wsOrders, "Orders");

    // --- 4. Suppliers & Production ---
    const supplierHeaders = ['Supplier', 'Contact', 'Style / SKU', 'Qty Ordered', 'Unit Cost', 'Order Value', 'Deposit Paid', 'Balance Due', 'Order Date', 'Expected Completion', 'Production Status', 'QC Status', 'Pickup Address', 'Payment Method', 'Notes'];
    const wsSuppliers = XLSX.utils.json_to_sheet([supplierHeaders.reduce((acc, h) => ({ ...acc, [h]: '' }), {})]);
    XLSX.utils.book_append_sheet(workbook, wsSuppliers, "Suppliers & Production");

    // --- 5. Shipping & Logistics ---
    const shippingHeaders = ['Shipment ID', 'Forwarder', 'Origin', 'Destination', 'Pickup Date', 'Weight (kg)', 'Rate / kg', 'Freight Cost', 'Inspection Cost', 'Other Cost', 'Total Shipping Cost', 'Method', 'ETA', 'Tracking', 'Status', 'Notes'];
    const wsShipping = XLSX.utils.json_to_sheet([shippingHeaders.reduce((acc, h) => ({ ...acc, [h]: '' }), {})]);
    XLSX.utils.book_append_sheet(workbook, wsShipping, "Shipping & Logistics");

    // --- 6. Expenses ---
    const expenseHeaders = ['Date', 'Category', 'Vendor / Payee', 'Description', 'Amount', 'Payment Method', 'Receipt / Reference', 'Notes'];
    const wsExpenses = XLSX.utils.json_to_sheet([expenseHeaders.reduce((acc, h) => ({ ...acc, [h]: '' }), {})]);
    XLSX.utils.book_append_sheet(workbook, wsExpenses, "Expenses");

    // --- 7. Profit & Sales ---
    const profitHeaders = ['Month', 'Gross Revenue', 'COGS', 'Shipping Costs', 'Operating Expenses', 'Net Profit', 'Profit Margin %'];
    const wsProfit = XLSX.utils.json_to_sheet([profitHeaders.reduce((acc, h) => ({ ...acc, [h]: '' }), {})]);
    XLSX.utils.book_append_sheet(workbook, wsProfit, "Profit & Sales");

    // --- 8. Launch Tracker ---
    const launchHeaders = ['Task', 'Area', 'Owner', 'Priority', 'Start Date', 'Due Date', 'Status', 'Dependency', 'Link / Reference', 'Notes'];
    const wsLaunch = XLSX.utils.json_to_sheet([launchHeaders.reduce((acc, h) => ({ ...acc, [h]: '' }), {})]);
    XLSX.utils.book_append_sheet(workbook, wsLaunch, "Launch Tracker");

    // --- 9. Content & Influencers ---
    const contentHeaders = ['Campaign / Creator', 'Platform', 'Product / SKU', 'Content Type', 'Product Sent', 'Draft Due', 'Post Date', 'Status', 'Fee / Cost', 'Views', 'Engagements', 'Sales', 'Revenue', 'Notes'];
    const wsContent = XLSX.utils.json_to_sheet([contentHeaders.reduce((acc, h) => ({ ...acc, [h]: '' }), {})]);
    XLSX.utils.book_append_sheet(workbook, wsContent, "Content & Influencers");

    // --- 10. Packaging Inventory ---
    const packagingHeaders = ['Item', 'Size / Spec', 'Supplier', 'Qty Purchased', 'Qty Used', 'Stock Remaining', 'Unit Cost', 'Stock Value', 'Reorder Level', 'Status'];
    const wsPackaging = XLSX.utils.json_to_sheet([packagingHeaders.reduce((acc, h) => ({ ...acc, [h]: '' }), {})]);
    XLSX.utils.book_append_sheet(workbook, wsPackaging, "Packaging Inventory");

    // --- 11. Start Here (Instructions) ---
    const startHereData = [
      { 'HOW TO USE THIS WORKBOOK': '1. Save this Excel file in your Klarelle SharePoint or OneDrive folder.' },
      { 'HOW TO USE THIS WORKBOOK': '2. Give your team edit access so everyone works from the same file.' },
      { 'HOW TO USE THIS WORKBOOK': '3. Enter dress quantities and pricing in Inventory.' },
      { 'HOW TO USE THIS WORKBOOK': '4. Record customer orders, production, shipments and expenses as they happen.' },
      { 'HOW TO USE THIS WORKBOOK': '5. Use Launch Tracker for pre-launch responsibilities and deadlines.' },
      { 'HOW TO USE THIS WORKBOOK': '6. Dashboard and Profit & Sales update from the data you enter.' },
      { 'HOW TO USE THIS WORKBOOK': '' },
      { 'HOW TO USE THIS WORKBOOK': 'Tip: Do not create separate copies for each person—co-author the SharePoint version.' }
    ];
    const wsStartHere = XLSX.utils.json_to_sheet(startHereData);
    XLSX.utils.book_append_sheet(workbook, wsStartHere, "Start Here");

    // --- (Optional) 12. System Activity Logs ---
    // If they still want system logs, we can keep it as an extra tab at the end
    if (isAdmin) {
      const { data: logsData, error: logsError } = await fetchData('activity_logs');
      if (!logsError && logsData) {
        const logsSheetData = logsData.map(log => ({
          'Log ID': log.id,
          'Action Type': log.action_type,
          'Description': log.description,
          'Actor': log.actor,
          'Date': new Date(log.created_at).toLocaleString()
        }));
        if(logsSheetData.length > 0) {
          const wsLogs = XLSX.utils.json_to_sheet(logsSheetData);
          XLSX.utils.book_append_sheet(workbook, wsLogs, "System Logs");
        }
      }
    }

    // Generate filename
    const dateStr = new Date().toISOString().split('T')[0];
    const fileName = `KLARELLE_Business_Operations_${dateStr}.xlsx`;

    // Download file
    XLSX.writeFile(workbook, fileName);
    
    return true;
  } catch (error) {
    console.error("Error exporting data to Excel:", error);
    alert("Failed to export data. Please check console for details.");
    return false;
  }
};
