import { useState } from 'react';
import { Link } from 'react-router-dom';
import SellerLayout from '../../components/seller/SellerLayout';
import { useSeller } from '../../context/SellerContext';
import {
  DollarSign,
  ShoppingBag,
  Package,
  TrendingUp,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  Plus,
  Eye,
  Star,
  Boxes,
  Ticket,
  ChevronRight,
  ArrowRight,
  BarChart3,
  Calendar,
} from 'lucide-react';

export default function SellerDashboardPage() {
  const {
    shop,
    seller,
    products,
    orders,
    reviews,
    totalSales,
    totalOrdersCount,
    pendingOrdersCount,
    lowStockProductsCount,
    totalProductsCount,
    totalEarnings,
  } = useSeller();

  const [analyticsPeriod, setAnalyticsPeriod] = useState('monthly'); // 'daily', 'weekly', 'monthly'

  // Realistic time-series data for analytics charts
  const chartData = {
    daily: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      sales: [180, 420, 260, 580, 390, 750, 620],
      revenue: [158, 369, 228, 510, 343, 660, 545],
      total: '₹3,200',
    },
    weekly: {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      sales: [3400, 4100, 5200, 4800],
      revenue: [2992, 3608, 4576, 4224],
      total: '₹17,500',
    },
    monthly: {
      labels: ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'],
      sales: [11200, 14500, 16800, 19200, 23400, 28600],
      revenue: [9856, 12760, 14784, 16896, 20592, 25168],
      total: '₹113,700',
    },
  };

  const currentDataset = chartData[analyticsPeriod];
  const maxVal = Math.max(...currentDataset.sales);

  // Best selling products sorted by sales_count
  const bestSellers = [...products]
    .sort((a, b) => (b.sales_count || 0) - (a.sales_count || 0))
    .slice(0, 4);

  // Low stock alert items
  const lowStockItems = products.filter(
    (p) => p.stock_quantity <= 5
  ).slice(0, 4);

  // Recent 5 orders
  const recentOrders = orders.slice(0, 5);

  // Recent reviews
  const recentReviews = reviews.slice(0, 3);

  return (
    <SellerLayout>
      {/* Page Header */}
      <div className="seller-page-header">
        <div className="seller-page-title-group">
          <h1>Atelier Executive Dashboard</h1>
          <p className="seller-page-subtitle">
            Welcome back, {seller.name}. Here is the commercial performance of {shop.name} today.
          </p>
        </div>

        <div className="seller-page-actions">
          <Link to="/seller/reports" className="btn-seller-secondary">
            <BarChart3 size={15} />
            <span>Detailed Analytics</span>
          </Link>
          <Link to="/seller/products/add" className="btn-seller-gold">
            <Plus size={15} />
            <span>Add Garment</span>
          </Link>
        </div>
      </div>

      {/* 6 OVERVIEW METRIC CARDS */}
      <div className="seller-stats-grid">
        {/* 1. Total Sales */}
        <div className="seller-stat-card">
          <div className="stat-card-top">
            <div className="stat-icon-wrapper">
              <DollarSign size={22} color="var(--seller-espresso)" />
            </div>
            <span className="stat-trend-pill positive">
              <ArrowUpRight size={13} /> +18.4%
            </span>
          </div>
          <span className="stat-label">Total Sales</span>
          <h2 className="stat-value">₹{totalSales.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h2>
          <span className="stat-subtext">Gross customer order volume</span>
        </div>

        {/* 2. Total Orders */}
        <div className="seller-stat-card">
          <div className="stat-card-top">
            <div className="stat-icon-wrapper">
              <ShoppingBag size={22} color="var(--seller-espresso)" />
            </div>
            <span className="stat-trend-pill positive">
              <ArrowUpRight size={13} /> +12.1%
            </span>
          </div>
          <span className="stat-label">Total Orders</span>
          <h2 className="stat-value">{totalOrdersCount}</h2>
          <span className="stat-subtext">Across all sales channels</span>
        </div>

        {/* 3. Total Products */}
        <div className="seller-stat-card">
          <div className="stat-card-top">
            <div className="stat-icon-wrapper">
              <Package size={22} color="var(--seller-espresso)" />
            </div>
            <span className="stat-trend-pill positive">Active</span>
          </div>
          <span className="stat-label">Catalog Pieces</span>
          <h2 className="stat-value">{totalProductsCount}</h2>
          <span className="stat-subtext">Garments in shop portfolio</span>
        </div>

        {/* 4. Total Net Earnings */}
        <div className="seller-stat-card">
          <div className="stat-card-top">
            <div className="stat-icon-wrapper" style={{ background: 'var(--seller-gold-glow)' }}>
              <TrendingUp size={22} color="var(--seller-gold-dark)" />
            </div>
            <span className="stat-trend-pill positive">88% Share</span>
          </div>
          <span className="stat-label">Net Atelier Earnings</span>
          <h2 className="stat-value" style={{ color: 'var(--seller-gold-dark)' }}>
            ₹{totalEarnings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </h2>
          <span className="stat-subtext">Post 12% marketplace commission</span>
        </div>

        {/* 5. Pending Orders */}
        <div className="seller-stat-card">
          <div className="stat-card-top">
            <div className="stat-icon-wrapper">
              <Clock size={22} color="var(--seller-warning)" />
            </div>
            <span className="stat-trend-pill warning">Fulfillment</span>
          </div>
          <span className="stat-label">Pending Orders</span>
          <h2 className="stat-value">{pendingOrdersCount}</h2>
          <span className="stat-subtext">Awaiting acceptance & dispatch</span>
        </div>

        {/* 6. Low Stock Products */}
        <div className="seller-stat-card">
          <div className="stat-card-top">
            <div className="stat-icon-wrapper" style={{ background: 'var(--seller-danger-bg)' }}>
              <AlertTriangle size={22} color="var(--seller-danger)" />
            </div>
            {lowStockProductsCount > 0 && (
              <span className="stat-trend-pill danger">Action Required</span>
            )}
          </div>
          <span className="stat-label">Low Stock Alerts</span>
          <h2 className="stat-value">{lowStockProductsCount}</h2>
          <span className="stat-subtext">Garments below 5 units threshold</span>
        </div>
      </div>

      {/* QUICK ACTIONS ROW */}
      <div
        className="seller-card mb-24"
        style={{
          background: 'linear-gradient(135deg, var(--seller-espresso) 0%, var(--seller-espresso-dark) 100%)',
          color: 'var(--seller-white)',
          padding: '20px 24px',
          marginBottom: '28px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 style={{ margin: '0 0 4px', fontSize: '15px', color: 'var(--seller-gold-light)', letterSpacing: '0.5px' }}>
              ATELIER QUICK ACTIONS
            </h3>
            <p style={{ margin: 0, fontSize: '13px', color: 'rgba(232, 222, 209, 0.7)' }}>
              Accelerate daily studio operations and customer communications.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <Link
              to="/seller/products/add"
              style={{
                background: 'var(--seller-gold)',
                color: 'var(--seller-espresso)',
                padding: '9px 16px',
                borderRadius: 'var(--seller-radius)',
                textDecoration: 'none',
                fontSize: '12.5px',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Plus size={14} /> Add Product
            </Link>
            <Link
              to="/seller/inventory"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'var(--seller-white)',
                border: '1px solid rgba(232, 222, 209, 0.25)',
                padding: '9px 16px',
                borderRadius: 'var(--seller-radius)',
                textDecoration: 'none',
                fontSize: '12.5px',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Boxes size={14} /> Manage Stock
            </Link>
            <Link
              to="/seller/coupons"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'var(--seller-white)',
                border: '1px solid rgba(232, 222, 209, 0.25)',
                padding: '9px 16px',
                borderRadius: 'var(--seller-radius)',
                textDecoration: 'none',
                fontSize: '12.5px',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Ticket size={14} /> Create Coupon
            </Link>
            <Link
              to="/seller/orders"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'var(--seller-white)',
                border: '1px solid rgba(232, 222, 209, 0.25)',
                padding: '9px 16px',
                borderRadius: 'var(--seller-radius)',
                textDecoration: 'none',
                fontSize: '12.5px',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <ShoppingBag size={14} /> Process Orders
            </Link>
          </div>
        </div>
      </div>

      {/* ANALYTICS SECTION: SALES & REVENUE CHARTS */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '28px' }}>
        {/* Sales Overview Chart Card */}
        <div className="seller-card">
          <div className="seller-card-title-row">
            <div>
              <h3>Commercial Sales Curve</h3>
              <p style={{ margin: '4px 0 0', fontSize: '12.5px', color: 'var(--seller-muted)' }}>
                Gross sales volume in Espresso and Net Atelier Earnings in Muted Gold.
              </p>
            </div>

            {/* Time Filter Pills */}
            <div style={{ display: 'flex', gap: '4px', background: 'var(--seller-cream)', padding: '3px', borderRadius: 'var(--seller-radius)' }}>
              {['daily', 'weekly', 'monthly'].map((p) => (
                <button
                  key={p}
                  type="button"
                  style={{
                    border: 'none',
                    background: analyticsPeriod === p ? 'var(--seller-espresso)' : 'transparent',
                    color: analyticsPeriod === p ? 'var(--seller-white)' : 'var(--seller-muted)',
                    padding: '5px 12px',
                    borderRadius: 'var(--seller-radius-sm)',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    textTransform: 'capitalize',
                    cursor: 'pointer',
                    transition: 'var(--seller-transition)',
                  }}
                  onClick={() => setAnalyticsPeriod(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive SVG Chart Canvas */}
          <div style={{ height: '240px', width: '100%', marginTop: '16px', position: 'relative' }}>
            <svg viewBox="0 0 700 240" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              <defs>
                <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#B69A70" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#B69A70" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="espressoGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#30251F" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#30251F" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 60, 120, 180].map((y) => (
                <line
                  key={y}
                  x1="0"
                  y1={y}
                  x2="700"
                  y2={y}
                  stroke="var(--seller-border-light)"
                  strokeDasharray="4 4"
                />
              ))}

              {/* Bar Columns & Area Visualization */}
              {currentDataset.sales.map((val, idx) => {
                const barWidth = 40;
                const colSpacing = 700 / currentDataset.sales.length;
                const x = idx * colSpacing + colSpacing / 2 - barWidth / 2;
                const barHeight = (val / maxVal) * 170;
                const y = 200 - barHeight;

                const netVal = currentDataset.revenue[idx];
                const netHeight = (netVal / maxVal) * 170;
                const netY = 200 - netHeight;

                return (
                  <g key={idx} style={{ cursor: 'pointer' }}>
                    {/* Gross Sales Bar (Espresso) */}
                    <rect
                      x={x}
                      y={y}
                      width={barWidth / 2}
                      height={barHeight}
                      fill="var(--seller-espresso)"
                      rx="3"
                    />

                    {/* Net Revenue Bar (Gold) */}
                    <rect
                      x={x + barWidth / 2 + 2}
                      y={netY}
                      width={barWidth / 2}
                      height={netHeight}
                      fill="var(--seller-gold)"
                      rx="3"
                    />

                    {/* Value on hover tooltip */}
                    <title>{`${currentDataset.labels[idx]}: Gross ₹${val} | Net ₹${netVal}`}</title>

                    {/* Label */}
                    <text
                      x={x + barWidth / 2}
                      y={225}
                      textAnchor="middle"
                      fill="var(--seller-muted)"
                      fontSize="11"
                      fontWeight="600"
                    >
                      {currentDataset.labels[idx]}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px', marginTop: '16px', fontSize: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '12px', background: 'var(--seller-espresso)', borderRadius: '2px' }} />
              <span style={{ color: 'var(--seller-espresso)', fontWeight: 600 }}>Gross Sales</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '12px', background: 'var(--seller-gold)', borderRadius: '2px' }} />
              <span style={{ color: 'var(--seller-gold-dark)', fontWeight: 600 }}>Atelier Net Payout (88%)</span>
            </div>
          </div>
        </div>

        {/* Order Statistics Breakdown Card */}
        <div className="seller-card">
          <div className="seller-card-title-row">
            <h3>Fulfillment Velocity</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ padding: '14px', background: 'var(--seller-cream)', borderRadius: 'var(--seller-radius)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
                <strong style={{ color: 'var(--seller-espresso)' }}>Order Fulfillment Rate</strong>
                <span style={{ color: 'var(--seller-success)', fontWeight: 700 }}>98.2%</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: 'var(--seller-border)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: '98.2%', height: '100%', background: 'var(--seller-success)' }} />
              </div>
            </div>

            <div style={{ padding: '14px', background: 'var(--seller-cream)', borderRadius: 'var(--seller-radius)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
                <strong style={{ color: 'var(--seller-espresso)' }}>Average Dispatch Speed</strong>
                <span style={{ color: 'var(--seller-espresso)', fontWeight: 700 }}>18.4 Hours</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: 'var(--seller-border)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: '85%', height: '100%', background: 'var(--seller-gold)' }} />
              </div>
            </div>

            <div style={{ padding: '14px', background: 'var(--seller-cream)', borderRadius: 'var(--seller-radius)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
                <strong style={{ color: 'var(--seller-espresso)' }}>Customer Satisfaction</strong>
                <span style={{ color: 'var(--seller-warning)', fontWeight: 700 }}>4.9 / 5.0</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: 'var(--seller-border)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: '96%', height: '100%', background: 'var(--seller-warning)' }} />
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '6px' }}>
              <span style={{ fontSize: '11px', color: 'var(--seller-muted)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                ZELORA PREMIER ATELIER BADGE ACTIVE
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* LOWER GRID: RECENT ORDERS & BEST SELLERS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '24px', marginBottom: '28px' }}>
        {/* Recent Orders Table */}
        <div className="seller-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--seller-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--seller-espresso)', fontWeight: 700 }}>
              Recent Boutique Orders
            </h3>
            <Link
              to="/seller/orders"
              style={{
                fontSize: '12.5px',
                fontWeight: 700,
                color: 'var(--seller-gold-dark)',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              View All Orders <ArrowRight size={13} />
            </Link>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="seller-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((ord) => (
                  <tr key={ord.id}>
                    <td>
                      <strong style={{ fontFamily: 'monospace', color: 'var(--seller-espresso)' }}>
                        {ord.order_id}
                      </strong>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{ord.customer_name}</span>
                      <small style={{ display: 'block', color: 'var(--seller-muted)', fontSize: '11px' }}>
                        {ord.items.length} piece{ord.items.length > 1 ? 's' : ''}
                      </small>
                    </td>
                    <td>
                      <strong style={{ color: 'var(--seller-espresso)' }}>
                        ₹{ord.total_amount.toFixed(2)}
                      </strong>
                    </td>
                    <td>
                      <span className={`status-pill ${ord.order_status.toLowerCase()}`}>
                        {ord.order_status}
                      </span>
                    </td>
                    <td>
                      <Link
                        to={`/seller/orders/${ord.order_id}`}
                        className="btn-seller-secondary btn-seller-sm"
                        style={{ padding: '4px 10px' }}
                      >
                        <Eye size={13} /> Inspect
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Best Selling Products */}
        <div className="seller-card">
          <div className="seller-card-title-row">
            <h3>Top Performing Garments</h3>
            <Link
              to="/seller/products"
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: 'var(--seller-gold-dark)',
                textDecoration: 'none',
              }}
            >
              All Products
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {bestSellers.map((prod) => (
              <div
                key={prod.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px',
                  borderRadius: 'var(--seller-radius)',
                  backgroundColor: 'var(--seller-cream-subtle)',
                  border: '1px solid var(--seller-border-light)',
                }}
              >
                <img
                  src={prod.images[0]}
                  alt={prod.name}
                  style={{
                    width: '46px',
                    height: '56px',
                    objectFit: 'cover',
                    borderRadius: '4px',
                    border: '1px solid var(--seller-border)',
                  }}
                />

                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <h4
                    style={{
                      margin: '0 0 2px',
                      fontSize: '13px',
                      color: 'var(--seller-espresso)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {prod.name}
                  </h4>
                  <small style={{ color: 'var(--seller-muted)', fontSize: '11px' }}>
                    {prod.category} • {prod.sales_count} units sold
                  </small>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <strong style={{ fontSize: '13px', color: 'var(--seller-espresso)' }}>
                    ₹{prod.discount_price || prod.regular_price}
                  </strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* LOWER ROW: LOW STOCK ALERTS & RECENT CUSTOMER REVIEWS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Low Stock Alerts */}
        <div className="seller-card">
          <div className="seller-card-title-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={18} color="var(--seller-warning)" />
              <h3 style={{ margin: 0 }}>Low Stock Alert Center</h3>
            </div>
            <Link
              to="/seller/inventory"
              style={{ fontSize: '12px', fontWeight: 700, color: 'var(--seller-gold-dark)', textDecoration: 'none' }}
            >
              Open Inventory
            </Link>
          </div>

          {lowStockItems.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--seller-muted)', margin: '12px 0' }}>
              All garments are currently well-stocked.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {lowStockItems.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: 'var(--seller-radius)',
                    background: item.stock_quantity === 0 ? 'var(--seller-danger-bg)' : 'var(--seller-warning-bg)',
                    border: `1px solid ${item.stock_quantity === 0 ? 'rgba(156,56,56,0.2)' : 'rgba(179,116,36,0.2)'}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img
                      src={item.images[0]}
                      alt={item.name}
                      style={{ width: '38px', height: '46px', objectFit: 'cover', borderRadius: '4px' }}
                    />
                    <div>
                      <strong style={{ fontSize: '13px', color: 'var(--seller-espresso)', display: 'block' }}>
                        {item.name}
                      </strong>
                      <small style={{ fontSize: '11px', color: 'var(--seller-muted)' }}>
                        SKU: {item.sku}
                      </small>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: 800,
                        color: item.stock_quantity === 0 ? 'var(--seller-danger)' : 'var(--seller-warning)',
                        display: 'block',
                      }}
                    >
                      {item.stock_quantity === 0 ? 'OUT OF STOCK' : `${item.stock_quantity} left`}
                    </span>
                    <Link
                      to="/seller/inventory"
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: 'var(--seller-espresso)',
                        textDecoration: 'underline',
                      }}
                    >
                      Restock
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Customer Reviews */}
        <div className="seller-card">
          <div className="seller-card-title-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Star size={18} color="var(--seller-gold)" fill="var(--seller-gold)" />
              <h3 style={{ margin: 0 }}>Client Testimonials & Reviews</h3>
            </div>
            <Link
              to="/seller/reviews"
              style={{ fontSize: '12px', fontWeight: 700, color: 'var(--seller-gold-dark)', textDecoration: 'none' }}
            >
              All Reviews
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {recentReviews.map((rev) => (
              <div
                key={rev.id}
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--seller-radius)',
                  backgroundColor: 'var(--seller-cream-subtle)',
                  border: '1px solid var(--seller-border-light)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <strong style={{ fontSize: '13px', color: 'var(--seller-espresso)' }}>
                    {rev.customer_name}
                  </strong>
                  <div style={{ display: 'flex', gap: '2px' }}>
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={12}
                        color="var(--seller-gold)"
                        fill={i < rev.rating ? 'var(--seller-gold)' : 'none'}
                      />
                    ))}
                  </div>
                </div>

                <p style={{ margin: '0 0 6px', fontSize: '12.5px', color: 'var(--seller-dark-text)', lineHeight: 1.4 }}>
                  "{rev.comment}"
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <small style={{ fontSize: '11px', color: 'var(--seller-muted)' }}>
                    Item: {rev.product_name}
                  </small>
                  {rev.reply ? (
                    <small style={{ color: 'var(--seller-success)', fontWeight: 600, fontSize: '11px' }}>
                      ✓ Replied
                    </small>
                  ) : (
                    <Link
                      to="/seller/reviews"
                      style={{ fontSize: '11px', fontWeight: 700, color: 'var(--seller-gold-dark)', textDecoration: 'none' }}
                    >
                      Reply to Client
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SellerLayout>
  );
}

