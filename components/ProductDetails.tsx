
import React, { useState, useEffect, useMemo } from 'react';
import { Product, Review } from '../types';
import { useShop } from '../context/ShopContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Button } from './ui/Button';
import { FragrancePyramid } from './ui/FragrancePyramid';
import { SEO } from './SEO';

interface ProductDetailsProps {
  product: Product;
  onBack: () => void;
  onProductSelect?: (product: Product) => void;
  onBuyNow?: () => void;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ product, onBack, onProductSelect, onBuyNow }) => {
  const { products, addToCart, buyNow, toggleWishlist, isInWishlist, refreshProducts, addToRecentlyViewed } = useShop();
  const { showToast } = useToast();
  const { user, isAuthenticated } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'desc' | 'reviews'>('desc');
  const [selectedImage, setSelectedImage] = useState(product.image);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  
  useEffect(() => { 
    setSelectedImage(product.image); 
    addToRecentlyViewed(product.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [product.id]);

  const isWishlisted = isInWishlist(product.id);
  const isOutOfStock = product.stock === 0;

  const similarProducts = useMemo(() => {
    return products
      .filter(p => p.id !== product.id && (p.category === product.category || p.notes?.some(n => product.notes?.includes(n))))
      .slice(0, 4);
  }, [product.id, products]);

  const hasPurchased = isAuthenticated && user?.orders.some(o => 
    o.items.some(i => i.id === product.id) && o.status !== 'Cancelled'
  );

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    if (addToCart(product)) showToast(`Added ${product.name} to bag`);
    else showToast('Max stock limit reached', 'info');
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    buyNow(product);
    if (onBuyNow) onBuyNow();
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !user) {
      showToast('Please sign in to leave a review.', 'info');
      return;
    }
    
    if (!hasPurchased) {
      showToast('Only verified purchasers can leave a review.', 'info');
      return;
    }

    if (!reviewForm.comment.trim()) return;

    setIsSubmittingReview(true);
    try {
      await api.products.addReview(product.id, user.id, {
        userName: user.name,
        rating: reviewForm.rating,
        comment: reviewForm.comment
      });
      
      showToast('Thank you for your feedback!', 'success');
      setReviewForm({ rating: 5, comment: '' });
      refreshProducts();
    } catch (error: any) {
      showToast(error.message || 'Failed to post review.', 'info');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="animate-fade-in pt-10 pb-20 max-w-7xl mx-auto px-6">
      <SEO title={product.name} description={product.description} />

      <button onClick={onBack} className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-brand-pink mb-8 transition-colors group">
        <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 12H5M12 19l-7-7 7-7"/></svg>
        Back to Products
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-start mb-24">
        <div className="sticky top-24 flex flex-col gap-4">
          <div className="relative group w-full aspect-[4/5] bg-white dark:bg-dark-card rounded-[3rem] shadow-2xl overflow-hidden p-8 border border-white/50 dark:border-white/10 flex items-center justify-center">
             <img src={selectedImage} alt={product.name} className={`w-full h-full object-contain transition-all duration-500 ${isOutOfStock ? 'grayscale opacity-50' : ''}`} />
             {isOutOfStock && <div className="absolute inset-0 flex items-center justify-center z-20"><div className="bg-black/70 text-white px-6 py-3 rounded-xl text-xl font-bold backdrop-blur-sm">OUT OF STOCK</div></div>}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-start">
             <span className="text-brand-pink font-semibold uppercase text-xs bg-pink-50 dark:bg-pink-900/20 px-3 py-1 rounded-full">{product.category}</span>
             {product.stock > 0 && product.stock <= 5 && <span className="text-orange-500 font-bold text-xs animate-pulse">Only {product.stock} left!</span>}
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 dark:text-white mt-4">{product.name}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-500">
             <div className="flex text-yellow-400">{'★'.repeat(Math.floor(product.rating))}</div>
             <span>({product.reviews} reviews)</span>
          </div>
          <div className="text-3xl font-bold text-gray-800 dark:text-gray-200 border-b pb-6">₵{product.price.toLocaleString()}</div>

          <div className="flex gap-8 border-b border-gray-100 dark:border-white/10">
            <button className={`pb-4 text-lg font-medium relative ${activeTab === 'desc' ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`} onClick={() => setActiveTab('desc')}>
              Description {activeTab === 'desc' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-pink"></span>}
            </button>
            <button className={`pb-4 text-lg font-medium relative ${activeTab === 'reviews' ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`} onClick={() => setActiveTab('reviews')}>
              Reviews {activeTab === 'reviews' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-pink"></span>}
            </button>
          </div>

          <div className="min-h-[150px]">
            {activeTab === 'desc' ? (
              <div className="animate-fade-in space-y-8">
                 <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg font-light">{product.description}</p>
                 {product.notes && <FragrancePyramid notes={product.notes} />}
              </div>
            ) : (
              <div className="animate-fade-in space-y-8">
                 {isAuthenticated ? (
                   hasPurchased ? (
                     <form onSubmit={handleReviewSubmit} className="bg-pink-50/50 dark:bg-white/5 p-6 rounded-2xl border border-pink-100 dark:border-white/10 shadow-sm mb-10">
                        <div className="flex items-center gap-2 mb-4">
                           <div className="w-8 h-8 rounded-full bg-brand-pink flex items-center justify-center shadow-lg shadow-brand-pink/20">
                              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                           </div>
                           <h4 className="font-bold text-gray-800 dark:text-white">Verified Purchase: Share Your Experience</h4>
                        </div>
                        <div className="flex gap-2 mb-4">
                          {[1, 2, 3, 4, 5].map(star => (
                            <button key={star} type="button" onClick={() => setReviewForm({...reviewForm, rating: star})} className={`text-2xl transition-transform hover:scale-110 ${reviewForm.rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}>★</button>
                          ))}
                        </div>
                        <textarea required placeholder="What do you think of this scent?" value={reviewForm.comment} onChange={e => setReviewForm({...reviewForm, comment: e.target.value})} className="w-full p-4 rounded-xl border-none bg-white dark:bg-black/20 dark:text-white mb-4 resize-none focus:ring-2 focus:ring-brand-pink/20" rows={3}></textarea>
                        <Button disabled={isSubmittingReview} className="w-full">{isSubmittingReview ? 'Posting...' : 'Post Review'}</Button>
                     </form>
                   ) : (
                     <div className="p-8 bg-pink-50/30 dark:bg-white/5 rounded-2xl text-center border border-pink-100 dark:border-white/10 mb-10">
                        <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                        <p className="text-gray-600 dark:text-gray-300 font-medium">Verified Reviews Only</p>
                        <p className="text-gray-400 text-sm mt-2">Only customers who have purchased this fragrance can leave a review. Experience it for yourself to share your thoughts!</p>
                     </div>
                   )
                 ) : (
                   <div className="p-6 bg-gray-50 dark:bg-white/5 rounded-2xl text-center mb-10 border border-gray-100 dark:border-white/5">
                      <p className="text-gray-500">Please sign in to share your experience.</p>
                   </div>
                 )}

                 <div className="space-y-4">
                   <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Customer Impressions</h4>
                   {product.customerReviews && product.customerReviews.length > 0 ? product.customerReviews.map((rev) => (
                     <div key={rev.id} className="bg-white dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/5 shadow-sm transition-transform hover:-translate-y-1">
                       <div className="flex justify-between items-start mb-2">
                         <div className="flex items-center gap-2">
                           <span className="font-bold text-gray-800 dark:text-white text-sm">{rev.userName}</span>
                           {rev.isVerified && (
                             <span className="flex items-center gap-1 text-[9px] bg-pink-100 text-brand-pink px-2 py-0.5 rounded-full font-bold">
                               <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                               VERIFIED BUYER
                             </span>
                           )}
                         </div>
                         <div className="flex text-yellow-400 text-xs">{'★'.repeat(rev.rating)}</div>
                       </div>
                       <p className="text-gray-600 dark:text-gray-300 text-sm italic">"{rev.comment}"</p>
                       <span className="text-[10px] text-gray-400 mt-2 block">{rev.date}</span>
                     </div>
                   )) : <p className="text-center py-10 text-gray-400 italic">No impressions recorded for this scent yet.</p>}
                 </div>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <Button onClick={handleAddToCart} disabled={isOutOfStock} variant="outline" className="flex-1 py-4">Add to Cart</Button>
            <Button onClick={handleBuyNow} disabled={isOutOfStock} className="flex-1 py-4">Buy Now</Button>
            <button onClick={() => toggleWishlist(product)} className={`p-4 rounded-full border-2 transition-all ${isWishlisted ? 'border-brand-pink bg-brand-pink text-white' : 'border-gray-200 text-gray-400'}`}>
              <svg className="w-6 h-6" fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 00 0-7.78z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
        </div>
      </div>

      {similarProducts.length > 0 && (
        <section className="mt-20 border-t border-gray-100 dark:border-white/5 pt-16">
           <div className="mb-10">
              <h3 className="text-brand-pink font-semibold uppercase tracking-wider text-xs mb-2">Curated Pairing</h3>
              <h2 className="text-3xl font-serif font-bold text-gray-900 dark:text-white">You Might Also Adore</h2>
           </div>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {similarProducts.map(p => (
                <div 
                  key={p.id} 
                  onClick={() => onProductSelect?.(p)}
                  className="group cursor-pointer"
                >
                  <div className="aspect-[3/4] bg-white dark:bg-dark-card rounded-3xl p-6 flex items-center justify-center shadow-sm border border-transparent group-hover:border-brand-pink/20 transition-all mb-4 overflow-hidden">
                     <img src={p.image} alt={p.name} className="h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <h4 className="font-bold text-gray-800 dark:text-white truncate">{p.name}</h4>
                  <p className="text-brand-pink font-bold text-sm">₵{p.price.toLocaleString()}</p>
                </div>
              ))}
           </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetails;
