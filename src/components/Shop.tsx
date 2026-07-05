import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, AlertCircle, ArrowRight } from 'lucide-react';
import { Product, CartItem, Category } from '../types';
import ProductCard from './ProductCard';
import ProductDetail from './ProductDetail';

interface ShopProps {
  products: Product[];
  cart: CartItem[];
  wishlist: string[];
  recentlyViewed: string[];
  selectedProductId: string | null;
  setSelectedProductId: (id: string | null) => void;
  activeCategoryFilter: Category | 'all';
  setActiveCategoryFilter: (cat: Category | 'all') => void;
  activeConditionFilter: string;
  setActiveConditionFilter: (cond: string) => void;
  activeSizeFilter: string;
  setActiveSizeFilter: (size: string) => void;
  onNavigate: (page: string, category?: Category | 'all') => void;
  handleAddToCart: (product: Product) => void;
  handleToggleWishlist: (productId: string, e?: React.MouseEvent) => void;
  handleProductClick: (product: Product) => void;
  renderRecentlyViewedSection: () => React.ReactNode;
}

export default function Shop({
  products,
  cart,
  wishlist,
  recentlyViewed,
  selectedProductId,
  setSelectedProductId,
  activeCategoryFilter,
  setActiveCategoryFilter,
  activeConditionFilter,
  setActiveConditionFilter,
  activeSizeFilter,
  setActiveSizeFilter,
  onNavigate,
  handleAddToCart,
  handleToggleWishlist,
  handleProductClick,
  renderRecentlyViewedSection
}: ShopProps) {
  const activeProduct = products.find(p => p.id === selectedProductId);

  // --- FILTERING LOGIC ---
  const filteredProducts = products.filter(p => {
    const matchesCategory = activeCategoryFilter === 'all' || p.category === activeCategoryFilter;
    const matchesCondition = activeConditionFilter === 'all' || p.condition === activeConditionFilter;
    
    // Size parsing (rough filter)
    let matchesSize = true;
    if (activeSizeFilter !== 'all') {
      const sizeLower = p.size.toLowerCase().trim();
      const filterLower = activeSizeFilter.toLowerCase();
      if (filterLower === 's') {
        matchesSize = sizeLower === 's' || sizeLower.startsWith('s ') || sizeLower.startsWith('s(') || sizeLower.includes('(s') || sizeLower.includes('s-');
      } else if (filterLower === 'm') {
        matchesSize = sizeLower === 'm' || sizeLower.startsWith('m ') || sizeLower.startsWith('m(') || sizeLower.includes('(m') || sizeLower.includes('m-');
      } else if (filterLower === 'l') {
        matchesSize = sizeLower === 'l' || sizeLower.startsWith('l ') || sizeLower.startsWith('l(') || sizeLower.includes('(l') || sizeLower.includes('l-');
      } else if (filterLower === 'xl') {
        matchesSize = sizeLower.includes('xl');
      } else if (filterLower === 'kids') {
        matchesSize = p.category === 'kids' || sizeLower.includes('y') || sizeLower.includes('years') || sizeLower.includes('t');
      }
    }
    
    return matchesCategory && matchesCondition && matchesSize;
  });

  const uniqueSizes = ['all', 'S', 'M', 'L', 'XL', 'kids'];
  const uniqueConditions = ['all', 'Like New', 'Gently Loved', 'Well-Loved'];

  return (
    <div
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8"
      id="shop-view"
    >
      {activeProduct ? (
        <ProductDetail 
          product={activeProduct} 
          onBack={() => setSelectedProductId(null)} 
          onAddToCart={handleAddToCart}
          isInCart={cart.some(item => item.product.id === activeProduct.id)}
          isSaved={wishlist.includes(activeProduct.id)}
          onToggleSave={() => handleToggleWishlist(activeProduct.id)}
        />
      ) : (
        <div className="space-y-8">
          {/* Shop Intro Area */}
          <div className="border-b border-border pb-6 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-accent">
              <Sparkles className="w-4 h-4" />
              <span>Curated & Clean Inventory</span>
            </div>
            <h1 className="font-heading text-3xl font-bold text-text-primary capitalize">
              {activeCategoryFilter === 'all' ? 'All Finds' : `${activeCategoryFilter}'s Collection`}
            </h1>
            <p className="text-[14px] text-text-secondary max-w-2xl">
              New vintage and secondhand clothes hand-checked and added every week. Use the filters below to find your perfect size or condition.
            </p>
          </div>

          {/* Filter Toolbar controls */}
          <div className="bg-white border border-border p-4.5 rounded-2xl flex flex-wrap gap-4 items-center justify-between shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
            {/* Left: Category tabs */}
            <div className="flex flex-wrap gap-1.5">
              {(['all', 'mens', 'womens', 'kids', 'accessories'] as const).map((cat, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveCategoryFilter(cat)}
                  className={`text-xs px-4 py-2 font-semibold rounded-lg transition-colors cursor-pointer capitalize border-none ${
                    activeCategoryFilter === cat
                      ? 'bg-[#2D6A4F] text-white shadow-xs'
                      : 'bg-surface-tint text-text-primary hover:bg-[#EBE9E3]'
                  }`}
                  id={`filter-tab-${cat}`}
                >
                  {cat === 'all' ? 'Show All' : cat === 'mens' ? "Men's" : cat === 'womens' ? "Women's" : cat}
                </button>
              ))}
            </div>

            {/* Right: Condition & Size Dropdowns */}
            <div className="flex flex-wrap gap-3 items-center w-full lg:w-auto mt-4 lg:mt-0">
              {/* Condition Filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Grade:</span>
                <select
                  value={activeConditionFilter}
                  onChange={(e) => setActiveConditionFilter(e.target.value)}
                  className="bg-white border border-border rounded-lg text-xs px-3 py-1.5 text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
                  id="select-filter-condition"
                >
                  {uniqueConditions.map((cond, idx) => (
                    <option key={idx} value={cond}>
                      {cond === 'all' ? 'All Grades' : cond}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sizing Filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Size:</span>
                <select
                  value={activeSizeFilter}
                  onChange={(e) => setActiveSizeFilter(e.target.value)}
                  className="bg-white border border-border rounded-lg text-xs px-3 py-1.5 text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
                  id="select-filter-size"
                >
                  {uniqueSizes.map((sz, idx) => (
                    <option key={idx} value={sz}>
                      {sz === 'all' ? 'All Sizes' : sz === 'kids' ? 'Kids Sizes' : sz}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* PROMINENT SHOP BY SIZE SELECTOR */}
          <div className="bg-white border border-border p-5 rounded-2xl space-y-3 shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2D6A4F]" />
              <span className="text-[11px] font-mono tracking-wider font-bold text-text-secondary uppercase">Shop by Size:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {uniqueSizes.map((sz, idx) => {
                const isActive = activeSizeFilter === sz;
                return (
                  <button
                    key={idx}
                    onClick={() => setActiveSizeFilter(sz)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer border-none ${
                      isActive 
                        ? 'bg-[#2D6A4F] text-white ring-2 ring-[#2D6A4F]/10 shadow-xs font-bold' 
                        : 'bg-white border border-border text-text-primary hover:bg-surface-tint'
                    }`}
                    id={`size-pill-${sz}`}
                  >
                    {sz === 'all' ? 'All Sizes' : sz === 'kids' ? 'Kids Sizes' : `Size ${sz}`}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active filters summary */}
          {(activeConditionFilter !== 'all' || activeSizeFilter !== 'all' || activeCategoryFilter !== 'all') && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-text-secondary">Active filters:</span>
              <div className="flex gap-1.5 flex-wrap">
                {activeCategoryFilter !== 'all' && (
                  <span className="bg-surface-tint text-text-primary px-2.5 py-0.5 rounded border border-border font-medium capitalize">
                    Category: {activeCategoryFilter}
                  </span>
                )}
                {activeConditionFilter !== 'all' && (
                  <span className="bg-surface-tint text-text-primary px-2.5 py-0.5 rounded border border-border font-medium">
                    Grade: {activeConditionFilter}
                  </span>
                )}
                {activeSizeFilter !== 'all' && (
                  <span className="bg-surface-tint text-text-primary px-2.5 py-0.5 rounded border border-border font-medium">
                    Size: {activeSizeFilter}
                  </span>
                )}
                <button
                  onClick={() => {
                    setActiveCategoryFilter('all');
                    setActiveConditionFilter('all');
                    setActiveSizeFilter('all');
                  }}
                  className="text-accent underline font-bold cursor-pointer hover:text-accent-hover transition-colors border-none bg-transparent"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          )}

          {/* Product Grid */}
          {filteredProducts.length === 0 ? (
            <div className="bg-white border border-border py-20 text-center rounded-2xl">
              <AlertCircle className="w-12 h-12 text-[#6B6B65]/35 mx-auto mb-3" />
              <p className="font-heading text-lg font-bold text-text-primary">No matching garments found</p>
              <p className="text-xs text-text-secondary mt-1 max-w-md mx-auto">
                Every single piece at ETZ A Shoppe is one-of-one. Try clearing your filters or checking other categories for fresh arrivals!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onClick={handleProductClick}
                  isSaved={wishlist.includes(product.id)}
                  onToggleSave={handleToggleWishlist}
                />
              ))}
            </div>
          )}

          {/* Recently Viewed Items */}
          {renderRecentlyViewedSection()}
        </div>
      )}
    </div>
  );
}
