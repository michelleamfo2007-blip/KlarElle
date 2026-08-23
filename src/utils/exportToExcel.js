import { supabase } from '../lib/supabase';
import * as XLSX from 'xlsx';

/**
 * Fetches data and exports it to an Excel file (.xlsx)
 * @param {Date|string|null} startDate - The start date for the filter (optional)
 * @param {Date|string|null} endDate - The end date for the filter (optional)
 * @param {boolean} isAdmin - Flag to determine if it's admin or super admin (to filter data if needed)
 */
export const exportDashboardDataToExcel = async (startDate = null, endDate = null, isAdmin = false) => {
  try {
    const workbook = XLSX.utils.book_new();

    // 1. Fetch Orders
    let ordersQuery = supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (startDate) ordersQuery = ordersQuery.gte('created_at', new Date(startDate).toISOString());
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      ordersQuery = ordersQuery.lte('created_at', end.toISOString());
    }
    const { data: ordersData, error: ordersError } = await ordersQuery;
    if (ordersError) throw ordersError;

    const ordersSheetData = ordersData.map(order => ({
      'Order ID': order.id,
      'Customer Name': order.customer_name,
      'Customer Email': order.customer_email,
      'Total Amount': order.total_amount,
      'Status': order.status,
      'Date': new Date(order.created_at).toLocaleString()
    }));
    const ordersWorksheet = XLSX.utils.json_to_sheet(ordersSheetData);
    XLSX.utils.book_append_sheet(workbook, ordersWorksheet, "Orders");

    // 2. Fetch Activity Logs
    let logsQuery = supabase.from('activity_logs').select('*').order('created_at', { ascending: false });
    if (startDate) logsQuery = logsQuery.gte('created_at', new Date(startDate).toISOString());
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      logsQuery = logsQuery.lte('created_at', end.toISOString());
    }
    const { data: logsData, error: logsError } = await logsQuery;
    
    // Some tenants might not have activity_logs table, handle gracefully
    if (!logsError && logsData) {
      const logsSheetData = logsData.map(log => ({
        'Log ID': log.id,
        'Action Type': log.action_type,
        'Description': log.description,
        'Actor': log.actor,
        'Date': new Date(log.created_at).toLocaleString()
      }));
      const logsWorksheet = XLSX.utils.json_to_sheet(logsSheetData);
      XLSX.utils.book_append_sheet(workbook, logsWorksheet, "Activity Logs");
    }

    // 3. Fetch Inventory (Products) - Usually we don't filter inventory by date unless they want "products created in date range"
    // We will apply the date range to product creation date just in case, but typically inventory is current state.
    // Let's not filter inventory by date to show current stock, or maybe filter by created_at. Let's filter by created_at.
    let productsQuery = supabase.from('products').select('*').order('created_at', { ascending: false });
    if (startDate) productsQuery = productsQuery.gte('created_at', new Date(startDate).toISOString());
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      productsQuery = productsQuery.lte('created_at', end.toISOString());
    }
    const { data: productsData, error: productsError } = await productsQuery;
    if (productsError) throw productsError;

    const productsSheetData = productsData.map(product => ({
      'Product ID': product.id,
      'Name': product.name,
      'Category': product.category,
      'Price': product.price,
      'Stock': product.stock,
      'Low Stock Threshold': product.low_stock_threshold || 5,
      'Created Date': new Date(product.created_at).toLocaleString()
    }));
    const productsWorksheet = XLSX.utils.json_to_sheet(productsSheetData);
    XLSX.utils.book_append_sheet(workbook, productsWorksheet, "Inventory");

    // Generate filename
    const dateStr = new Date().toISOString().split('T')[0];
    const fileName = `KlarElle_Dashboard_Export_${dateStr}.xlsx`;

    // Download file
    XLSX.writeFile(workbook, fileName);
    
    return true;
  } catch (error) {
    console.error("Error exporting data to Excel:", error);
    alert("Failed to export data. Please check console for details.");
    return false;
  }
};
