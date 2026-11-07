import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import ProductCard from '../components/common/ProductCard';
import Toast from '../components/common/Toast';
import { PRODUCTS, CATEGORIES } from '../data/products';
import {
  Filter,
  X,
  SlidersHorizontal,
  ChevronDown,
  RotateCcw,
  Search,
  Check,
  Star,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function ProductListingPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL query params
  const categoryParam = searchParams.get('category') || 'all';
  const genderParam = searchParams.get('gender') || 'all';
  const sortParam = searchParams.get('sort') || 'newest';
  const searchParam = searchParams.get('search') || '';
  const filterParam = searchParams.get('filter') || '';

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [selectedGender, setSelectedGender] = useState(genderParam);
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedSize, setSelectedSize] = useState('all');
  const [selectedRating, setSelectedRating] = useState(0);
  const [maxPrice, setMaxPrice] = useState(500);
  const [sortBy, setSortBy] = useState(sortParam);
  const [searchQuery, setSearchQuery] = useState(searchParam);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);

  // Sync state when URL params change
  useEffect(() => {
    setSelectedCategory(searchParams.get('category') || 'all');
    setSelectedGender(searchParams.get('gender') || 'all');
    setSortBy(searchParams.get('sort') || 'newest');
    setSearchQuery(searchParams.get('search') || '');
  }, [searchParams]);

  const brands = useMemo(() => {
    const set = new Set(PRODUCTS.map((p) => p.brand));
    return ['all', ...Array.from(set)];
  }, []);

  const sizes = ['all', 'XS', 'S', 'M', 'L', 'XL', 'XXL'];

  // Filtering & Sorting logic
  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((product) => {
      // Category filter
      if (selectedCategory !== 'all' && product.category !== selectedCategory) {
        return false;
      }

      // Gender filter
      if (selectedGender !== 'all' && product.gender !== selectedGender && product.gender !== 'unisex') {
        return false;
      }

      // Brand filter
      if (selectedBrand !== 'all' && product.brand !== selectedBrand) {
        return false;
      }

      // Size filter
      if (selectedSize !== 'all' && (!product.sizes || !product.sizes.includes(selectedSize))) {
        return false;
      }

      // Price filter
      if (product.price > maxPrice) {
        return false;
      }

      // Rating filter
      if (selectedRating > 0 && product.rating < selectedRating) {
        return false;
      }

      // Predefined special filter
      if (filterParam === 'new' && !product.isNew) return false;
      if (filterParam === 'trending' && !product.isTrending) return false;
      if (filterParam === 'offers' && !product.isSpecialOffer) return false;

      // Text Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = product.name.toLowerCase().includes(query);
        const matchesDesc = product.description.toLowerCase().includes(query);
        const matchesBrand = product.brand.toLowerCase().includes(query);
        const matchesCat = product.category.toLowerCase().includes(query);
        if (!matchesName && !matchesDesc && !matchesBrand && !matchesCat) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-low-high') return a.price - b.price;
      if (sortBy === 'price-high-low') return b.price - a.price;
      if (sortBy === 'popularity') return b.reviewCount - a.reviewCount;
      if (sortBy === 'rating') return b.rating - a.rating;
      // Default: newest
      return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
    });
  }, [
    selectedCategory,
    selectedGender,
    selectedBrand,
    selectedSize,
    selectedRating,
    maxPrice,
    sortBy,
    searchQuery,
    filterParam,
  ]);

  const totalItems = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const activePage = Math.min(Math.max(1, currentPage), totalPages);

  // Reset page to 1 when any filter/sort/search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [
    selectedCategory,
    selectedGender,
    selectedBrand,
    selectedSize,
    selectedRating,
    maxPrice,
    sortBy,
    searchQuery,
    filterParam,
    pageSize,
  ]);

  // Lock body scroll when mobile filter drawer is open
  useEffect(() => {
    if (mobileFilterOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileFilterOpen]);

  const startIndex = (activePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const displayedProducts = filteredProducts.slice(startIndex, endIndex);

  const goToPage = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages || pageNumber === activePage) return;
    setCurrentPage(pageNumber);
    const gridSection = document.getElementById('product-grid-section');
    if (gridSection) {
      gridSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 200, behavior: 'smooth' });
    }
  };

  const getPaginationRange = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const delta = 1;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= activePage - delta && i <= activePage + delta)) {
        range.push(i);
      }
    }

    for (let i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  };

  const resetFilters = () => {
    setSelectedCategory('all');
    setSelectedGender('all');
    setSelectedBrand('all');
    setSelectedSize('all');
    setSelectedRating(0);
    setMaxPrice(500);
    setSearchQuery('');
    setSortBy('newest');
    setSearchParams({});
    setCurrentPage(1);
  };

  const activeFilterCount =
    (selectedCategory !== 'all' ? 1 : 0) +
    (selectedGender !== 'all' ? 1 : 0) +
    (selectedBrand !== 'all' ? 1 : 0) +
    (selectedSize !== 'all' ? 1 : 0) +
    (selectedRating > 0 ? 1 : 0) +
    (maxPrice < 500 ? 1 : 0) +
    (searchQuery ? 1 : 0);

  return (
    <div className="zelora-page-wrapper">
      <Toast />
      <Navbar />

      <main className="listing-page-main">
        {/* Header Breadcrumbs & Title */}
        <div className="listing-header-banner">
          <div className="listing-header-container">
            <div className="listing-breadcrumbs">
              <Link to="/">Home</Link>
              <span>/</span>
              <span className="current">Collections</span>
              {selectedCategory !== 'all' && (
                <>
                  <span>/</span>
                  <span className="current capitalize">{selectedCategory}</span>
                </>
              )}
            </div>

            <div className="listing-title-row">
              <div>
                <h1 className="listing-page-title">
                  {selectedCategory !== 'all'
                    ? selectedCategory.toUpperCase()
                    : selectedGender !== 'all'
                    ? `${selectedGender.toUpperCase()}’S COLLECTION`
                    : 'ALL COLLECTIONS'}
                </h1>
                <p className="listing-count-text">
                  Showing {totalItems === 0 ? 0 : `${startIndex + 1}–${endIndex}`} of {totalItems} curated pieces
                </p>
              </div>

              {/* Search Bar on Page */}
              <div className="listing-search-inline">
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by keywords, fabrics..."
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="clear-search-btn"
                    onClick={() => setSearchQuery('')}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Controls Bar (Mobile Filter Toggle & Sort Dropdown) */}
        <div className="listing-controls-bar">
          <div className="listing-controls-container">
            <button
              type="button"
              className="btn-toggle-filters"
              onClick={() => setMobileFilterOpen(true)}
            >
              <SlidersHorizontal size={16} />
              <span>Filter & Refine</span>
              {activeFilterCount > 0 && (
                <span className="filter-badge-count">{activeFilterCount}</span>
              )}
            </button>

            {/* Active Filter Chips */}
            <div className="active-filter-chips">
              {selectedCategory !== 'all' && (
                <span className="filter-chip">
                  Category: {selectedCategory}
                  <X size={12} onClick={() => setSelectedCategory('all')} />
                </span>
              )}
              {selectedGender !== 'all' && (
                <span className="filter-chip">
                  Gender: {selectedGender}
                  <X size={12} onClick={() => setSelectedGender('all')} />
                </span>
              )}
              {selectedBrand !== 'all' && (
                <span className="filter-chip">
                  Brand: {selectedBrand}
                  <X size={12} onClick={() => setSelectedBrand('all')} />
                </span>
              )}
              {selectedSize !== 'all' && (
                <span className="filter-chip">
                  Size: {selectedSize}
                  <X size={12} onClick={() => setSelectedSize('all')} />
                </span>
              )}
              {activeFilterCount > 0 && (
                <button type="button" className="clear-all-text-btn" onClick={resetFilters}>
                  Clear All
                </button>
              )}
            </div>

            {/* Sort Select */}
            <div className="sort-dropdown-wrap">
              <span className="sort-label">Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="zelora-select"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price-low-high">Price: Low to High</option>
                <option value="price-high-low">Price: High to Low</option>
                <option value="popularity">Popularity</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Mobile Filter Drawer Backdrop */}
        {mobileFilterOpen && (
          <div
            className="mobile-filter-backdrop"
            onClick={() => setMobileFilterOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Content Layout (Sidebar + Products Grid) */}
        <div className="listing-content-container">
          {/* Desktop Filter Sidebar */}
          <aside className={`listing-filter-sidebar ${mobileFilterOpen ? 'mobile-open' : ''}`}>
            <div className="sidebar-header-mobile">
              <h3>Filter Products</h3>
              <button
                type="button"
                className="sidebar-close-btn"
                onClick={() => setMobileFilterOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            {/* Category Filter */}
            <div className="filter-group">
              <h4 className="filter-group-title">CATEGORIES</h4>
              <div className="filter-options-list">
                <button
                  type="button"
                  className={`filter-option-btn ${selectedCategory === 'all' ? 'active' : ''}`}
                  onClick={() => setSelectedCategory('all')}
                >
                  <span>All Categories</span>
                  <span className="option-count">{PRODUCTS.length}</span>
                </button>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    className={`filter-option-btn ${selectedCategory === cat.slug ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(cat.slug)}
                  >
                    <span>{cat.name}</span>
                    <span className="option-count">{cat.itemCount}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Gender Filter */}
            <div className="filter-group">
              <h4 className="filter-group-title">GENDER</h4>
              <div className="filter-pill-row">
                {['all', 'women', 'men', 'unisex'].map((g) => (
                  <button
                    key={g}
                    type="button"
                    className={`filter-pill ${selectedGender === g ? 'active' : ''}`}
                    onClick={() => setSelectedGender(g)}
                  >
                    {g.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="filter-group">
              <div className="filter-header-flex">
                <h4 className="filter-group-title">MAX PRICE</h4>
                <span className="price-val-indicator">${maxPrice}</span>
              </div>
              <input
                type="range"
                min="50"
                max="500"
                step="25"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="zelora-range-slider"
              />
              <div className="slider-limits">
                <span>$50</span>
                <span>$500</span>
              </div>
            </div>

            {/* Size Filter */}
            <div className="filter-group">
              <h4 className="filter-group-title">SIZE</h4>
              <div className="size-selector-grid">
                {sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={`size-filter-btn ${selectedSize === s ? 'active' : ''}`}
                    onClick={() => setSelectedSize(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Brand Filter */}
            <div className="filter-group">
              <h4 className="filter-group-title">ATELIER & BRAND</h4>
              <div className="filter-options-list">
                {brands.map((b) => (
                  <button
                    key={b}
                    type="button"
                    className={`filter-option-btn ${selectedBrand === b ? 'active' : ''}`}
                    onClick={() => setSelectedBrand(b)}
                  >
                    <span>{b === 'all' ? 'All Brands' : b}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Rating Filter */}
            <div className="filter-group">
              <h4 className="filter-group-title">MINIMUM RATING</h4>
              <div className="filter-options-list">
                {[0, 4.8, 4.5].map((stars) => (
                  <button
                    key={stars}
                    type="button"
                    className={`filter-option-btn ${selectedRating === stars ? 'active' : ''}`}
                    onClick={() => setSelectedRating(stars)}
                  >
                    <span className="rating-row">
                      {stars === 0 ? (
                        'All Ratings'
                      ) : (
                        <>
                          <Star size={13} fill="#000" stroke="#000" />
                          <span>{stars} Stars & above</span>
                        </>
                      )}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {activeFilterCount > 0 && (
              <button type="button" className="btn-reset-filters" onClick={resetFilters}>
                <RotateCcw size={14} />
                <span>Reset All Filters</span>
              </button>
            )}

            {/* Mobile Apply Button */}
            <div className="sidebar-mobile-apply-wrap">
              <button
                type="button"
                className="btn-apply-mobile-filters"
                onClick={() => setMobileFilterOpen(false)}
              >
                Show {totalItems} Matching Pieces
              </button>
            </div>
          </aside>

          {/* Product Grid Main Area */}
          <section className="listing-products-area" id="product-grid-section">
            {displayedProducts.length > 0 ? (
              <>
                <div className="listing-product-grid">
                  {displayedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="listing-pagination-wrapper">
                    <div className="pagination-info-text">
                      Showing <strong>{startIndex + 1}–{endIndex}</strong> of <strong>{totalItems}</strong> pieces
                      <span className="pagination-page-tag">Page {activePage} of {totalPages}</span>
                    </div>

                    <nav className="pagination-nav" aria-label="Product pagination">
                      <button
                        type="button"
                        className="pagination-nav-btn pagination-prev-btn"
                        onClick={() => goToPage(activePage - 1)}
                        disabled={activePage === 1}
                        aria-label="Previous Page"
                      >
                        <ChevronLeft size={16} />
                        <span className="nav-btn-label">Prev</span>
                      </button>

                      <div className="pagination-numbers">
                        {getPaginationRange().map((item, idx) => {
                          if (item === '...') {
                            return (
                              <span key={`dots-${idx}`} className="pagination-ellipsis">
                                •••
                              </span>
                            );
                          }
                          const isCurrent = item === activePage;
                          return (
                            <button
                              key={item}
                              type="button"
                              className={`pagination-number-btn ${isCurrent ? 'active' : ''}`}
                              onClick={() => goToPage(item)}
                              aria-current={isCurrent ? 'page' : undefined}
                              aria-label={`Page ${item}`}
                            >
                              {item}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        type="button"
                        className="pagination-nav-btn pagination-next-btn"
                        onClick={() => goToPage(activePage + 1)}
                        disabled={activePage === totalPages}
                        aria-label="Next Page"
                      >
                        <span className="nav-btn-label">Next</span>
                        <ChevronRight size={16} />
                      </button>
                    </nav>

                    <div className="pagination-page-size-wrap">
                      <label htmlFor="pageSizeSelect" className="page-size-label">Per page:</label>
                      <select
                        id="pageSizeSelect"
                        value={pageSize}
                        onChange={(e) => setPageSize(Number(e.target.value))}
                        className="page-size-select"
                      >
                        <option value={6}>6</option>
                        <option value={9}>9</option>
                        <option value={12}>12</option>
                        <option value={18}>18</option>
                      </select>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="empty-listing-box">
                <Search size={44} strokeWidth={1.2} />
                <h3>No Matching Pieces Found</h3>
                <p>
                  We couldn't find any garments matching your current filter selections. Try broadening your criteria or search terms.
                </p>
                <button type="button" className="btn-hero-primary" onClick={resetFilters}>
                  Clear All Filters
                </button>
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

