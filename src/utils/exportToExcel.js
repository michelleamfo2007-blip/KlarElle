import { supabase } from '../lib/supabase';
import ExcelJS from 'exceljs';

// Helper to fetch images and convert to buffer
const fetchImageBuffer = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    return await response.arrayBuffer();
  } catch (error) {
    console.error("Failed to fetch image", url, error);
    return null;
  }
};

export const exportDashboardDataToExcel = async (startDate = null, endDate = null, isAdmin = false) => {
  try {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'KlarElle System';

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
    const { data: allOrders } = await fetchData('orders');
    let totalRev = 0;
    if (allOrders) totalRev = allOrders.reduce((acc, o) => acc + parseFloat(o.total_amount || 0), 0);
    
    const { data: allProducts } = await supabase.from('products').select('*');
    let invUnits = 0;
    let invCost = 0;
    if (allProducts) {
      allProducts.forEach(p => {
        invUnits += (p.stock || 0);
        invCost += (p.stock || 0) * 0; 
      });
    }

    const wsDashboard = workbook.addWorksheet("Dashboard");
    wsDashboard.columns = [
      { header: 'KPI', key: 'KPI', width: 25 },
      { header: 'Current', key: 'Current', width: 20 },
      { header: '', key: 'empty', width: 5 },
      { header: 'Launch Snapshot', key: 'LaunchSnapshot', width: 25 },
      { header: 'Count', key: 'Count', width: 10 }
    ];
    wsDashboard.addRows([
      { 'KPI': 'Total Revenue', 'Current': `$${totalRev.toFixed(2)}`, 'LaunchSnapshot': 'Ready', 'Count': 0 },
      { 'KPI': 'Total Expenses', 'Current': '$0.00', 'LaunchSnapshot': 'In Progress', 'Count': 0 },
      { 'KPI': 'Gross Profit', 'Current': `$${totalRev.toFixed(2)}`, 'LaunchSnapshot': 'Not Started', 'Count': 0 },
      { 'KPI': 'Inventory Units', 'Current': invUnits, 'LaunchSnapshot': 'Blocked', 'Count': 0 },
      { 'KPI': 'Inventory Cost Value', 'Current': `$${invCost.toFixed(2)}`, 'LaunchSnapshot': 'Total Tasks', 'Count': 0 },
      { 'KPI': 'Open Customer Orders', 'Current': allOrders ? allOrders.filter(o => o.status === 'Pending' || o.status === 'Processing').length : 0, 'LaunchSnapshot': '', 'Count': '' }
    ]);

    // --- 2. Inventory Tab ---
    const wsInventory = workbook.addWorksheet("Inventory");
    wsInventory.columns = [
      { header: 'SKU', key: 'SKU', width: 15 },
      { header: 'Image', key: 'Image', width: 12 },
      { header: 'Style / Dress Name', key: 'StyleName', width: 25 },
      { header: 'Color', key: 'Color', width: 15 },
      { header: 'S', key: 'S', width: 5 },
      { header: 'M', key: 'M', width: 5 },
      { header: 'L', key: 'L', width: 5 },
      { header: 'XL', key: 'XL', width: 5 },
      { header: 'XXL', key: 'XXL', width: 5 },
      { header: 'Total Received', key: 'TotalReceived', width: 15 },
      { header: 'Units Sold', key: 'UnitsSold', width: 15 },
      { header: 'Stock Remaining', key: 'StockRemaining', width: 15 },
      { header: 'Unit Cost', key: 'UnitCost', width: 15 },
      { header: 'Selling Price', key: 'SellingPrice', width: 15 },
      { header: 'Inventory Cost Value', key: 'InventoryCostValue', width: 20 },
      { header: 'Potential Revenue', key: 'PotentialRevenue', width: 20 },
      { header: 'Stock Status', key: 'StockStatus', width: 15 }
    ];

    const { data: productsData } = await fetchData('products');
    
    if (productsData && productsData.length > 0) {
      for (const p of productsData) {
        const stock = p.stock || 0;
        const price = parseFloat(p.price || 0);
        const unitCost = 0; 
        
        let stockStatus = 'In Stock';
        if (stock === 0) stockStatus = 'Out of Stock';
        else if (stock <= (p.low_stock_threshold || 5)) stockStatus = 'Low Stock';

        const row = wsInventory.addRow({
          'SKU': p.sku || '',
          'StyleName': p.name || '',
          'Color': Array.isArray(p.colors) ? p.colors.join(', ') : (p.colors || ''),
          'S': '', 'M': '', 'L': '', 'XL': '', 'XXL': '',
          'TotalReceived': 0, 'UnitsSold': 0,
          'StockRemaining': stock,
          'UnitCost': `$${unitCost.toFixed(2)}`,
          'SellingPrice': `$${price.toFixed(2)}`,
          'InventoryCostValue': `$${(stock * unitCost).toFixed(2)}`,
          'PotentialRevenue': `$${(stock * price).toFixed(2)}`,
          'StockStatus': stockStatus
        });
        
        row.height = 60; // Make row taller for image
        
        if (p.image_url) {
          const buffer = await fetchImageBuffer(p.image_url);
          if (buffer) {
            const ext = p.image_url.toLowerCase().endsWith('png') ? 'png' : 'jpeg';
            const imageId = workbook.addImage({ buffer, extension: ext });
            // addImage col/row is 0-indexed. Col 1 is 'Image' column (B).
            wsInventory.addImage(imageId, {
              tl: { col: 1, row: row.number - 1 },
              ext: { width: 50, height: 60 }
            });
          }
        }
      }
    } else {
      wsInventory.addRow({}); // Empty row
    }

    // --- 3. Orders Tab ---
    const wsOrders = workbook.addWorksheet("Orders");
    wsOrders.columns = [
      { header: 'Order #', key: 'OrderID', width: 15 },
      { header: 'Order Date', key: 'OrderDate', width: 15 },
      { header: 'Customer Name', key: 'CustomerName', width: 20 },
      { header: 'SKU', key: 'SKU', width: 15 },
      { header: 'Image', key: 'Image', width: 12 },
      { header: 'Product', key: 'Product', width: 25 },
      { header: 'Size', key: 'Size', width: 10 },
      { header: 'Qty', key: 'Qty', width: 10 },
      { header: 'Order Total', key: 'OrderTotal', width: 15 },
      { header: 'COGS', key: 'COGS', width: 15 },
      { header: 'Payment Status', key: 'PaymentStatus', width: 15 },
      { header: 'Fulfillment Status', key: 'FulfillmentStatus', width: 15 },
      { header: 'Tracking #', key: 'Tracking', width: 20 },
      { header: 'Carrier', key: 'Carrier', width: 15 },
      { header: 'Notes', key: 'Notes', width: 20 }
    ];

    const { data: ordersWithItems } = await supabase
      .from('orders')
      .select('*, order_items(quantity, price_at_time, product_id, size, products(sku, name, image_url))')
      .order('created_at', { ascending: false });

    let filteredOrders = ordersWithItems || [];
    if (startDate) {
      filteredOrders = filteredOrders.filter(o => new Date(o.created_at) >= new Date(startDate));
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filteredOrders = filteredOrders.filter(o => new Date(o.created_at) <= end);
    }

    if (filteredOrders.length > 0) {
      for (const order of filteredOrders) {
        const orderDate = new Date(order.created_at).toLocaleDateString();
        
        if (order.order_items && order.order_items.length > 0) {
          for (const item of order.order_items) {
            const product = item.products;
            const row = wsOrders.addRow({
              'OrderID': order.id.split('-')[0],
              'OrderDate': orderDate,
              'CustomerName': order.customer_name || '',
              'SKU': product ? product.sku : '',
              'Product': product ? product.name : '',
              'Size': item.size || '',
              'Qty': item.quantity || 1,
              'OrderTotal': `$${parseFloat(order.total_amount || 0).toFixed(2)}`,
              'COGS': '$0.00',
              'PaymentStatus': 'Paid',
              'FulfillmentStatus': order.status || 'Pending',
              'Tracking': order.tracking_number || '',
              'Carrier': order.carrier || '',
              'Notes': ''
            });
            row.height = 60;
            
            if (product && product.image_url) {
              const buffer = await fetchImageBuffer(product.image_url);
              if (buffer) {
                const ext = product.image_url.toLowerCase().endsWith('png') ? 'png' : 'jpeg';
                const imageId = workbook.addImage({ buffer, extension: ext });
                // Col 4 is 'Image' (E)
                wsOrders.addImage(imageId, {
                  tl: { col: 4, row: row.number - 1 },
                  ext: { width: 50, height: 60 }
                });
              }
            }
          }
        } else {
          const row = wsOrders.addRow({
            'OrderID': order.id.split('-')[0], 'OrderDate': orderDate, 'CustomerName': order.customer_name || '',
            'OrderTotal': `$${parseFloat(order.total_amount || 0).toFixed(2)}`, 'COGS': '$0.00',
            'PaymentStatus': 'Paid', 'FulfillmentStatus': order.status || 'Pending',
            'Tracking': order.tracking_number || '', 'Carrier': order.carrier || '', 'Notes': ''
          });
          row.height = 15;
        }
      }
    } else {
      wsOrders.addRow({});
    }

    // --- 4. Suppliers & Production ---
    const wsSuppliers = workbook.addWorksheet("Suppliers & Production");
    wsSuppliers.addRow(['Supplier', 'Contact', 'Style / SKU', 'Qty Ordered', 'Unit Cost', 'Order Value', 'Deposit Paid', 'Balance Due', 'Order Date', 'Expected Completion', 'Production Status', 'QC Status', 'Pickup Address', 'Payment Method', 'Notes']);

    // --- 5. Shipping & Logistics ---
    const wsShipping = workbook.addWorksheet("Shipping & Logistics");
    wsShipping.addRow(['Shipment ID', 'Forwarder', 'Origin', 'Destination', 'Pickup Date', 'Weight (kg)', 'Rate / kg', 'Freight Cost', 'Inspection Cost', 'Other Cost', 'Total Shipping Cost', 'Method', 'ETA', 'Tracking', 'Status', 'Notes']);

    // --- 6. Expenses ---
    const wsExpenses = workbook.addWorksheet("Expenses");
    wsExpenses.addRow(['Date', 'Category', 'Vendor / Payee', 'Description', 'Amount', 'Payment Method', 'Receipt / Reference', 'Notes']);

    // --- 7. Profit & Sales ---
    const wsProfit = workbook.addWorksheet("Profit & Sales");
    wsProfit.addRow(['Month', 'Gross Revenue', 'COGS', 'Shipping Costs', 'Operating Expenses', 'Net Profit', 'Profit Margin %']);

    // --- 8. Launch Tracker ---
    const wsLaunch = workbook.addWorksheet("Launch Tracker");
    wsLaunch.addRow(['Task', 'Area', 'Owner', 'Priority', 'Start Date', 'Due Date', 'Status', 'Dependency', 'Link / Reference', 'Notes']);

    // --- 9. Content & Influencers ---
    const wsContent = workbook.addWorksheet("Content & Influencers");
    wsContent.addRow(['Campaign / Creator', 'Platform', 'Product / SKU', 'Content Type', 'Product Sent', 'Draft Due', 'Post Date', 'Status', 'Fee / Cost', 'Views', 'Engagements', 'Sales', 'Revenue', 'Notes']);

    // --- 10. Packaging Inventory ---
    const wsPackaging = workbook.addWorksheet("Packaging Inventory");
    wsPackaging.addRow(['Item', 'Size / Spec', 'Supplier', 'Qty Purchased', 'Qty Used', 'Stock Remaining', 'Unit Cost', 'Stock Value', 'Reorder Level', 'Status']);

    // --- 11. Start Here (Instructions) ---
    const wsStartHere = workbook.addWorksheet("Start Here");
    wsStartHere.columns = [{ header: 'HOW TO USE THIS WORKBOOK', key: 'ins', width: 80 }];
    wsStartHere.addRows([
      { ins: '1. Save this Excel file in your Klarelle SharePoint or OneDrive folder.' },
      { ins: '2. Give your team edit access so everyone works from the same file.' },
      { ins: '3. Enter dress quantities and pricing in Inventory.' },
      { ins: '4. Record customer orders, production, shipments and expenses as they happen.' },
      { ins: '5. Use Launch Tracker for pre-launch responsibilities and deadlines.' },
      { ins: '6. Dashboard and Profit & Sales update from the data you enter.' },
      { ins: '' },
      { ins: 'Tip: Do not create separate copies for each person—co-author the SharePoint version.' }
    ]);

    // --- (Optional) 12. System Activity Logs ---
    if (isAdmin) {
      const { data: logsData, error: logsError } = await fetchData('activity_logs');
      if (!logsError && logsData && logsData.length > 0) {
        const wsLogs = workbook.addWorksheet("System Logs");
        wsLogs.columns = [
          { header: 'Log ID', key: 'id', width: 35 },
          { header: 'Action Type', key: 'type', width: 20 },
          { header: 'Description', key: 'desc', width: 40 },
          { header: 'Actor', key: 'actor', width: 25 },
          { header: 'Date', key: 'date', width: 20 }
        ];
        logsData.forEach(log => {
          wsLogs.addRow({
            id: log.id, type: log.action_type, desc: log.description,
            actor: log.actor, date: new Date(log.created_at).toLocaleString()
          });
        });
      }
    }

    // Auto-fit columns for all worksheets
    workbook.worksheets.forEach(worksheet => {
      let maxCols = 0;
      worksheet.eachRow({ includeEmpty: false }, row => {
        if (row.cellCount > maxCols) maxCols = row.cellCount;
      });

      for (let i = 1; i <= maxCols; i++) {
        const column = worksheet.getColumn(i);
        let maxLength = 0;
        column.eachCell({ includeEmpty: true }, cell => {
          const cellValue = cell.value;
          let columnLength = 10; // Default minimum
          if (cellValue) {
            if (typeof cellValue === 'object' && cellValue.text) {
               // Hyperlinks or rich text
               columnLength = cellValue.text.toString().length;
            } else {
               columnLength = cellValue.toString().length;
            }
          }
          if (columnLength > maxLength) {
            maxLength = columnLength;
          }
        });
        // Cap width between 15 and 50 characters, add padding
        column.width = Math.min(Math.max(maxLength + 4, 15), 50);
      }
    });

    // Generate blob and download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    
    const dateStr = new Date().toISOString().split('T')[0];
    const fileName = `KLARELLE_Business_Operations_${dateStr}.xlsx`;
    
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error("Error exporting data to Excel:", error);
    alert("Failed to export data. Please check console for details.");
    return false;
  }
};
