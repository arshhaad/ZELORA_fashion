import { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import SellerLayout from '../../components/seller/SellerLayout';
import { useSeller } from '../../context/SellerContext';
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Power,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  AlertTriangle,
} from 'lucide-react';

export default function MyProductsPage() {
  const [searchParams] = useSearchParams();
  const urlSearch = searchParams.get('search') || '';

  const { products, deleteProduct, toggleProductStatus } = useSeller();

  const [searchTerm, setSearchTerm] = useState(urlSearch);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [stockFilter, setStockFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const matchesSearch =
        searchTerm === '' ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.tags && item.tags.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory =
        categoryFilter === 'All' || item.category === categoryFilter;

      const matchesStatus =
        statusFilter === 'All' || item.status === statusFilter;

      let matchesStock = true;
      if (stockFilter === 'In Stock') {
        matchesStock = item.stock_quantity > 5;
      } else if (stockFilter === 'Low Stock') {
        matchesStock = item.stock_quantity > 0 && item.stock_quantity <= 5;
      } else if (stockFilter === 'Out of Stock') {
        matchesStock = item.stock_quantity === 0;
      }

      return matchesSearch && matchesCategory && matchesStatus && matchesStock;
    });
  }, [products, searchTerm, categoryFilter, statusFilter, stockFilter]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredProducts.length / pageSize) || 1;
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const categoriesList = ['All', 'Dresses', 'Men', 'Women', 'Shirts', 'T-Shirts', 'Jeans', 'Shoes', 'Accessories'];

  return (
    <SellerLayout>
      <div className="seller-page-header">
        <div className="seller-page-title-group">
          <h1>Atelier Garment Catalog</h1>
          <p className="seller-page-subtitle">
            Manage your boutique clothing collections, pricing, sizes, and activation status.
          </p>
        </div>

        <div className="seller-page-actions">
          <Link to="/seller/inventory" className="btn-seller-secondary">
            <span>Manage Inventory</span>
          </Link>
          <Link to="/seller/products/add" className="btn-seller-gold">
            <Plus size={16} />
            <span>Add New Garment</span>
          </Link>
        </div>
      </div>

      {/* FILTER & SEARCH TOOLBAR CARD */}
      <div className="seller-card mb-24" style={{ padding: '16px 20px', marginBottom: '24px' }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
          }}
        >
          {/* Search Input */}
          <div style={{ position: 'relative', minWidth: '260px', flex: 1 }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--seller-muted)',
              }}
            />
            <input
              type="text"
              placeholder="Search by garment name, SKU, tag..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="seller-input"
              style={{ paddingLeft: '38px' }}
            />
          </div>

          {/* Filters Row */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Category Dropdown */}
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="seller-select"
              style={{ width: 'auto', minWidth: '140px' }}
            >
              {categoriesList.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'All' ? 'All Categories' : cat}
                </option>
              ))}
            </select>

            {/* Stock Level Filter */}
            <select
              value={stockFilter}
              onChange={(e) => {
                setStockFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="seller-select"
              style={{ width: 'auto', minWidth: '130px' }}
            >
              <option value="All">All Stock Levels</option>
              <option value="In Stock">In Stock (&gt;5)</option>
              <option value="Low Stock">Low Stock (≤5)</option>
              <option value="Out of Stock">Out of Stock (0)</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="seller-select"
              style={{ width: 'auto', minWidth: '120px' }}
            >
              <option value="All">All Statuses</option>
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>

            {/* View Mode Toggle */}
            <div style={{ display: 'flex', border: '1px solid var(--seller-border)', borderRadius: 'var(--seller-radius)', overflow: 'hidden' }}>
              <button
                type="button"
                style={{
                  background: viewMode === 'table' ? 'var(--seller-espresso)' : 'var(--seller-white)',
                  color: viewMode === 'table' ? 'var(--seller-white)' : 'var(--seller-muted)',
                  border: 'none',
                  padding: '8px 12px',
                  cursor: 'pointer',
                  display: 'flex',
                }}
                onClick={() => setViewMode('table')}
                title="Table View"
              >
                <List size={16} />
              </button>
              <button
                type="button"
                style={{
                  background: viewMode === 'grid' ? 'var(--seller-espresso)' : 'var(--seller-white)',
                  color: viewMode === 'grid' ? 'var(--seller-white)' : 'var(--seller-muted)',
                  border: 'none',
                  padding: '8px 12px',
                  cursor: 'pointer',
                  display: 'flex',
                }}
                onClick={() => setViewMode('grid')}
                title="Grid Cards View"
              >
                <LayoutGrid size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* PRODUCTS DISPLAY (TABLE / GRID) */}
      {filteredProducts.length === 0 ? (
        <div className="seller-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <AlertTriangle size={36} color="var(--seller-gold)" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ color: 'var(--seller-espresso)', margin: '0 0 6px' }}>No garments matched</h3>
          <p style={{ color: 'var(--seller-muted)', fontSize: '13px', margin: '0 0 20px' }}>
            Try resetting your filters or add a new piece to your boutique catalog.
          </p>
          <Link to="/seller/products/add" className="btn-seller-gold">
            <Plus size={16} /> Add Garment
          </Link>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="seller-table-container">
          <table className="seller-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>Photo</th>
                <th>Product Name & SKU</th>
                <th>Category</th>
                <th>Price (₹)</th>
                <th>Units In Stock</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.map((prod) => (
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
                    <div style={{ display: 'flex', gap: '8px', marginTop: '3px' }}>
                      <span style={{ fontFamily: 'monospace', fontSize: '11px', color: 'var(--seller-muted)' }}>
                        SKU: {prod.sku}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--seller-gold-dark)', fontWeight: 600 }}>
                        {prod.gender}
                      </span>
                    </div>
                  </td>

                  <td>
                    <span style={{ fontSize: '13px', color: 'var(--seller-dark-text)' }}>
                      {prod.category}
                    </span>
                  </td>

                  <td>
                    {prod.discount_price ? (
                      <div>
                        <strong style={{ color: 'var(--seller-espresso)', fontSize: '14px' }}>
                          ₹{prod.discount_price}
                        </strong>
                        <small
                          style={{
                            display: 'block',
                            color: 'var(--seller-muted)',
                            textDecoration: 'line-through',
                            fontSize: '11px',
                          }}
                        >
                          ₹{prod.regular_price}
                        </small>
                      </div>
                    ) : (
                      <strong style={{ color: 'var(--seller-espresso)', fontSize: '14px' }}>
                        ₹{prod.regular_price}
                      </strong>
                    )}
                  </td>

                  <td>
                    <span
                      style={{
                        fontWeight: 700,
                        color:
                          prod.stock_quantity === 0
                            ? 'var(--seller-danger)'
                            : prod.stock_quantity <= 5
                            ? 'var(--seller-warning)'
                            : 'var(--seller-espresso)',
                      }}
                    >
                      {prod.stock_quantity} units
                    </span>
                    {prod.sizes && prod.sizes.length > 0 && (
                      <small style={{ display: 'block', fontSize: '11px', color: 'var(--seller-muted)' }}>
                        Sizes: {prod.sizes.join(', ')}
                      </small>
                    )}
                  </td>

                  <td>
                    <span className={`status-pill ${prod.status.toLowerCase().replace(/\s+/g, '-')}`}>
                      {prod.status}
                    </span>
                  </td>

                  <td>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                      <button
                        type="button"
                        className="btn-seller-secondary btn-seller-sm"
                        onClick={() => toggleProductStatus(prod.id)}
                        title={prod.status === 'Published' ? 'Deactivate (Draft)' : 'Activate (Publish)'}
                      >
                        <Power size={13} color={prod.status === 'Published' ? 'var(--seller-success)' : 'var(--seller-muted)'} />
                      </button>

                      <Link
                        to={`/seller/products/${prod.id}/edit`}
                        className="btn-seller-secondary btn-seller-sm"
                        title="Edit Garment"
                      >
                        <Edit2 size={13} />
                      </Link>

                      <button
                        type="button"
                        className="btn-seller-danger btn-seller-sm"
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to delete "${prod.name}"?`)) {
                            deleteProduct(prod.id);
                          }
                        }}
                        title="Delete Garment"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* GRID VIEW */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
          {paginatedProducts.map((prod) => (
            <div key={prod.id} className="seller-card" style={{ padding: '16px' }}>
              <div style={{ position: 'relative', width: '100%', height: '260px', borderRadius: 'var(--seller-radius)', overflow: 'hidden', marginBottom: '14px' }}>
                <img
                  src={prod.images[0]}
                  alt={prod.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <span
                  className={`status-pill ${prod.status.toLowerCase().replace(/\s+/g, '-')}`}
                  style={{ position: 'absolute', top: '10px', right: '10px', boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}
                >
                  {prod.status}
                </span>
              </div>

              <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--seller-gold-dark)', fontWeight: 700 }}>
                {prod.category}
              </span>
              <h4 style={{ margin: '4px 0 6px', fontSize: '14px', color: 'var(--seller-espresso)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {prod.name}
              </h4>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '12px' }}>
                <strong style={{ fontSize: '16px', color: 'var(--seller-espresso)' }}>
                  ₹{prod.discount_price || prod.regular_price}
                </strong>
                <span style={{ fontSize: '12px', color: prod.stock_quantity <= 5 ? 'var(--seller-warning)' : 'var(--seller-muted)', fontWeight: 600 }}>
                  {prod.stock_quantity} in stock
                </span>
              </div>

              <div style={{ display: 'flex', gap: '6px', borderTop: '1px solid var(--seller-border)', paddingTop: '12px' }}>
                <Link
                  to={`/seller/products/${prod.id}/edit`}
                  className="btn-seller-secondary btn-seller-sm"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  <Edit2 size={13} /> Edit
                </Link>
                <button
                  type="button"
                  className="btn-seller-secondary btn-seller-sm"
                  onClick={() => toggleProductStatus(prod.id)}
                  title="Toggle Live Status"
                >
                  <Power size={13} color={prod.status === 'Published' ? 'var(--seller-success)' : 'var(--seller-muted)'} />
                </button>
                <button
                  type="button"
                  className="btn-seller-danger btn-seller-sm"
                  onClick={() => {
                    if (window.confirm(`Delete "${prod.name}"?`)) deleteProduct(prod.id);
                  }}
                  title="Delete"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PAGINATION BAR */}
      {totalPages > 1 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '24px',
            padding: '16px 20px',
            background: 'var(--seller-white)',
            borderRadius: 'var(--seller-radius)',
            border: '1px solid var(--seller-border)',
          }}
        >
          <span style={{ fontSize: '13px', color: 'var(--seller-muted)' }}>
            Showing {(currentPage - 1) * pageSize + 1} -{' '}
            {Math.min(currentPage * pageSize, filteredProducts.length)} of{' '}
            {filteredProducts.length} garments
          </span>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              className="btn-seller-secondary btn-seller-sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft size={14} /> Previous
            </button>

            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                type="button"
                className="btn-seller-secondary btn-seller-sm"
                style={{
                  background: currentPage === i + 1 ? 'var(--seller-espresso)' : 'var(--seller-white)',
                  color: currentPage === i + 1 ? 'var(--seller-white)' : 'var(--seller-espresso)',
                  fontWeight: 700,
                  minWidth: '32px',
                }}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}

            <button
              type="button"
              className="btn-seller-secondary btn-seller-sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </SellerLayout>
  );
}

