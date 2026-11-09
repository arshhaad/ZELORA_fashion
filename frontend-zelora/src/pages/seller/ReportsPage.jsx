import { useState } from 'react';
import SellerLayout from '../../components/seller/SellerLayout';
import { useSeller } from '../../context/SellerContext';
import {
  BarChart3,
  Download,
  Calendar,
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Award,
} from 'lucide-react';

export default function ReportsPage() {
  const { products, orders, totalSales, totalEarnings } = useSeller();

  const [timeframe, setTimeframe] = useState('monthly'); // 'daily', 'weekly', 'monthly', 'custom'
  const [customStart, setCustomStart] = useState('2026-10-01');
  const [customEnd, setCustomEnd] = useState('2026-11-06');

  const averageOrderValue = orders.length > 0 ? totalSales / orders.length : 0;

  // Monthly dataset for visual charts
  const monthlyData = [
    { month: 'Jun', gross: 12400, net: 10912, orders: 38 },
    { month: 'Jul', gross: 15600, net: 13728, orders: 46 },
    { month: 'Aug', gross: 18900, net: 16632, orders: 54 },
    { month: 'Sep', gross: 21200, net: 18656, orders: 62 },
    { month: 'Oct', gross: 26800, net: 23584, orders: 78 },
    { month: 'Nov', gross: 31400, net: 27632, orders: 92 },
  ];

  const maxVal = Math.max(...monthlyData.map((d) => d.gross));

  // CSV Export
  const handleDownloadCSV = () => {
    const headers = ['Order ID,Customer Name,Date,Amount,Status,Payment Method\n'];
    const rows = orders.map(
      (o) =>
        `"${o.order_id}","${o.customer_name}","${o.order_date}",${o.total_amount},"${o.order_status}","${o.payment_method}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + headers.concat(rows).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `zelora_atelier_sales_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <SellerLayout>
      <div className="seller-page-header">
        <div className="seller-page-title-group">
          <h1>Commercial Analytics & Reports</h1>
          <p className="seller-page-subtitle">
            Analyze gross sales volume, net atelier disbursements, order velocity, and piece popularity.
          </p>
        </div>

        <button
          type="button"
          className="btn-seller-gold"
          onClick={handleDownloadCSV}
        >
          <Download size={16} />
          <span>Export CSV Report</span>
        </button>
      </div>

      {/* TIMEFRAME FILTER BAR */}
      <div className="seller-card mb-24" style={{ padding: '16px 20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['daily', 'weekly', 'monthly', 'custom'].map((t) => (
              <button
                key={t}
                type="button"
                style={{
                  border: '1px solid var(--seller-border)',
                  background: timeframe === t ? 'var(--seller-espresso)' : 'var(--seller-white)',
                  color: timeframe === t ? 'var(--seller-white)' : 'var(--seller-dark-text)',
                  padding: '7px 16px',
                  borderRadius: 'var(--seller-radius)',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  textTransform: 'capitalize',
                  cursor: 'pointer',
                  transition: 'var(--seller-transition)',
                }}
                onClick={() => setTimeframe(t)}
              >
                {t}
              </button>
            ))}
          </div>

          {timeframe === 'custom' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="seller-input"
                style={{ width: 'auto' }}
              />
              <span style={{ color: 'var(--seller-muted)' }}>to</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="seller-input"
                style={{ width: 'auto' }}
              />
            </div>
          )}
        </div>
      </div>

      {/* METRICS ROW */}
      <div className="seller-stats-grid">
        <div className="seller-stat-card">
          <span className="stat-label">Total Commercial Sales</span>
          <h2 className="stat-value">₹{totalSales.toFixed(2)}</h2>
          <span className="stat-subtext">Gross shopper purchases</span>
        </div>

        <div className="seller-stat-card">
          <span className="stat-label">Net Atelier Earnings</span>
          <h2 className="stat-value" style={{ color: 'var(--seller-gold-dark)' }}>
            ₹{totalEarnings.toFixed(2)}
          </h2>
          <span className="stat-subtext">88% net boutique margin</span>
        </div>

        <div className="seller-stat-card">
          <span className="stat-label">Total Orders Processed</span>
          <h2 className="stat-value">{orders.length}</h2>
          <span className="stat-subtext">Across domestic & global fulfillment</span>
        </div>

        <div className="seller-stat-card">
          <span className="stat-label">Average Order Value (AOV)</span>
          <h2 className="stat-value">₹{averageOrderValue.toFixed(2)}</h2>
          <span className="stat-subtext">Per checked-out cart</span>
        </div>
      </div>

      {/* SALES TREND CHART */}
      <div className="seller-card mb-24" style={{ marginBottom: '28px' }}>
        <div className="seller-card-title-row">
          <div>
            <h3>6-Month Commercial Trend & Revenue Trajectory</h3>
            <p style={{ margin: '4px 0 0', fontSize: '12.5px', color: 'var(--seller-muted)' }}>
              Gross sales vs. net seller disbursements post platform commission.
            </p>
          </div>
        </div>

        <div style={{ height: '260px', width: '100%', marginTop: '20px' }}>
          <svg viewBox="0 0 700 260" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
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

            {/* Bars */}
            {monthlyData.map((d, idx) => {
              const colSpacing = 700 / monthlyData.length;
              const barWidth = 44;
              const x = idx * colSpacing + colSpacing / 2 - barWidth / 2;
              const grossH = (d.gross / maxVal) * 180;
              const grossY = 210 - grossH;

              const netH = (d.net / maxVal) * 180;
              const netY = 210 - netH;

              return (
                <g key={d.month}>
                  {/* Gross bar */}
                  <rect
                    x={x}
                    y={grossY}
                    width={barWidth / 2}
                    height={grossH}
                    fill="var(--seller-espresso)"
                    rx="3"
                  >
                    <title>{`${d.month}: Gross ₹${d.gross.toLocaleString()}`}</title>
                  </rect>

                  {/* Net bar */}
                  <rect
                    x={x + barWidth / 2 + 2}
                    y={netY}
                    width={barWidth / 2}
                    height={netH}
                    fill="var(--seller-gold)"
                    rx="3"
                  >
                    <title>{`${d.month}: Net ₹${d.net.toLocaleString()}`}</title>
                  </rect>

                  {/* Label */}
                  <text
                    x={x + barWidth / 2}
                    y={235}
                    textAnchor="middle"
                    fill="var(--seller-dark-text)"
                    fontSize="12"
                    fontWeight="700"
                  >
                    {d.month}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '16px', fontSize: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', background: 'var(--seller-espresso)', borderRadius: '2px' }} />
            <span style={{ fontWeight: 600 }}>Gross Sales</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', background: 'var(--seller-gold)', borderRadius: '2px' }} />
            <span style={{ fontWeight: 600 }}>Net Atelier Revenue (88%)</span>
          </div>
        </div>
      </div>

      {/* PRODUCT PERFORMANCE TABLE */}
      <div className="seller-table-container">
        <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--seller-border)' }}>
          <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--seller-espresso)' }}>
            Garment Commercial Velocity Breakdown
          </h3>
        </div>

        <table className="seller-table">
          <thead>
            <tr>
              <th>Garment</th>
              <th>Category</th>
              <th>Retail Price</th>
              <th>Total Units Sold</th>
              <th>Gross Revenue Generated</th>
              <th>Atelier Net Payout</th>
            </tr>
          </thead>
          <tbody>
            {products.map((prod) => {
              const unitsSold = prod.sales_count || 10;
              const gross = unitsSold * (prod.discount_price || prod.regular_price);
              const net = gross * 0.88;

              return (
                <tr key={prod.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img
                        src={prod.images[0]}
                        alt={prod.name}
                        style={{ width: '40px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                      />
                      <div>
                        <strong style={{ fontSize: '13.5px', color: 'var(--seller-espresso)' }}>
                          {prod.name}
                        </strong>
                        <small style={{ display: 'block', color: 'var(--seller-muted)', fontSize: '11px' }}>
                          SKU: {prod.sku}
                        </small>
                      </div>
                    </div>
                  </td>

                  <td>{prod.category}</td>

                  <td>
                    <strong>₹{prod.discount_price || prod.regular_price}</strong>
                  </td>

                  <td>
                    <span style={{ fontWeight: 700, color: 'var(--seller-espresso)' }}>
                      {unitsSold} units
                    </span>
                  </td>

                  <td>
                    <strong style={{ color: 'var(--seller-espresso)' }}>
                      ₹{gross.toFixed(2)}
                    </strong>
                  </td>

                  <td>
                    <strong style={{ color: 'var(--seller-gold-dark)' }}>
                      ₹{net.toFixed(2)}
                    </strong>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </SellerLayout>
  );
}

