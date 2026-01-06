
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { api } from '../services/api';
import { useShop } from '../context/ShopContext';
import { Order, Product, User } from '../types';
import { Button } from './ui/Button';
import { useToast } from '../context/ToastContext';

const AdminDashboard: React.FC = () => {
  const { refreshProducts, heroProductId, setHeroProduct } = useShop();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'products' | 'customers' | 'promotions'>('overview');
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<User[]>([]);
  const [promos, setPromos] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({
    freeShippingThreshold: 3000,
    standardShippingRate: 45,
    expressShippingRate: 80,
    giftWrapRate: 25
  });
  const [isLoading, setIsLoading] = useState(true);

  // Promotions Form State
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(10);

  // Filters State
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');

  // Product Form State
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [notesInput, setNotesInput] = useState('');
  
  // Image inputs state: Slot 0 is Main, Slots 1-3 are Gallery
  const [imageInputs, setImageInputs] = useState<string[]>(['', '', '', '']);
  const [imageInputModes, setImageInputModes] = useState<('url' | 'file')[]>(['url', 'url', 'url', 'url']);

  const [productForm, setProductForm] = useState<Partial<Product>>({
    name: '',
    category: '',
    price: 0,
    description: '',
    image: '',
    images: [],
    notes: [],
    stock: 0
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [allOrders, allProducts, allCustomers, allPromos, allSettings] = await Promise.all([
        api.orders.getAll(),
        api.products.getAll(),
        api.users.getAll(),
        api.promos.getAll(),
        api.settings.get()
      ]);
      setOrders(allOrders.reverse());
      setProducts(allProducts);
      setCustomers(allCustomers);
      setPromos(allPromos);
      if (allSettings) setSettings(allSettings);
    } catch (error) {
      showToast('Failed to load data', 'info');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
    try {
      await api.orders.updateStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      showToast(`Order updated to ${newStatus}`, 'success');
    } catch (e) {
      showToast('Failed to update status', 'info');
    }
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.settings.update(settings);
      showToast('Store settings updated', 'success');
    } catch (e) {
      showToast('Failed to update settings', 'info');
    }
  };

  const handleAddPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode.trim()) return;
    try {
      await api.promos.add({ code: promoCode.toUpperCase().trim(), discount: promoDiscount });
      setPromoCode('');
      setPromoDiscount(10);
      fetchData();
      showToast('Promo code created', 'success');
    } catch (e) {
      showToast('Failed to create promo', 'info');
    }
  };

  const handleRemovePromo = async (code: string) => {
    try {
      await api.promos.remove(code);
      fetchData();
      showToast('Promo code removed', 'info');
    } catch (e) {
      showToast('Failed to remove promo', 'info');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await api.products.delete(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      refreshProducts();
      showToast('Product deleted', 'success');
    }
  };

  const handleSetHero = async (id: string) => {
    await setHeroProduct(id);
    showToast('Homepage Hero updated!', 'success');
  };

  const openProductForm = (product?: Product) => {
    if (product) {
      setProductForm(product);
      setNotesInput(product.notes?.join(', ') || '');
      
      const initialImages = ['', '', '', ''];
      const initialModes: ('url' | 'file')[] = ['url', 'url', 'url', 'url'];
      
      const combined = [product.image, ...(product.images || [])].filter(Boolean);
      combined.slice(0, 4).forEach((img, idx) => {
        initialImages[idx] = img;
        if (img.startsWith('data:')) initialModes[idx] = 'file';
      });

      setImageInputs(initialImages);
      setImageInputModes(initialModes);
    } else {
      setProductForm({ name: '', category: '', price: 0, description: '', image: '', images: [], notes: [], stock: 0 });
      setNotesInput('');
      setImageInputs(['', '', '', '']);
      setImageInputModes(['url', 'url', 'url', 'url']);
    }
    setIsEditingProduct(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFileUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showToast('Please upload an image file', 'info');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        showToast('Image too large. Max 2MB.', 'info');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
         const newInputs = [...imageInputs];
         newInputs[index] = reader.result as string;
         setImageInputs(newInputs);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUrlChange = (index: number, value: string) => {
    const newInputs = [...imageInputs];
    newInputs[index] = value;
    setImageInputs(newInputs);
  };

  const toggleInputMode = (index: number, mode: 'url' | 'file') => {
    const newModes = [...imageInputModes];
    newModes[index] = mode;
    setImageInputModes(newModes);
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const notesArray = notesInput.split(',').map(n => n.trim()).filter(n => n !== '');
    const validImages = imageInputs.filter(img => img.trim() !== '');
    
    const mainImage = validImages.length > 0 ? validImages[0] : 'https://images.unsplash.com/photo-1541643600914-78b084683601';
    const galleryImages = validImages.slice(1);

    const payload = {
      ...productForm,
      image: mainImage,
      images: galleryImages,
      notes: notesArray,
      stock: Number(productForm.stock) || 0,
      price: Number(productForm.price) || 0
    };

    try {
      if (productForm.id) {
        await api.products.update(payload as Product);
        showToast('Product updated', 'success');
      } else {
        await api.products.add(payload as any);
        showToast('Product added', 'success');
      }
      setIsEditingProduct(false);
      fetchData();
      refreshProducts();
    } catch (e: any) {
      showToast(e.message || 'Failed to save product', 'info');
    }
  };

  const totalRevenue = orders.reduce((acc, order) => order.status !== 'Cancelled' ? acc + order.total : acc, 0);
  const productPerformance = useMemo(() => {
    const stats: Record<string, { name: string, image: string, sold: number, revenue: number }> = {};
    orders.forEach(order => {
      if (order.status !== 'Cancelled') {
        order.items.forEach(item => {
          if (!stats[item.id]) {
            stats[item.id] = { name: item.name, image: item.image, sold: 0, revenue: 0 };
          }
          stats[item.id].sold += item.quantity;
          stats[item.id].revenue += item.price * item.quantity;
        });
      }
    });
    return Object.values(stats).sort((a, b) => b.sold - a.sold);
  }, [orders]);

  const maxSold = productPerformance.length > 0 ? productPerformance[0].sold : 0;

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      if (filterStatus !== 'All' && order.status !== filterStatus) return false;
      const orderDate = new Date(order.date);
      if (dateFrom && orderDate < new Date(dateFrom)) return false;
      if (dateTo && orderDate > new Date(dateTo)) return false;
      return true;
    });
  }, [orders, filterStatus, dateFrom, dateTo]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Order Confirmed': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
      case 'Processing': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
      case 'Shipped': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300';
      case 'Delivered': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
      case 'Cancelled': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
    }
  };

  const imagePlaceholder = "https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=200&auto=format&fit=crop";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg p-4 md:p-6 animate-fade-in pb-20">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 dark:text-white">Admin Hub</h1>
          
          {/* Scrollable Tabs Wrapper */}
          <div className="w-full md:w-auto relative group overflow-hidden rounded-2xl">
            <div className="overflow-x-auto scrollbar-hide flex items-center -mx-4 px-4 md:mx-0 md:px-0 scroll-smooth">
              <div className="flex gap-2 bg-white dark:bg-dark-card p-1.5 rounded-2xl shadow-sm border border-gray-100 dark:border-white/10 whitespace-nowrap min-w-max relative z-20">
                 {(['overview', 'orders', 'products', 'customers', 'promotions'] as const).map(tab => (
                   <button 
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                        activeTab === tab 
                          ? 'bg-brand-pink text-white shadow-lg shadow-brand-pink/20 scale-[1.02]' 
                          : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'
                      }`}
                   >
                     {tab.charAt(0).toUpperCase() + tab.slice(1)}
                   </button>
                 ))}
              </div>
            </div>
            {/* Edge Fading masks for better mobile visual hint */}
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white/60 dark:from-dark-card/60 to-transparent z-30 pointer-events-none md:hidden"></div>
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white/60 dark:from-dark-card/60 to-transparent z-30 pointer-events-none md:hidden"></div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-pink"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {activeTab === 'overview' && (
              <div className="space-y-8 animate-fade-in">
                 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    <div className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/10">
                       <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Revenue</p>
                       <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">₵{totalRevenue.toLocaleString()}</p>
                    </div>
                    <div className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/10">
                       <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Orders</p>
                       <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{orders.length}</p>
                    </div>
                    <div className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/10">
                       <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Products</p>
                       <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{products.length}</p>
                    </div>
                    <div className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/10">
                       <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Customers</p>
                       <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{customers.length}</p>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-gray-200 dark:border-white/10 p-6">
                       <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Top Sellers</h3>
                       <div className="space-y-6">
                          {productPerformance.slice(0, 5).map((prod, idx) => (
                             <div key={idx} className="relative">
                                <div className="flex justify-between items-center mb-2">
                                   <div className="flex items-center gap-3">
                                      <img 
                                        src={prod.image} 
                                        onError={(e) => (e.currentTarget.src = imagePlaceholder)} 
                                        className="w-10 h-10 rounded-lg object-cover bg-gray-50" 
                                      />
                                      <p className="text-sm font-bold text-gray-800 dark:text-white">{prod.name}</p>
                                   </div>
                                   <p className="text-sm font-bold text-brand-pink">₵{prod.revenue.toLocaleString()}</p>
                                </div>
                                <div className="h-1.5 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                                   <div className="h-full bg-brand-pink opacity-60" style={{ width: `${(prod.sold / maxSold) * 100}%` }}></div>
                                </div>
                             </div>
                          ))}
                       </div>
                    </div>
                    <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-gray-200 dark:border-white/10 p-6">
                       <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
                       <div className="space-y-4">
                          {orders.slice(0, 5).map(order => (
                            <div key={order.id} className="flex justify-between items-center border-b border-gray-50 dark:border-white/5 pb-3 last:border-0">
                               <div>
                                  <p className="text-sm font-bold text-gray-800 dark:text-white">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                                  <p className="text-[10px] text-gray-400 uppercase font-bold">{order.date}</p>
                               </div>
                               <div className="text-right">
                                  <p className="text-sm font-bold">₵{order.total.toLocaleString()}</p>
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${getStatusColor(order.status)}`}>{order.status}</span>
                               </div>
                            </div>
                          ))}
                       </div>
                    </div>
                 </div>
              </div>
            )}

            {activeTab === 'products' && (
              <div className="space-y-6 animate-fade-in">
                {!isEditingProduct ? (
                  <>
                    <div className="flex justify-end">
                      <Button onClick={() => openProductForm()}>+ Add Fragrance</Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {products.map(product => (
                        <div key={product.id} className="bg-white dark:bg-dark-card p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-white/10 flex gap-4 relative group hover:border-brand-pink transition-colors">
                           {heroProductId === product.id && <div className="absolute top-0 right-0 bg-brand-pink text-white text-[10px] px-2 py-1 rounded-bl-xl font-bold">HERO</div>}
                           <img 
                              src={product.image} 
                              onError={(e) => (e.currentTarget.src = imagePlaceholder)} 
                              className="w-20 h-20 rounded-xl object-cover bg-gray-50" 
                           />
                           <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-gray-800 dark:text-white truncate">{product.name}</h4>
                              <p className="text-brand-pink font-bold text-sm">₵{product.price.toLocaleString()}</p>
                              <div className="flex gap-3 mt-3">
                                 <button onClick={() => openProductForm(product)} className="text-xs font-bold text-blue-500 hover:underline">Edit</button>
                                 <button onClick={() => handleDeleteProduct(product.id)} className="text-xs font-bold text-red-500 hover:underline">Delete</button>
                                 {heroProductId !== product.id && <button onClick={() => handleSetHero(product.id)} className="text-xs font-bold text-gray-400 hover:text-brand-pink ml-auto">Set Hero</button>}
                              </div>
                           </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="bg-white dark:bg-dark-card p-8 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-white/10 max-w-4xl mx-auto">
                     <h3 className="text-2xl font-serif font-bold mb-8 text-gray-900 dark:text-white">
                       {productForm.id ? 'Refine Fragrance' : 'New Signature Scent'}
                     </h3>
                     <form onSubmit={handleProductSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                             <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Fragrance Name</label>
                             <input required placeholder="e.g. Midnight Jasmine" value={productForm.name || ''} onChange={e => setProductForm({...productForm, name: e.target.value})} className="w-full p-4 rounded-xl bg-gray-50 dark:bg-black/20 dark:text-white border-none" />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Category</label>
                             <input required placeholder="e.g. Floral, Woody, Ladies" value={productForm.category || ''} onChange={e => setProductForm({...productForm, category: e.target.value})} className="w-full p-4 rounded-xl bg-gray-50 dark:bg-black/20 dark:text-white border-none" />
                          </div>
                        </div>

                        {/* Image Management Section */}
                        <div className="space-y-6">
                           <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Fragrance Visuals (Primary + Gallery)</label>
                           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                              {imageInputs.map((img, idx) => (
                                <div key={idx} className="space-y-4">
                                   <div className="aspect-square bg-gray-100 dark:bg-black/20 rounded-2xl border-2 border-dashed border-gray-200 dark:border-white/5 flex items-center justify-center relative overflow-hidden group">
                                      {img ? (
                                        <>
                                          <img src={img} onError={(e) => (e.currentTarget.src = imagePlaceholder)} className="w-full h-full object-cover" />
                                          <button 
                                            type="button" 
                                            onClick={() => { const next = [...imageInputs]; next[idx] = ''; setImageInputs(next); }} 
                                            className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                          >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                          </button>
                                        </>
                                      ) : (
                                        <div className="text-center p-4">
                                           <svg className="w-10 h-10 text-gray-300 mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                           <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{idx === 0 ? 'Main Photo' : `Gallery ${idx}`}</span>
                                        </div>
                                      )}
                                   </div>
                                   
                                   <div className="space-y-3">
                                      {/* Mode Toggle */}
                                      <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-lg">
                                        <button 
                                          type="button"
                                          onClick={() => toggleInputMode(idx, 'url')}
                                          className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all ${imageInputModes[idx] === 'url' ? 'bg-white dark:bg-dark-card shadow-sm text-brand-pink' : 'text-gray-400'}`}
                                        >
                                          LINK
                                        </button>
                                        <button 
                                          type="button"
                                          onClick={() => toggleInputMode(idx, 'file')}
                                          className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all ${imageInputModes[idx] === 'file' ? 'bg-white dark:bg-dark-card shadow-sm text-brand-pink' : 'text-gray-400'}`}
                                        >
                                          LOCAL
                                        </button>
                                      </div>

                                      {/* Inputs */}
                                      {imageInputModes[idx] === 'url' ? (
                                        <input 
                                          type="text" 
                                          placeholder="https://..." 
                                          value={img} 
                                          onChange={e => handleImageUrlChange(idx, e.target.value)} 
                                          className="w-full p-3 rounded-xl bg-gray-100 dark:bg-white/5 text-[10px] dark:text-white border-none focus:ring-1 focus:ring-brand-pink/30"
                                        />
                                      ) : (
                                        <div className="relative">
                                          <input 
                                            type="file" 
                                            accept="image/*" 
                                            onChange={e => handleFileUpload(idx, e)} 
                                            className="hidden" 
                                            id={`file-input-${idx}`}
                                          />
                                          <label 
                                            htmlFor={`file-input-${idx}`}
                                            className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-gray-100 dark:bg-white/5 text-[10px] font-bold text-gray-500 cursor-pointer hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                                          >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                                            CHOOSE FILE
                                          </label>
                                        </div>
                                      )}
                                   </div>
                                </div>
                              ))}
                           </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                           <div className="space-y-2">
                             <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Retail Price (₵)</label>
                             <input required type="number" step="0.01" placeholder="0.00" value={productForm.price || ''} onChange={e => setProductForm({...productForm, price: parseFloat(e.target.value)})} className="w-full p-4 rounded-xl bg-gray-50 dark:bg-black/20 dark:text-white border-none" />
                           </div>
                           <div className="space-y-2">
                             <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Inventory Level</label>
                             <input required type="number" placeholder="Units available" value={productForm.stock ?? ''} onChange={e => setProductForm({...productForm, stock: parseInt(e.target.value)})} className="w-full p-4 rounded-xl bg-gray-50 dark:bg-black/20 dark:text-white border-none" />
                           </div>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Olfactory Palette (Comma separated notes)</label>
                           <input placeholder="e.g. Calabrian Bergamot, Sichuan Pepper, Ambroxan" value={notesInput} onChange={e => setNotesInput(e.target.value)} className="w-full p-4 rounded-xl bg-gray-50 dark:bg-black/20 dark:text-white border-none" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Backstory & Experience</label>
                           <textarea required placeholder="Describe the soul of this fragrance..." rows={5} value={productForm.description || ''} onChange={e => setProductForm({...productForm, description: e.target.value})} className="w-full p-4 rounded-xl bg-gray-50 dark:bg-black/20 dark:text-white border-none resize-none" />
                        </div>
                        <div className="flex gap-4 pt-6">
                           <Button type="submit" className="flex-1 py-4 text-sm font-bold tracking-widest uppercase">Commit to Catalog</Button>
                           <button type="button" onClick={() => setIsEditingProduct(false)} className="flex-1 py-4 font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">Discard Draft</button>
                        </div>
                     </form>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-gray-200 dark:border-white/10 overflow-hidden animate-fade-in">
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left whitespace-nowrap">
                    <thead className="bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/10">
                      <tr>
                        <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">ID</th>
                        <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date</th>
                        <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Customer</th>
                        <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total</th>
                        <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                        <th className="p-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Update</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map(order => (
                        <tr key={order.id} className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5">
                          <td className="p-4 text-xs font-mono text-gray-500">{order.id.slice(-8)}</td>
                          <td className="p-4 text-xs text-gray-600 dark:text-gray-400">{order.date}</td>
                          <td className="p-4 text-sm font-bold">{order.shippingAddress.firstName}</td>
                          <td className="p-4 text-sm font-bold text-brand-pink">₵{order.total.toLocaleString()}</td>
                          <td className="p-4">
                             <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusColor(order.status)}`}>
                               {order.status}
                             </span>
                          </td>
                          <td className="p-4 text-right">
                             <select 
                               value={order.status} 
                               onChange={(e) => handleStatusUpdate(order.id, e.target.value as Order['status'])}
                               className="bg-gray-100 dark:bg-black/20 border-none rounded-lg text-xs py-1 px-2 font-bold"
                             >
                               <option value="Order Confirmed">Confirmed</option>
                               <option value="Processing">Process</option>
                               <option value="Shipped">Ship</option>
                               <option value="Delivered">Finish</option>
                               <option value="Cancelled">Cancel</option>
                             </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'promotions' && (
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
                 <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-gray-200 dark:border-white/10 p-6 sm:p-8">
                    <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Active Promos</h3>
                    
                    {/* Fixed Promo Form for mobile */}
                    <form onSubmit={handleAddPromo} className="flex flex-col sm:flex-row gap-3 mb-10">
                       <div className="flex-[2] relative">
                          <input required placeholder="CODE" value={promoCode} onChange={e => setPromoCode(e.target.value)} className="w-full p-4 rounded-xl bg-gray-50 dark:bg-black/20 dark:text-white border-none text-sm font-bold uppercase tracking-wider" />
                       </div>
                       <div className="flex-1 relative">
                          <input required type="number" placeholder="%" value={promoDiscount} onChange={e => setPromoDiscount(parseInt(e.target.value))} className="w-full p-4 rounded-xl bg-gray-50 dark:bg-black/20 dark:text-white border-none text-sm font-bold" />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">%</span>
                       </div>
                       <Button type="submit" className="whitespace-nowrap sm:w-auto w-full px-8">Add</Button>
                    </form>

                    <div className="space-y-4">
                       {promos.length === 0 ? (
                         <div className="text-center py-10 text-gray-400 italic text-sm">No active promotions.</div>
                       ) : (
                         promos.map(p => (
                           <div key={p.code} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-transparent hover:border-brand-pink/20 transition-all group">
                              <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 rounded-full bg-brand-pink/10 text-brand-pink flex items-center justify-center font-bold text-xs">
                                   %
                                 </div>
                                 <div>
                                   <p className="font-bold text-gray-800 dark:text-white tracking-wide">{p.code}</p>
                                   <p className="text-[10px] font-bold text-brand-pink uppercase tracking-widest">{p.discount}% OFF ENTIRE BAG</p>
                                 </div>
                              </div>
                              <button 
                                onClick={() => handleRemovePromo(p.code)} 
                                className="text-gray-300 hover:text-red-500 p-2 transition-colors"
                                title="Remove Promo"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                              </button>
                           </div>
                         ))
                       )}
                    </div>
                 </div>
                 
                 <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-gray-200 dark:border-white/10 p-6 sm:p-8">
                    <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Rates & Logistics</h3>
                    <form onSubmit={handleUpdateSettings} className="space-y-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Free Shipping Threshold (₵)</label>
                          <div className="relative">
                            <input type="number" value={settings.freeShippingThreshold} onChange={e => setSettings({...settings, freeShippingThreshold: parseInt(e.target.value)})} className="w-full p-4 rounded-xl bg-gray-50 dark:bg-black/20 dark:text-white border-none font-bold text-sm" />
                          </div>
                          <p className="text-[9px] text-gray-500 italic mt-1">Orders above this amount will not be charged standard shipping fees.</p>
                       </div>
                       
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Std Shipping (₵)</label>
                            <input type="number" value={settings.standardShippingRate} onChange={e => setSettings({...settings, standardShippingRate: parseInt(e.target.value)})} className="w-full p-4 rounded-xl bg-gray-50 dark:bg-black/20 dark:text-white border-none font-bold text-sm" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Express Shipping (₵)</label>
                            <input type="number" value={settings.expressShippingRate} onChange={e => setSettings({...settings, expressShippingRate: parseInt(e.target.value)})} className="w-full p-4 rounded-xl bg-gray-50 dark:bg-black/20 dark:text-white border-none font-bold text-sm" />
                          </div>
                       </div>

                       <div className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Gift Wrapping (₵)</label>
                          <input type="number" value={settings.giftWrapRate} onChange={e => setSettings({...settings, giftWrapRate: parseInt(e.target.value)})} className="w-full p-4 rounded-xl bg-gray-50 dark:bg-black/20 dark:text-white border-none font-bold text-sm" />
                       </div>

                       <Button type="submit" className="w-full py-4 uppercase tracking-widest text-xs font-bold mt-4">Save Logistics Logic</Button>
                    </form>
                 </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
