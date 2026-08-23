import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useOutletContext, Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { exportDashboardDataToExcel } from '../../utils/exportToExcel';
import { DollarSign, ShoppingBag, Package, AlertTriangle, TrendingUp, Clock, CheckCircle, Truck, PackageCheck, ArrowRight, XCircle, RefreshCcw, Eye, Download, Calendar } from 'lucide-react';

function Dashboard() {
  const [totalProducts, setTotalProducts] = useState(0);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [siteViews, setSiteViews] = useState(0);
  
  // Real Data States
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [orderSummary, setOrderSummary] = useState({ Pending: 0, Processing: 0, Shipped: 0, Delivered: 0, Cancelled: 0, Refunded: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [allFetchedOrders, setAllFetchedOrders] = useState([]);
  const [showAllOrders, setShowAllOrders] = useState(false);
  const [salesData, setSalesData] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const { userName } = useOutletContext();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    // 1. Total products
    const { count: productCount } = await supabase.from('products').select('*', { count: 'exact', head: true });
    setTotalProducts(productCount || 0);

    // 2. Low stock items
    const { data: stockData } = await supabase.from('products').select('id, name, stock, low_stock_threshold, image_url');
    if (stockData) {
      const lowStock = stockData.filter(p => p.stock <= (p.low_stock_threshold !== null ? p.low_stock_threshold : 5));
      setLowStockItems(lowStock);
    }
    
    // 3. Fetch all orders (for revenue, chart, recent, summary)
    // Note: For a massive production store, you'd use a postgres VIEW or RPC. Fetching all is fine for startup.
    const { data: orders } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    
    if (orders) {
      setTotalOrders(orders.length);
      
      let revenue = 0;
      let summary = { Pending: 0, Processing: 0, Shipped: 0, Delivered: 0, Cancelled: 0, Refunded: 0 };
      
      // Calculate revenue & summary
      orders.forEach(o => {
        revenue += parseFloat(o.total_amount || 0);
        if (summary[o.status] !== undefined) {
          summary[o.status]++;
        } else {
          summary.Pending++; // Fallback
        }
      });
      setTotalRevenue(revenue);
      setOrderSummary(summary);
      
      // Store all orders in a new state variable, and recent 5 in the old one
      setAllFetchedOrders(orders);
      setRecentOrders(orders.slice(0, 5));
      
      // Group sales by day (Last 7 days)
      const last7Days = Array.from({length: 7}, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return { 
          dateStr: d.toISOString().split('T')[0], // yyyy-mm-dd
          name: d.toLocaleDateString('en-US', { weekday: 'short' }), 
          revenue: 0 
        };
      });
      
      orders.forEach(o => {
        const orderDate = o.created_at.split('T')[0];
        const day = last7Days.find(d => d.dateStr === orderDate);
        if (day) {
          day.revenue += parseFloat(o.total_amount || 0);
        }
      });
      setSalesData(last7Days);
    }

    // 4. Best Sellers (Fetch order items + join products)
    const { data: orderItems } = await supabase.from('order_items').select('product_id, quantity, price_at_time, products(name, image_url)');
    if (orderItems && orderItems.length > 0) {
      const aggregated = {};
      orderItems.forEach(item => {
        if (!item.product_id || !item.products) return;
        
        if (!aggregated[item.product_id]) {
          aggregated[item.product_id] = {
            id: item.product_id,
            name: item.products.name,
            image: item.products.image_url,
            units: 0,
            revenue: 0
          };
        }
        aggregated[item.product_id].units += item.quantity;
        aggregated[item.product_id].revenue += (item.quantity * parseFloat(item.price_at_time || 0));
      });
      
      // Sort by units sold and take top 5
      const topSellers = Object.values(aggregated).sort((a, b) => b.units - a.units).slice(0, 5);
      setBestSellers(topSellers);
    }
    
    
    // 5. Site Views
    const { count: viewCount } = await supabase.from('page_views').select('*', { count: 'exact', head: true });
    setSiteViews(viewCount || 0);
    
    setLoading(false);
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    // Optimistic UI update for recentOrders
    setRecentOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    // Optimistic UI update for allFetchedOrders
    setAllFetchedOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    
    // Update in database
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);
      
    if (error) {
      alert('Failed to update order status');
      fetchDashboardData(); // Revert on failure
    }
  };

  const formatUSD = (amount) => `$${parseFloat(amount || 0).toFixed(2)}`;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Delivered': return <span style={{ background: '#dcfce7', color: '#166534', padding: '4px 8px', borderRadius: '100px', fontSize: '12px', fontWeight: '600' }}>Delivered</span>;
      case 'Processing': return <span style={{ background: '#dbeafe', color: '#1e40af', padding: '4px 8px', borderRadius: '100px', fontSize: '12px', fontWeight: '600' }}>Processing</span>;
      case 'Shipped': return <span style={{ background: '#fef9c3', color: '#854d0e', padding: '4px 8px', borderRadius: '100px', fontSize: '12px', fontWeight: '600' }}>Shipped</span>;
      case 'Pending': default: return <span style={{ background: '#fee2e2', color: '#991b1b', padding: '4px 8px', borderRadius: '100px', fontSize: '12px', fontWeight: '600' }}>Pending</span>;
    }
  };

  const handleExport = async () => {
    setExporting(true);
    await exportDashboardDataToExcel(startDate, endDate, false);
    setExporting(false);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', fontFamily: 'Inter, sans-serif', color: '#111827' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 8px 0', color: '#111827' }}>Welcome back, {userName}!</h1>
          <p style={{ color: '#6b7280', margin: 0 }}>Here is what's happening with your store today.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', background: '#fff', padding: '12px', borderRadius: '12px', border: '1px solid #D2C4B3' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={18} color="#BCA38F" />
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)}
              style={{ border: '1px solid #eaeaea', borderRadius: '6px', padding: '6px 12px', fontSize: '14px', outline: 'none' }}
            />
            <span style={{ color: '#6b7280' }}>to</span>
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)}
              style={{ border: '1px solid #eaeaea', borderRadius: '6px', padding: '6px 12px', fontSize: '14px', outline: 'none' }}
            />
          </div>
          
          <button 
            onClick={handleExport}
            disabled={exporting}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              background: '#111827', 
              color: '#fff', 
              border: 'none', 
              padding: '8px 16px', 
              borderRadius: '8px',
              cursor: exporting ? 'not-allowed' : 'pointer',
              fontWeight: '500',
              opacity: exporting ? 0.7 : 1,
              transition: 'opacity 0.2s'
            }}
          >
            <Download size={18} />
            {exporting ? 'Exporting...' : 'Export Data'}
          </button>
        </div>
      </div>

      <style>{`
        .dash-card { background: #fff; border-radius: 8px; border: 1px solid #D2C4B3; box-shadow: 0 4px 15px rgba(188, 163, 143, 0.1); overflow: hidden; }
        .dash-card-header { padding: 16px 20px; border-bottom: 1px solid #FAF9F6; font-weight: 600; display: flex; justify-content: space-between; align-items: center; color: #111827; }
        .kpi-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 20px; margin-bottom: 24px; }
        .kpi-card { background: #fff; padding: 20px; border-radius: 8px; border: 1px solid #D2C4B3; box-shadow: 0 4px 15px rgba(188, 163, 143, 0.1); }
        .kpi-icon { width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; }
        .kpi-value { font-size: 28px; font-weight: bold; margin: 4px 0; color: #111827; }
        .kpi-label { font-size: 14px; color: #BCA38F; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
        .kpi-change { font-size: 12px; display: flex; align-items: center; gap: 4px; font-weight: 500; }
        
        .section-2col-65-35 { display: grid; grid-template-columns: 2fr 1fr; gap: 24px; margin-bottom: 24px; }
        .section-2col-50-50 { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }
        
        .table-standard { width: 100%; border-collapse: collapse; text-align: left; }
        .table-standard th { padding: 12px 20px; font-size: 12px; text-transform: uppercase; color: #BCA38F; border-bottom: 1px solid #D2C4B3; background: #FAF9F6; font-weight: 600; letter-spacing: 0.5px; }
        .table-standard td { padding: 16px 20px; font-size: 14px; border-bottom: 1px solid #FAF9F6; color: #111827; }
        .table-standard tr:last-child td { border-bottom: none; }
        
        .order-summary-item { display: flex; align-items: center; gap: 16px; padding: 16px 20px; border-bottom: 1px solid #FAF9F6; }
        .order-summary-item:last-child { border-bottom: none; }
        .order-icon-wrap { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
        
        @media (max-width: 1200px) {
          .kpi-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 1024px) {
          .kpi-grid { grid-template-columns: repeat(2, 1fr); }
          .section-2col-65-35, .section-2col-50-50 { grid-template-columns: 1fr; }
        }
        @media (max-width: 640px) {
          .kpi-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* ROW 1: KPIs */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="kpi-label">Total Revenue</div>
              <div className="kpi-value">{loading ? '...' : formatUSD(totalRevenue)}</div>
            </div>
            <div className="kpi-icon" style={{ background: 'rgba(188, 163, 143, 0.1)', color: '#BCA38F' }}><DollarSign size={20} /></div>
          </div>
          <div className="kpi-change" style={{ color: '#BCA38F' }}><TrendingUp size={14} /> +0.0% from last week</div>
        </div>
        
        <Link to="/admin/orders" style={{ textDecoration: 'none', color: 'inherit' }} className="kpi-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="kpi-label">Total Orders</div>
              <div className="kpi-value">{loading ? '...' : totalOrders}</div>
            </div>
            <div className="kpi-icon" style={{ background: 'rgba(17, 24, 39, 0.05)', color: '#111827' }}><ShoppingBag size={20} /></div>
          </div>
          <div className="kpi-change" style={{ color: '#BCA38F' }}><TrendingUp size={14} /> +0.0% from last week</div>
        </Link>

        <Link to="/admin/products" style={{ textDecoration: 'none', color: 'inherit' }} className="kpi-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="kpi-label">Total Products</div>
              <div className="kpi-value">{loading ? '...' : totalProducts}</div>
            </div>
            <div className="kpi-icon" style={{ background: 'rgba(188, 163, 143, 0.1)', color: '#BCA38F' }}><Package size={20} /></div>
          </div>
          <div className="kpi-change" style={{ color: '#BCA38F' }}>Active listings in store</div>
        </Link>

        <div className="kpi-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="kpi-label">Low Stock Items</div>
              <div className="kpi-value">{loading ? '...' : lowStockItems.length}</div>
            </div>
            <div className="kpi-icon" style={{ background: 'rgba(17, 24, 39, 0.05)', color: '#111827' }}><AlertTriangle size={20} /></div>
          </div>
          <div className="kpi-change" style={{ color: lowStockItems.length > 0 ? '#111827' : '#BCA38F' }}>
            {lowStockItems.length > 0 ? 'Needs attention immediately' : 'Inventory levels healthy'}
          </div>
        </div>
        
        <div className="kpi-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="kpi-label">Site Views</div>
              <div className="kpi-value">{loading ? '...' : siteViews}</div>
            </div>
            <div className="kpi-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}><Eye size={20} /></div>
          </div>
          <div className="kpi-change" style={{ color: '#BCA38F' }}>Total views all time</div>
        </div>
      </div>

      {/* ROW 2: Charts & Order Summary */}
      <div className="section-2col-65-35">
        
        {/* Sales Overview */}
        <div className="dash-card">
          <div className="dash-card-header">
            <span>Sales Overview</span>
            <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{formatUSD(totalRevenue)}</span>
          </div>
          <div style={{ height: '300px', padding: '20px 20px 0 0' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#000000" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#000000" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} tickFormatter={(val) => `$${val}`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                  formatter={(value) => [`$${value}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#000000" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Summary */}
        <div className="dash-card">
          <div className="dash-card-header">
            <span>Order Summary</span>
          </div>
          <div>
            <div className="order-summary-item">
              <div className="order-icon-wrap" style={{ background: '#fee2e2', color: '#991b1b' }}><Clock size={18} /></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: '600' }}>Pending Orders</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>Awaiting payment/confirmation</div>
              </div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{orderSummary.Pending}</div>
            </div>
            <div className="order-summary-item">
              <div className="order-icon-wrap" style={{ background: '#dbeafe', color: '#1e40af' }}><Package size={18} /></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: '600' }}>Processing</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>Being packed for shipment</div>
              </div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{orderSummary.Processing}</div>
            </div>
            <div className="order-summary-item">
              <div className="order-icon-wrap" style={{ background: '#fef9c3', color: '#854d0e' }}><Truck size={18} /></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: '600' }}>Shipped</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>On the way to customer</div>
              </div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{orderSummary.Shipped}</div>
            </div>
            <div className="order-summary-item">
              <div className="order-icon-wrap" style={{ background: '#dcfce7', color: '#166534' }}><PackageCheck size={18} /></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: '600' }}>Delivered</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>Successfully received</div>
              </div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{orderSummary.Delivered}</div>
            </div>
            <div className="order-summary-item">
              <div className="order-icon-wrap" style={{ background: '#f3f4f6', color: '#4b5563' }}><XCircle size={18} /></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: '600' }}>Cancelled</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>Order was cancelled</div>
              </div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{orderSummary.Cancelled}</div>
            </div>
            <div className="order-summary-item">
              <div className="order-icon-wrap" style={{ background: '#fce7f3', color: '#be185d' }}><RefreshCcw size={18} /></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: '600' }}>Refunded</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>Payment refunded</div>
              </div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{orderSummary.Refunded}</div>
            </div>
          </div>
          <div style={{ padding: '16px 20px', borderTop: '1px solid #e5e7eb', background: '#fafafa' }}>
            <Link to="/admin/orders" style={{ width: '100%', padding: '8px', background: '#fff', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', textDecoration: 'none', color: '#111827' }}>
              View All Orders <ArrowRight size={16} />
            </Link>
          </div>
        </div>

      </div>

      {/* ROW 3: Recent Orders & Inventory Alerts */}
      <div className="section-2col-50-50">
        
        {/* Recent Orders */}
        <div className="dash-card">
          <div className="dash-card-header">
            <span>Recent Orders</span>
            <Link to="/admin/orders" style={{ fontSize: '13px', color: '#111827', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '500', textDecoration: 'none' }}>
              View All
            </Link>
          </div>
          <div className="table-responsive-wrapper">
            <table className="table-standard admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr><td colSpan="4" style={{ textAlign: 'center', color: '#6b7280' }}>No orders yet.</td></tr>
                ) : (
                  recentOrders.map((order, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: '600' }}>
                        {order.id.split('-')[0]}...<br/>
                        <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 'normal' }}>
                          {new Date(order.created_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td>{order.customer_name}</td>
                      <td style={{ fontWeight: '500' }}>{formatUSD(order.total_amount)}</td>
                      <td>
                        <select 
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '100px',
                            fontSize: '12px',
                            fontWeight: '600',
                            border: '1px solid #d1d5db',
                            background: order.status === 'Delivered' ? '#dcfce7' : 
                                        order.status === 'Processing' ? '#dbeafe' : 
                                        order.status === 'Shipped' ? '#fef9c3' : 
                                        order.status === 'Cancelled' ? '#f3f4f6' : 
                                        order.status === 'Refunded' ? '#fce7f3' : '#fee2e2',
                            color: order.status === 'Delivered' ? '#166534' : 
                                   order.status === 'Processing' ? '#1e40af' : 
                                   order.status === 'Shipped' ? '#854d0e' : 
                                   order.status === 'Cancelled' ? '#4b5563' : 
                                   order.status === 'Refunded' ? '#be185d' : '#991b1b',
                            outline: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                          <option value="Refunded">Refunded</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Inventory Alerts */}
        <div className="dash-card">
          <div className="dash-card-header">
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><AlertTriangle size={18} color="#dc2626"/> Inventory Alerts</span>
          </div>
          <div className="table-responsive-wrapper">
            <table className="table-standard admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Stock</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="3" style={{ textAlign: 'center' }}>Loading alerts...</td></tr>
                ) : lowStockItems.length === 0 ? (
                  <tr><td colSpan="3" style={{ textAlign: 'center', color: '#6b7280' }}>All stock levels are healthy!</td></tr>
                ) : (
                  lowStockItems.map((item) => (
                    <tr key={item.id}>
                      <td style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.name} style={{ width: '32px', height: '32px', objectFit: 'cover', borderRadius: '4px' }} />
                        ) : (
                          <div style={{ width: '32px', height: '32px', background: '#e5e7eb', borderRadius: '4px' }}></div>
                        )}
                        <span style={{ fontWeight: '500', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.name}</span>
                      </td>
                      <td>
                        <span style={{ color: item.stock === 0 ? '#dc2626' : '#d97706', fontWeight: 'bold' }}>
                          {item.stock} left
                        </span>
                      </td>
                      <td>
                        <Link to={`/admin/products/edit/${item.id}`} style={{ padding: '6px 12px', background: '#fff', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '12px', fontWeight: '500', color: '#111827', cursor: 'pointer', textDecoration: 'none' }}>
                          Manage
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* ROW 4: Best Sellers */}
      <div className="dash-card" style={{ marginBottom: '40px' }}>
        <div className="dash-card-header">
          <span>Best Selling Products</span>
        </div>
        <div className="table-responsive-wrapper">
          <table className="table-standard admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Units Sold</th>
                <th>Revenue Generated</th>
                <th>Trend</th>
              </tr>
            </thead>
            <tbody>
              {bestSellers.length === 0 ? (
                  <tr><td colSpan="4" style={{ textAlign: 'center', color: '#6b7280' }}>Not enough data yet.</td></tr>
              ) : (
                bestSellers.map((item) => (
                  <tr key={item.id}>
                    <td style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {item.image ? (
                        <img src={item.image} alt={item.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                      ) : (
                        <div style={{ width: '40px', height: '40px', background: '#e5e7eb', borderRadius: '4px' }}></div>
                      )}
                      <span style={{ fontWeight: '600' }}>{item.name}</span>
                    </td>
                    <td>{item.units} units</td>
                    <td style={{ fontWeight: 'bold' }}>{formatUSD(item.revenue)}</td>
                    <td style={{ color: '#16a34a', display: 'flex', alignItems: 'center', gap: '4px', paddingTop: '24px' }}>
                      <TrendingUp size={16} /> Up this week
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

export default Dashboard;
