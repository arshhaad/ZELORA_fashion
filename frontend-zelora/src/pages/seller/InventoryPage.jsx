import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import SellerLayout from '../../components/seller/SellerLayout';
import { useSeller } from '../../context/SellerContext';
import {
  Boxes,
  Search,
  AlertTriangle,
  CheckCircle,
  Plus,
  Minus,
  Edit2,
  Filter,
} from 'lucide-react';

export default function InventoryPage() {
  const { products, updateInventoryStock } = useSeller();

  const [searchTerm, setSearchTerm] = useState('');
  const [stockLevelFilter, setStockLevelFilter] = useState('All'); // 'All', 'Low Stock', 'Out of Stock', 'In Stock'
  const [selectedProductForModal, setSelectedProductForModal] = useState(null);

  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const matchesSearch =
        searchTerm === '' ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase());

      let matchesFilter = true;
      if (stockLevelFilter === 'Low Stock') {
        matchesFilter = item.stock_quantity > 0 && item.stock_quantity <= 5;
      } else if (stockLevelFilter === 'Out of Stock') {
        matchesFilter = item.stock_quantity === 0;
      } else if (stockLevelFilter === 'In Stock') {
        matchesFilter = item.stock_quantity > 5;
      }

      return matchesSearch && matchesFilter;
    });
  }, [products, searchTerm, stockLevelFilter]);

  const handleStockIncrement = (productId, size, currentQty) => {
    updateInventoryStock(productId, size, currentQty + 1);
  };

  const handleStockDecrement = (productId, size, currentQty) => {
    if (currentQty > 0) {
      updateInventoryStock(productId, size, currentQty - 1);
    }
  };

  return (
    <SellerLayout>
      <div className="seller-page-header">
        <div className="seller-page-title-group">
          <h1>Atelier Stock & Inventory Control</h1>
          <p className="seller-page-subtitle">
            Monitor real-time size-level inventory, prevent stockouts, and manage garment replenishments.
          </p>
        </div>

        <Link to="/seller/products/add" className="btn-seller-gold">
          <Plus size={16} />
          <span>Upload Garment</span>
        </Link>
      </div>

      {/* Low Stock Alerts Banner */}
      {products.some((p) => p.stock_quantity <= 5) && (
        <div
          style={{
            background: 'var(--seller-warning-bg)',
            border: '1px solid rgba(179,116,36,0.3)',
            borderRadius: 'var(--seller-radius)',
            padding: '16px 20px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertTriangle size={20} color="var(--seller-warning)" />
            <span style={{ fontSize: '13px', color: 'var(--seller-dark-text)' }}>
              <strong>Urgent Attention:</strong>{' '}
              {products.filter((p) => p.stock_quantity <= 5).length} garment(s) have reached or fallen below the 5-unit inventory threshold.
            </span>
          </div>

          <button
            type="button"
            className="btn-seller-secondary btn-seller-sm"
            onClick={() => setStockLevelFilter('Low Stock')}
          >
            Show Low Stock Items
          </button>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="seller-card mb-24" style={{ padding: '16px 20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div className="seller-filter-search-box">
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--seller-muted)' }} />
            <input
              type="text"
              placeholder="Search by garment title or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="seller-input"
              style={{ paddingLeft: '38px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {['All', 'In Stock', 'Low Stock', 'Out of Stock'].map((lvl) => (
              <button
                key={lvl}
                type="button"
                style={{
                  border: '1px solid var(--seller-border)',
                  background: stockLevelFilter === lvl ? 'var(--seller-espresso)' : 'var(--seller-white)',
                  color: stockLevelFilter === lvl ? 'var(--seller-white)' : 'var(--seller-dark-text)',
                  padding: '7px 14px',
                  borderRadius: 'var(--seller-radius)',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'var(--seller-transition)',
                }}
                onClick={() => setStockLevelFilter(lvl)}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="seller-table-container">
        <table className="seller-table">
          <thead>
            <tr>
              <th style={{ width: '80px' }}>Garment</th>
              <th>Product Details & SKU</th>
              <th>Available Sizes & Stock Breakdown</th>
              <th style={{ textAlign: 'center' }}>Total Units</th>
              <th>Inventory Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((prod) => {
              const sizesList = Object.keys(prod.size_stock || {});

              return (
                <tr key={prod.id}>
                  <td>
                    <img
                      src={prod.images[0]}
                      alt={prod.name}
                      style={{
                        width: '48px',
                        height: '60px',
                        objectFit: 'cover',
                        borderRadius: 'var(--seller-radius-sm)',
                        border: '1px solid var(--seller-border)',
                      }}
                    />
                  </td>

                  <td>
                    <strong style={{ fontSize: '13.5px', color: 'var(--seller-espresso)', display: 'block' }}>
                      {prod.name}
                    </strong>
                    <span style={{ fontFamily: 'monospace', fontSize: '11px', color: 'var(--seller-muted)' }}>
                      SKU: {prod.sku}
                    </span>
                    <small style={{ display: 'block', color: 'var(--seller-gold-dark)', fontSize: '11px' }}>
                      {prod.category} • ₹{prod.discount_price || prod.regular_price}
                    </small>
                  </td>

                  {/* Size-wise stock with inline steppers */}
                  <td>
                    {sizesList.length === 0 ? (
                      <span style={{ fontSize: '12px', color: 'var(--seller-muted)' }}>Standard One-Size</span>
                    ) : (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {sizesList.map((sz) => {
                          const qty = prod.size_stock[sz];
                          return (
                            <div
                              key={sz}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                background: qty === 0 ? 'var(--seller-danger-bg)' : 'var(--seller-cream)',
                                border: `1px solid ${qty === 0 ? 'rgba(156,56,56,0.3)' : 'var(--seller-border)'}`,
                                padding: '3px 6px',
                                borderRadius: '4px',
                                fontSize: '11px',
                              }}
                            >
                              <strong style={{ color: 'var(--seller-espresso)' }}>{sz}:</strong>
                              <span style={{ fontWeight: 700, color: qty === 0 ? 'var(--seller-danger)' : 'var(--seller-espresso)', minWidth: '16px', textAlign: 'center' }}>
                                {qty}
                              </span>

                              {/* Steppers */}
                              <button
                                type="button"
                                style={{
                                  background: 'var(--seller-white)',
                                  border: '1px solid var(--seller-border)',
                                  width: '18px',
                                  height: '18px',
                                  borderRadius: '3px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  padding: 0,
                                }}
                                onClick={() => handleStockDecrement(prod.id, sz, qty)}
                                title="Decrease Stock"
                              >
                                <Minus size={10} />
                              </button>
                              <button
                                type="button"
                                style={{
                                  background: 'var(--seller-white)',
                                  border: '1px solid var(--seller-border)',
                                  width: '18px',
                                  height: '18px',
                                  borderRadius: '3px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  padding: 0,
                                }}
                                onClick={() => handleStockIncrement(prod.id, sz, qty)}
                                title="Increase Stock"
                              >
                                <Plus size={10} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </td>

                  {/* Total Units */}
                  <td style={{ textAlign: 'center' }}>
                    <strong style={{ fontSize: '16px', color: 'var(--seller-espresso)' }}>
                      {prod.stock_quantity}
                    </strong>
                  </td>

                  {/* Stock Status Badge */}
                  <td>
                    {prod.stock_quantity === 0 ? (
                      <span className="status-pill out-of-stock">Out of Stock</span>
                    ) : prod.stock_quantity <= 5 ? (
                      <span className="status-pill pending">Low Stock ({prod.stock_quantity})</span>
                    ) : (
                      <span className="status-pill published">In Stock</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td style={{ textAlign: 'right' }}>
                    <Link
                      to={`/seller/products/${prod.id}/edit`}
                      className="btn-seller-secondary btn-seller-sm"
                    >
                      <Edit2 size={13} /> Edit Piece
                    </Link>
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

