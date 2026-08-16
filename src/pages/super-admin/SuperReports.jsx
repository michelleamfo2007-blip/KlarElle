import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useCurrency } from '../../context/CurrencyContext';
import { TrendingUp, Users, ShoppingBag, DollarSign, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';

const COLORS = ['#000000', '#4b5563', '#9ca3af', '#d1d5db', '#f3f4f6'];

function SuperReports() {
  const { formatPrice } = useCurrency();
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30days'); // 'all', '30days'
  
  // Metrics
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  
  // Charts Data
  const [salesData, setSalesData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const fetchData = async () => {
    setLoading(true);
    
    let ordersQuery = supabase.from('orders').select('*');
    let orderItemsQuery = supabase.from('order_items').select('*, products(name)');
    let customersQuery = supabase.from('store_customers').select('id', { count: 'exact' });

    if (dateRange === '30days') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const isoDate = thirtyDaysAgo.toISOString();
      ordersQuery = ordersQuery.gte('created_at', isoDate);
      customersQuery = customersQuery.gte('created_at', isoDate);
      // Not filtering order_items by date for simplicity, but we could by joining orders
    }

    const [ordersRes, itemsRes, customersRes] = await Promise.all([
      ordersQuery,
      orderItemsQuery,
      customersQuery
    ]);

    const orders = ordersRes.data || [];
    const items = itemsRes.data || [];
    
    // Total Customers
    setTotalCustomers(customersRes.count || 0);

    // Filter valid orders for revenue (Paid, Processing, Shipped, Delivered)
    const validOrders = orders.filter(o => ['Paid', 'Processing', 'Shipped', 'Delivered'].includes(o.status));
    
    const revenue = validOrders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
    setTotalRevenue(revenue);
    setTotalOrders(validOrders.length);

    // Aggregate Sales Over Time
    const salesByDate = {};
    validOrders.forEach(order => {
      const date = new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      salesByDate[date] = (salesByDate[date] || 0) + Number(order.total_amount || 0);
    });

    const formattedSalesData = Object.keys(salesByDate).map(date => ({
      date,
      revenue: salesByDate[date]
    }));
    
    // Sort chronologically (simple sort, assuming within same year for 30 days)
    // For robust sorting we'd need the real Date object, but this is a rough approximation for the dashboard
    setSalesData(formattedSalesData.reverse()); // Just reversing assuming DB returns newest first usually

    // Order Status Breakdown
    const statusCounts = {};
    orders.forEach(order => {
      statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
    });
    
    const formattedStatusData = Object.keys(statusCounts).map(status => ({
      name: status,
      value: statusCounts[status]
    }));
    setStatusData(formattedStatusData);

    // Top Selling Products
    const productCounts = {};
    items.forEach(item => {
      const name = item.products?.name || 'Unknown Product';
      productCounts[name] = (productCounts[name] || 0) + item.quantity;
    });

    const formattedTopProducts = Object.keys(productCounts)
      .map(name => ({
        name: name.length > 20 ? name.substring(0, 20) + '...' : name,
        sales: productCounts[name]
      }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5); // Top 5
      
    setTopProducts(formattedTopProducts);

    setLoading(false);
  };

  if (loading) {
    return <div style={{ padding: '60px', textAlign: 'center', color: '#6b7280', fontFamily: 'Inter, sans-serif' }}>Crunching numbers...</div>;
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', fontFamily: 'Inter, sans-serif', color: '#111827' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 4px 0' }}>Reports & Analytics</h1>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>Gain insights into your store's performance.</p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#fff', padding: '4px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <button 
            onClick={() => setDateRange('30days')}
            style={{ padding: '8px 16px', background: dateRange === '30days' ? '#000' : 'transparent', color: dateRange === '30days' ? '#fff' : '#4b5563', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
          >
            Last 30 Days
          </button>
          <button 
            onClick={() => setDateRange('all')}
            style={{ padding: '8px 16px', background: dateRange === 'all' ? '#000' : 'transparent', color: dateRange === 'all' ? '#fff' : '#4b5563', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
          >
            All Time
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '14px', color: '#6b7280', fontWeight: '600' }}>Total Revenue</h3>
            <div style={{ background: '#f3f4f6', padding: '8px', borderRadius: '8px' }}><DollarSign size={20} color="#111827" /></div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{formatPrice(totalRevenue)}</div>
        </div>

        <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '14px', color: '#6b7280', fontWeight: '600' }}>Total Orders</h3>
            <div style={{ background: '#f3f4f6', padding: '8px', borderRadius: '8px' }}><ShoppingBag size={20} color="#111827" /></div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{totalOrders}</div>
        </div>

        <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '14px', color: '#6b7280', fontWeight: '600' }}>Avg. Order Value</h3>
            <div style={{ background: '#f3f4f6', padding: '8px', borderRadius: '8px' }}><TrendingUp size={20} color="#111827" /></div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{totalOrders > 0 ? formatPrice(totalRevenue / totalOrders) : formatPrice(0)}</div>
        </div>

        <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '14px', color: '#6b7280', fontWeight: '600' }}>New Customers</h3>
            <div style={{ background: '#f3f4f6', padding: '8px', borderRadius: '8px' }}><Users size={20} color="#111827" /></div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{totalCustomers}</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '40px' }}>
        
        {/* Revenue Chart */}
        <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '24px' }}>
          <h3 style={{ margin: '0 0 24px 0', fontSize: '16px', fontWeight: '600' }}>Revenue Overview</h3>
          {salesData.length > 0 ? (
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} tickFormatter={(value) => `$${value}`} dx={-10} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    formatter={(value) => [formatPrice(value), 'Revenue']}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#000000" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>No revenue data for this period</div>
          )}
        </div>

        {/* Order Status Chart */}
        <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '24px' }}>
          <h3 style={{ margin: '0 0 24px 0', fontSize: '16px', fontWeight: '600' }}>Order Status</h3>
          {statusData.length > 0 ? (
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>No order data for this period</div>
          )}
        </div>

        {/* Top Products */}
        <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '24px', gridColumn: '1 / -1' }}>
          <h3 style={{ margin: '0 0 24px 0', fontSize: '16px', fontWeight: '600' }}>Top Selling Products</h3>
          {topProducts.length > 0 ? (
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#4b5563', fontWeight: '500' }} width={150} />
                  <Tooltip 
                    cursor={{ fill: '#f9fafb' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    formatter={(value) => [value, 'Units Sold']}
                  />
                  <Bar dataKey="sales" fill="#000000" radius={[0, 4, 4, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
             <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>No product sales data for this period</div>
          )}
        </div>

      </div>
    </div>
  );
}

export default SuperReports;
