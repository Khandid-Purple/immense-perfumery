
import React, { useState, useMemo, useEffect } from 'react';
import { Product } from '../types';
import { useShop } from '../context/ShopContext';
import { useToast } from '../context/ToastContext';
import { Marquee } from './ui/Marquee';

interface ProductListProps {
  onProductSelect: (product: Product) => void;
  onQuickView: (product: Product) => void;
}

type SortOption = 'featured' | 'price-low' | 'price-high' | 'rating';

// Sub-component for the animated Wishlist Button
const WishlistButton = ({ 
  product, 
  isWishlisted, 
  onToggle 
}: { 
  product: Product, 
  isWishlisted: boolean, 
  onToggle: (e: React.MouseEvent, p: Product) => void 
}) => {
  const [animate, setAnimate] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    setAnimate(true);
    onToggle(e, product);
  };

  useEffect(() => {
    if (animate) {
      const timeout = setTimeout(() => setAnimate(false), 400); // match animation duration
      return () => clearTimeout(timeout);
    }
  }, [animate]);

  return (
    <button 
      onClick={handleClick}
      className={`absolute top-4 right-4 z-20 p-2 rounded-full shadow-md transition-all duration-300 hover:scale-110 hover:rotate-12 ${
        isWishlisted 
          ? 'bg-pink-100 text-brand-pink dark:bg-pink-900/50 dark:text-brand-pink' 
          : 'bg-white/80 dark:bg-black/40 text-gray-400 hover:text-brand-pink backdrop-blur-sm'
      } ${animate ? 'animate-pop' : ''}`}
    >
       <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
    </button>
  );
};

