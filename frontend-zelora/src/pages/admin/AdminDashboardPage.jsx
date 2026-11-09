import { useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAdmin } from '../../context/AdminContext';
import {
  DollarSign,
  Users,
  Store,
  ShoppingBag,
  TrendingUp,
  ArrowUpRight,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  ChevronRight,
  Clock,
  Sparkles,
  RefreshCw
} from 'lucide-react';

export default function AdminDashboardPage() {
  const {
    dashboardMetrics,
    shops,
    ordersList,
    approveShop,
    rejectShop,
    loadDashboardData
  } = useAdmin();

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const pendingShops = shops.filter((s) => s.status === 'pending');

  return (
    <AdminLayout
      title="Platform Executive Dashboard"
      subtitle="Comprehensive multi-vendor metrics, operational governance, and sales velocity."
      actionButton={
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className="btn-admin-secondary"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
            <span>{refreshing ? 'Syncing...' : 'Sync Live Data'}</span>
          </button>
          <Link to="/admin/shops/approvals" className="btn-admin-gold">
            <CheckCircle size={14} />
            <span>Shop Approvals ({dashboardMetrics.pending_shop_approvals || pendingShops.length})</span>
          </Link>
        </div>
      }
    >
      {/* 1. Core 4 KPI Cards */}
      <div className="admin-metrics-grid">
        {/* KPI 1: Total Sales */}
        <div className="admin-kpi-card">
          <div className="kpi-top-row">
            <span className="kpi-label">Gross Merchandise Value (GMV)</span>
            <div className="kpi-icon-wrap">
              <DollarSign size={18} />
            </div>
          </div>
          <div className="kpi-value">
            ₹{dashboardMetrics.total_sales.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="kpi-subtext">
            <TrendingUp size={13} />
            <span>+24.8% vs last month</span>
          </div>
        </div>

        {/* KPI 2: Total Users */}
        <div className="admin-kpi-card">
          <div className="kpi-top-row">
            <span className="kpi-label">Total Platform Users</span>
            <div className="kpi-icon-wrap">
              <Users size={18} />
            </div>
          </div>
          <div className="kpi-value">{dashboardMetrics.total_users}</div>
          <div className="kpi-subtext" style={{ color: '#9E9EA8' }}>
            <span>{dashboardMetrics.total_customers} Customers • {dashboardMetrics.total_sellers} Vendors</span>
          </div>
        </div>

        {/* KPI 3: Total Shops */}
        <div className="admin-kpi-card">
          <div className="kpi-top-row">
            <span className="kpi-label">Registered Boutiques</span>
            <div className="kpi-icon-wrap">
              <Store size={18} />
            </div>
          </div>
          <div className="kpi-value">{dashboardMetrics.total_shops}</div>
          <div className="kpi-subtext" style={{ color: dashboardMetrics.pending_shop_approvals > 0 ? '#F5A623' : '#30A46C' }}>
            <span>{dashboardMetrics.pending_shop_approvals} Applications Pending</span>
          </div>
        </div>

        {/* KPI 4: Total Orders */}
        <div className="admin-kpi-card">
          <div className="kpi-top-row">
            <span className="kpi-label">Platform Orders</span>
            <div className="kpi-icon-wrap">
              <ShoppingBag size={18} />
            </div>
          </div>
          <div className="kpi-value">{dashboardMetrics.total_orders}</div>
          <div className="kpi-subtext">
            <TrendingUp size={13} />
            <span>Avg Order: ₹{dashboardMetrics.average_order_value}</span>
          </div>
        </div>
      </div>

      {/* 2. Secondary Revenue & Commission Strip */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '16px',
        marginBottom: '28px'
      }}>
        <div style={{
          backgroundColor: '#16161D',
          border: '1px solid #23232C',
          borderRadius: '8px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <span style={{ fontSize: '11px', color: '#9E9EA8', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 700 }}>
              Platform Net Commission (12.5% Avg)
            </span>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#C6A664', marginTop: '4px' }}>
              ₹{dashboardMetrics.platform_net_revenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <Sparkles size={24} color="#C6A664" />
        </div>

        <div style={{
          backgroundColor: '#16161D',
          border: '1px solid #23232C',
          borderRadius: '8px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <span style={{ fontSize: '11px', color: '#9E9EA8', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 700 }}>
              Pending Seller Payouts
            </span>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#F6F6F9', marginTop: '4px' }}>
              {dashboardMetrics.pending_payouts} Requests (₹7,140.00)
            </div>
          </div>
          <Link to="/admin/payouts" style={{ fontSize: '12px', color: '#C6A664', textDecoration: 'none' }}>
            Review Payouts →
          </Link>
        </div>

        <div style={{
          backgroundColor: '#16161D',
          border: '1px solid #23232C',
          borderRadius: '8px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <span style={{ fontSize: '11px', color: '#9E9EA8', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 700 }}>
              Open Concierge Tickets
            </span>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#F6F6F9', marginTop: '4px' }}>
              {dashboardMetrics.open_tickets} Active Inquiries
            </div>
          </div>
          <Link to="/admin/support" style={{ fontSize: '12px', color: '#C6A664', textDecoration: 'none' }}>
            Open Desk →
          </Link>
        </div>
      </div>

      {/* 3. Interactive Platform Sales & GMV Trend Graph */}
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h2 className="admin-card-title">Platform GMV & Net Commission Trajectory</h2>
            <p style={{ fontSize: '12px', color: '#9E9EA8', margin: '2px 0 0' }}>
              Monthly Gross Merchandise Volume compared with platform net commission intake
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span style={{ fontSize: '11px', padding: '4px 10px', background: '#0B0B0E', border: '1px solid #23232C', borderRadius: '4px', color: '#F6F6F9', fontWeight: 600 }}>
              2026 Fiscal Year
            </span>
          </div>
        </div>

        {/* SVG Dual Bar Visualizer */}
        <div style={{ width: '100%', height: '220px', position: 'relative' }}>
          <svg viewBox="0 0 700 200" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
            {/* Grid lines */}
            <line x1="0" y1="30" x2="700" y2="30" stroke="#23232C" strokeDasharray="3 3" />
            <line x1="0" y1="80" x2="700" y2="80" stroke="#23232C" strokeDasharray="3 3" />
            <line x1="0" y1="130" x2="700" y2="130" stroke="#23232C" strokeDasharray="3 3" />
            <line x1="0" y1="180" x2="700" y2="180" stroke="#23232C" />

            {/* Months */}
            {[
              { m: 'Oct', gmv: 84, net: 22 },
              { m: 'Nov', gmv: 110, net: 30 },
              { m: 'Dec', gmv: 145, net: 42 },
              { m: 'Jan', gmv: 125, net: 35 },
              { m: 'Feb', gmv: 160, net: 48 },
              { m: 'Mar', gmv: 175, net: 55 },
            ].map((d, idx) => {
              const x = 50 + idx * 110;
              const gmvHeight = (d.gmv / 180) * 140;
              const netHeight = (d.net / 60) * 110;

              return (
                <g key={d.m}>
                  {/* GMV Bar */}
                  <rect
                    x={x}
                    y={180 - gmvHeight}
                    width="26"
                    height={gmvHeight}
                    fill="#C6A664"
                    rx="4"
                    opacity="0.9"
                  />
                  {/* Net Commission Bar */}
                  <rect
                    x={x + 30}
                    y={180 - netHeight}
                    width="26"
                    height={netHeight}
                    fill="#30A46C"
                    rx="4"
                    opacity="0.85"
                  />
                  {/* Month Label */}
                  <text
                    x={x + 28}
                    y="198"
                    fill="#9E9EA8"
                    fontSize="11"
                    textAnchor="middle"
                    fontWeight="600"
                  >
                    {d.m}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', marginTop: '14px', fontSize: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', backgroundColor: '#C6A664', borderRadius: '3px' }} />
            <span style={{ color: '#F6F6F9', fontWeight: 600 }}>Total GMV (₹)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', backgroundColor: '#30A46C', borderRadius: '3px' }} />
            <span style={{ color: '#F6F6F9', fontWeight: 600 }}>Net Commission Intake (₹)</span>
          </div>
        </div>
      </div>

      {/* 4. Two Columns: Pending Shop Approvals & Recent Platform Orders */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Left Column: Pending Shop Approvals */}
        <div className="admin-card">
          <div className="admin-card-header">
            <div>
              <h3 className="admin-card-title">Shop Applications Pending Review</h3>
              <p style={{ fontSize: '12px', color: '#9E9EA8', margin: '2px 0 0' }}>
                New merchant verification queue
              </p>
            </div>
            <Link to="/admin/shops/approvals" style={{ fontSize: '12px', color: '#C6A664', textDecoration: 'none' }}>
              View All ({pendingShops.length}) →
            </Link>
          </div>

          {pendingShops.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: '#9E9EA8', fontSize: '13px' }}>
              <CheckCircle size={24} color="#30A46C" style={{ margin: '0 auto 8px' }} />
              <div>All boutique seller applications have been resolved!</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {pendingShops.map((shop) => (
                <div
                  key={shop.id}
                  style={{
                    backgroundColor: '#0B0B0E',
                    border: '1px solid #23232C',
                    borderRadius: '8px',
                    padding: '14px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img
                      src={shop.logo}
                      alt={shop.name}
                      style={{ width: '38px', height: '38px', borderRadius: '6px', objectFit: 'cover', border: '1px solid #23232C' }}
                    />
                    <div>
                      <strong style={{ display: 'block', fontSize: '13px', color: '#F6F6F9' }}>{shop.name}</strong>
                      <span style={{ fontSize: '11px', color: '#9E9EA8' }}>{shop.category} • {shop.owner_email}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      className="btn-admin-success"
                      onClick={() => approveShop(shop.id)}
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      className="btn-admin-danger"
                      onClick={() => rejectShop(shop.id, 'Documentation requirements incomplete')}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Recent Orders Stream */}
        <div className="admin-card">
          <div className="admin-card-header">
            <div>
              <h3 className="admin-card-title">Recent Platform Orders</h3>
              <p style={{ fontSize: '12px', color: '#9E9EA8', margin: '2px 0 0' }}>
                Latest transactions across all shops
              </p>
            </div>
            <Link to="/admin/orders" style={{ fontSize: '12px', color: '#C6A664', textDecoration: 'none' }}>
              View Orders →
            </Link>
          </div>

          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {(ordersList.length > 0 ? ordersList.slice(0, 5) : [
                  { id: 'ZEL-89421', customer_name: 'Genevieve L.', amount: 349.00, order_status: 'Delivered' },
                  { id: 'ZEL-78103', customer_name: 'Julian S.', amount: 480.00, order_status: 'Shipped' },
                  { id: 'ZEL-65294', customer_name: 'Camilla H.', amount: 260.00, order_status: 'Confirmed' },
                  { id: 'ZEL-51902', customer_name: 'Vikram M.', amount: 520.00, order_status: 'Processing' },
                ]).map((order, idx) => (
                  <tr key={idx}>
                    <td>
                      <strong style={{ color: '#C6A664' }}>{order.id}</strong>
                    </td>
                    <td>{order.customer_name || 'Customer'}</td>
                    <td>₹{Number(order.amount).toFixed(2)}</td>
                    <td>
                      <span className={`status-pill ${order.order_status?.toLowerCase().replace(/\s+/g, '_')}`}>
                        {order.order_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

