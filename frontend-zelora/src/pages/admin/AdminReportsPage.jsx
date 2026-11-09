import { useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAdmin } from '../../context/AdminContext';
import { BarChart3, Download, Calendar, DollarSign, TrendingUp, Users, ShoppingBag } from 'lucide-react';

export default function AdminReportsPage() {
  const { dashboardMetrics } = useAdmin();
  const [timeframe, setTimeframe] = useState('month');

  const handleExportCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Metric,Value,Period\n" +
      `Gross Merchandise Value,₹${dashboardMetrics.total_sales},${timeframe}\n` +
      `Platform Net Commission,₹${dashboardMetrics.platform_net_revenue},${timeframe}\n` +
      `Total Completed Orders,${dashboardMetrics.total_orders},${timeframe}\n` +
      `Active Customer Accounts,${dashboardMetrics.total_customers},${timeframe}\n` +
      `Active Seller Boutiques,${dashboardMetrics.total_shops},${timeframe}\n` +
      `Average Order Value,₹${dashboardMetrics.average_order_value},${timeframe}\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `zelora_executive_report_${timeframe}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AdminLayout
      title="Financial & Executive Reporting"
      subtitle="Audit platform sales velocity, export regulatory revenue statements, and monitor marketplace KPI trends."
      actionButton={
        <button
          type="button"
          className="btn-admin-gold"
          onClick={handleExportCSV}
        >
          <Download size={14} />
          <span>Export CSV Statement</span>
        </button>
      }
    >
      {/* Timeframe Switcher */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {[
          { id: 'week', label: 'Past 7 Days' },
          { id: 'month', label: 'Current Month (Nov 2026)' },
          { id: 'quarter', label: 'Q4 2026' },
          { id: 'year', label: 'Full Year 2026' },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            className={timeframe === t.id ? 'btn-admin-gold' : 'btn-admin-secondary'}
            onClick={() => setTimeframe(t.id)}
            style={{ padding: '8px 16px', fontSize: '13px' }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* KPI Cards Strip */}
      <div className="admin-metrics-grid">
        <div className="admin-kpi-card">
          <div className="kpi-top-row">
            <span className="kpi-label">Reported GMV</span>
            <div className="kpi-icon-wrap">
              <DollarSign size={18} />
            </div>
          </div>
          <div className="kpi-value">₹{dashboardMetrics.total_sales.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
          <div className="kpi-subtext">Verified Gross Sales</div>
        </div>

        <div className="admin-kpi-card">
          <div className="kpi-top-row">
            <span className="kpi-label">Platform Net Commission</span>
            <div className="kpi-icon-wrap">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="kpi-value">₹{dashboardMetrics.platform_net_revenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
          <div className="kpi-subtext">Direct Platform Earnings</div>
        </div>

        <div className="admin-kpi-card">
          <div className="kpi-top-row">
            <span className="kpi-label">Fulfillment Volume</span>
            <div className="kpi-icon-wrap">
              <ShoppingBag size={18} />
            </div>
          </div>
          <div className="kpi-value">{dashboardMetrics.total_orders} Orders</div>
          <div className="kpi-subtext">99.4% Fulfillment Rate</div>
        </div>

        <div className="admin-kpi-card">
          <div className="kpi-top-row">
            <span className="kpi-label">Customer Acquisition</span>
            <div className="kpi-icon-wrap">
              <Users size={18} />
            </div>
          </div>
          <div className="kpi-value">{dashboardMetrics.total_customers} Buyers</div>
          <div className="kpi-subtext">+18% repeat order rate</div>
        </div>
      </div>

      {/* Breakdown Table */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">Boutique Category Performance Matrix</h2>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Department Category</th>
                <th>Units Sold</th>
                <th>Gross Revenue</th>
                <th>Platform Commission (12.5%)</th>
                <th>Growth Rate</th>
              </tr>
            </thead>
            <tbody>
              {[
                { cat: 'Outerwear & Tailored Overcoats', units: 148, gross: 51652.00, net: 6456.50, growth: '+32%' },
                { cat: 'Dresses & Evening Gowns', units: 122, gross: 36478.00, net: 4559.75, growth: '+28%' },
                { cat: 'Tops, Blouses & Poplin Shirts', units: 98, gross: 25480.00, net: 3185.00, growth: '+19%' },
                { cat: 'Tailored Wool Trousers', units: 84, gross: 20160.00, net: 2520.00, growth: '+22%' },
                { cat: 'Accessories & Leather Goods', units: 60, gross: 14480.00, net: 1810.00, growth: '+15%' },
              ].map((row, idx) => (
                <tr key={idx}>
                  <td>
                    <strong style={{ color: '#F6F6F9' }}>{row.cat}</strong>
                  </td>
                  <td>{row.units} garments</td>
                  <td>
                    <strong style={{ color: '#C6A664' }}>₹{row.gross.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                  </td>
                  <td>
                    <span style={{ color: '#30A46C', fontWeight: 600 }}>₹{row.net.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </td>
                  <td>
                    <span style={{ color: '#30A46C', fontWeight: 700 }}>{row.growth}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