const ProductList: React.FC<ProductListProps> = ({ onProductSelect, onQuickView }) => {
  const { products, isLoadingProducts, addToCart, toggleWishlist, isInWishlist } = useShop();
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<SortOption>('featured');

  // Extract unique categories
  const categories = useMemo(() => {
    return ['All', ...Array.from(new Set(products.map(p => p.category)))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = products;

    // Filter by search
    if (searchQuery) {
      result = result.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.notes?.some(note => note.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory !== 'All') {
      result = result.filter(product => product.category === selectedCategory);
    }

    // Sort
    return [...result].sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        default:
          return 0; // Featured (original order)
      }
    });
  }, [products, searchQuery, selectedCategory, sortBy]);

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    if (product.stock === 0) {
      showToast(`${product.name} is out of stock`, 'info');
      return;
    }
    const success = addToCart(product);
    if (success) {
      showToast(`Added ${product.name} to bag`);
    } else {
      showToast(`Cannot add more. Max stock reached.`, 'info');
    }
  };

  const handleToggleWishlist = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    const willAdd = !isInWishlist(product.id);
    toggleWishlist(product);
    showToast(willAdd ? 'Added to wishlist' : 'Removed from wishlist', 'info');
  };

  const handleQuickViewClick = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    onQuickView(product);
  };

  if (isLoadingProducts) {
    return (
      <section id="products" className="py-20 w-full max-w-7xl mx-auto px-6 text-center">
         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-pink mx-auto mb-4"></div>
         <p className="text-gray-500">Loading fragrances...</p>
      </section>
    );
  }

  return (
    <>
      {/* Marquee Separator */}
      <div className="mb-16">
        <Marquee items={['Luxury', 'Essence', 'Timeless', 'Immense', 'Elegance', 'Memory']} />
      </div>

      <section id="products" className="pb-16 w-full max-w-7xl mx-auto px-6">
        <div className="flex flex-col mb-12 gap-8">
          <div className="flex flex-col md:flex-row items-end md:items-center justify-between gap-6 opacity-0 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="text-left">
              <h3 className="text-brand-pink font-semibold uppercase tracking-wider text-sm mb-2 flex items-center gap-2">
                <span className="w-8 h-[1px] bg-brand-pink inline-block"></span>
                Our Collection
              </h3>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white font-serif transition-colors">Discover Scents</h2>
            </div>
            
            {/* Search Input */}
            <div className="relative w-full md:w-80 group">
              <input 
                type="text" 
                placeholder="Search perfumes..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-full border border-gray-200 dark:border-white/20 focus:outline-none focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/20 transition-all bg-white/50 dark:bg-white/5 backdrop-blur-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 group-hover:bg-white dark:group-hover:bg-white/10"
              />
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5 transition-colors group-hover:text-brand-pink" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Filters & Sort */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white/40 dark:bg-dark-card/50 p-2 rounded-2xl backdrop-blur-sm border border-white/50 dark:border-white/10 shadow-sm opacity-0 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
             {/* Categories */}
             <div className="flex flex-wrap gap-2 justify-center md:justify-start w-full md:w-auto">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                      selectedCategory === cat 
                        ? 'bg-brand-pink text-white shadow-lg shadow-brand-pink/30 transform scale-105' 
                        : 'bg-white dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-pink-50 dark:hover:bg-white/10 hover:text-brand-pink dark:hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
             </div>

             {/* Sort */}
             <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">Sort by:</span>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="bg-white dark:bg-white/5 border-none text-sm font-medium text-gray-700 dark:text-gray-200 py-2 pl-4 pr-8 rounded-full focus:ring-0 cursor-pointer hover:bg-pink-50 dark:hover:bg-white/10 transition-colors"
                >
                  <option value="featured" className="dark:bg-dark-card text-gray-900 dark:text-gray-100">Featured</option>
                  <option value="price-low" className="dark:bg-dark-card text-gray-900 dark:text-gray-100">Price: Low to High</option>
                  <option value="price-high" className="dark:bg-dark-card text-gray-900 dark:text-gray-100">Price: High to Low</option>
                  <option value="rating" className="dark:bg-dark-card text-gray-900 dark:text-gray-100">Top Rated</option>
                </select>
             </div>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white/50 dark:bg-white/5 rounded-3xl border border-dashed border-gray-300 dark:border-white/10 animate-fade-in">
            <p className="text-gray-500 dark:text-gray-400 text-lg">No perfumes found matching your criteria</p>
            <button 
              onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
              className="mt-4 text-brand-pink font-medium hover:underline"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((product, index) => {
              const isWishlisted = isInWishlist(product.id);
              const isOutOfStock = product.stock === 0;

              return (
                <div 
                  key={product.id} 
                  className="group relative flex flex-col items-center opacity-0 animate-fade-in-up"
                  style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                >
                  {/* Image Container - Clickable */}
                  <div 
                    className="relative w-full aspect-[3/4] bg-white dark:bg-dark-card rounded-3xl p-6 flex items-center justify-center z-10 transition-all duration-500 group-hover:-translate-y-3 group-hover:shadow-2xl cursor-pointer border border-transparent group-hover:border-pink-100 dark:group-hover:border-white/10 overflow-hidden shadow-md"
                    onClick={() => onProductSelect(product)}
                  >
                     <img 
                      src={product.image} 
                      alt={product.name} 
                      className={`h-full w-full object-contain drop-shadow-md group-hover:drop-shadow-2xl transition-all duration-700 group-hover:scale-110 z-10 ${isOutOfStock ? 'grayscale opacity-70' : ''}`}
                     />
                     
                     {/* Out of Stock Overlay */}
                     {isOutOfStock && (
                        <div className="absolute inset-0 bg-black/10 flex items-center justify-center z-20">
                           <div className="bg-black/70 text-white px-3 py-1 text-sm font-bold rounded-full backdrop-blur-md">Out of Stock</div>
                        </div>
                     )}

                     {/* Actions Overlay */}
                     {!isOutOfStock && (
                       <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 translate-y-4 group-hover:translate-y-0 flex flex-col gap-2">
                          <button 
                            onClick={(e) => handleQuickViewClick(e, product)}
                            className="w-full bg-white/90 backdrop-blur-sm text-gray-800 py-2.5 rounded-xl font-medium shadow-lg hover:bg-white flex items-center justify-center gap-2 border border-gray-100 transition-colors"
                          >
                             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1v22M5 12l7 7 7-7"/></svg>
                             Quick View
                          </button>
                          <button 
                            onClick={(e) => handleAddToCart(e, product)}
                            className="w-full bg-brand-pink/90 backdrop-blur-sm text-white py-2.5 rounded-xl font-medium shadow-lg shadow-brand-pink/30 hover:bg-brand-pink flex items-center justify-center gap-2"
                          >
                             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                             Add to Cart
                          </button>
                       </div>
                     )}
                  </div>
                  
                  {/* Wishlist Button - Using new animated component */}
                  <WishlistButton 
                    product={product} 
                    isWishlisted={isWishlisted} 
                    onToggle={handleToggleWishlist} 
                  />
                  
                  {/* Product Info */}
                  <div className="mt-5 text-center px-2">
                     <p className="text-[10px] text-brand-pink font-bold uppercase tracking-widest mb-2 opacity-80">{product.category}</p>
                     <h3 
                       className="font-bold text-gray-900 dark:text-gray-100 text-lg leading-tight mb-1 cursor-pointer hover:text-brand-pink dark:hover:text-brand-pink transition-colors bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent group-hover:text-brand-pink"
                       onClick={() => onProductSelect(product)}
                     >
                       {product.name}
                     </h3>
                     <div className="flex items-center justify-center gap-2 mb-2 mt-1">
                       <span className="font-serif text-lg text-gray-900 dark:text-gray-200">₵{product.price.toLocaleString()}</span>
                       <span className="text-gray-300 dark:text-gray-600 text-xs">|</span>
                       <div className="flex text-yellow-400 text-xs">
                          {'★'.repeat(Math.floor(product.rating))}
                       </div>
                     </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
};

export default ProductList;
