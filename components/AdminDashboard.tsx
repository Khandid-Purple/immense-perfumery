
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

  // Order Details State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Product Form State
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [notesInput, setNotesInput] = useState('');
  
  // Helper state for images inputs
  const [imageInputs, setImageInputs] = useState<string[]>(['', '', '', '']);
  const [imageInputModes, setImageInputModes] = useState<('url' | 'file')[]>(['url', 'url', 'url', 'url']);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

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
      refreshProducts(); // Update frontend context
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
      const newImages = ['', '', '', ''];
      const newModes: ('url' | 'file')[] = ['url', 'url', 'url', 'url'];
      
      if (product.images && product.images.length > 0) {
        product.images.slice(0, 4).forEach((img, idx) => {
          newImages[idx] = img;
          if (img.startsWith('data:')) newModes[idx] = 'file';
        });
      } else if (product.image) {
        newImages[0] = product.image;
        if (product.image.startsWith('data:')) newModes[0] = 'file';
      }
      setImageInputs(newImages);
      setImageInputModes(newModes);
    } else {
      setProductForm({ name: '', category: '', price: 0, description: '', image: '', images: [], notes: [], stock: 0 });
      setNotesInput('');
      setImageInputs(['', '', '', '']);
      setImageInputModes(['url', 'url', 'url', 'url']);
    }
    setIsEditingProduct(true);
  };

  const handleFileUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
         const newInputs = [...imageInputs];
         newInputs[index] = reader.result as string;
         setImageInputs(newInputs);
      };
      reader.readAsDataURL(file);
    }
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
    const mainImage = validImages.length > 0 ? validImages[0] : (productForm.image || 'https://picsum.photos/400/600');

    const payload = {
      ...productForm,
      image: mainImage,
      images: validImages,
      notes: notesArray,
      stock: Number(productForm.stock) || 0,
      price: Number(productForm.price) || 0
    };

    try {
      if (productForm.id) {
        await api.products.update(payload as Product);
        showToast('Product updated', 'success');
      } else {
        const newProd = { ...payload, rating: 5, reviews: 0 };
        await api.products.add(newProd as any);
        showToast('Product added', 'success');
      }
      setIsEditingProduct(false);
      fetchData();
      refreshProducts();
    } catch (e) {
      showToast('Failed to save product', 'info');
    }
  };

  const totalRevenue = orders.reduce((acc, order) => order.status !== 'Cancelled' ? acc + order.total : acc, 0);
  const totalOrders = orders.length;
  const totalProducts = products.length;
  const totalCustomers = customers.length;
  const recentOrders = orders.slice(0, 5);

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg p-4 md:p-6 animate-fade-in pb-20">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          </div>
          
          <div className="w-full md:w-auto max-w-[calc(100vw-2rem)] overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            <div className="flex gap-2 bg-white dark:bg-dark-card p-1 rounded-xl shadow-sm border border-gray-100 dark:border-white/10 whitespace-nowrap min-w-max">
               {(['overview', 'orders', 'products', 'customers', 'promotions'] as const).map(tab => (
                 <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeTab === tab 
                        ? 'bg-brand-pink text-white shadow-md' 
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'
                    }`}
                 >
                   {tab.charAt(0).toUpperCase() + tab.slice(1)}
                 </button>
               ))}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-pink"></div>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <div className="space-y-6 md:space-y-8 animate-fade-in">
                 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    <div className="bg-white dark:bg-dark-card p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/10">
                       <p className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400">Revenue</p>
                       <p className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white mt-1 md:mt-2">₵{totalRevenue.toLocaleString()}</p>
                    </div>
                    <div className="bg-white dark:bg-dark-card p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/10">
                       <p className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400">Orders</p>
                       <p className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white mt-1 md:mt-2">{totalOrders}</p>
                    </div>
                    <div className="bg-white dark:bg-dark-card p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/10">
                       <p className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400">Products</p>
                       <p className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white mt-1 md:mt-2">{totalProducts}</p>
                    </div>
                    <div className="bg-white dark:bg-dark-card p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/10">
                       <p className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400">Customers</p>
                       <p className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white mt-1 md:mt-2">{totalCustomers}</p>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-gray-200 dark:border-white/10 p-6">
                       <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Top Performing Products</h3>
                       <div className="space-y-6">
                          {productPerformance.slice(0, 5).map((prod, idx) => (
                             <div key={idx} className="relative">
                                <div className="flex justify-between items-center mb-2 z-10 relative">
                                   <div className="flex items-center gap-3">
                                      <span className="text-xs font-bold text-gray-400 w-4">{idx + 1}</span>
                                      <img src={prod.image} alt={prod.name} className="w-8 h-8 rounded-md object-cover bg-gray-100" />
                                      <div>
                                        <p className="text-sm font-bold text-gray-800 dark:text-white line-clamp-1">{prod.name}</p>
                                        <p className="text-xs text-gray-500">{prod.sold} sold</p>
                                      </div>
                                   </div>
                                   <p className="text-sm font-bold text-brand-pink">₵{prod.revenue.toLocaleString()}</p>
                                </div>
                                <div className="h-1.5 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                                   <div className="h-full bg-brand-pink rounded-full opacity-60" style={{ width: `${(prod.sold / maxSold) * 100}%` }}></div>
                                </div>
                             </div>
                          ))}
                          {productPerformance.length === 0 && <p className="text-gray-500 text-sm text-center py-4">No sales data available yet.</p>}
                       </div>
                    </div>
                    <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-gray-200 dark:border-white/10 p-6 flex flex-col">
                       <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Recent Orders</h3>
                       <div className="flex-1 overflow-y-auto space-y-4 scrollbar-hide">
                          {recentOrders.map(order => (
                            <div key={order.id} className="flex justify-between items-center border-b border-gray-50 dark:border-white/5 pb-3 last:border-0 last:pb-0">
                               <div>
                                  <p className="text-sm font-bold text-gray-800 dark:text-white">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                                  <p className="text-xs text-gray-500">{order.date}</p>
                               </div>
                               <div className="text-right">
                                  <p className="text-sm font-bold text-gray-900 dark:text-white">₵{order.total.toLocaleString()}</p>
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${getStatusColor(order.status)}`}>{order.status}</span>
                               </div>
                            </div>
                          ))}
                       </div>
                       <div className="mt-4 text-center border-t border-gray-100 dark:border-white/5 pt-4">
                          <button onClick={() => setActiveTab('orders')} className="text-sm text-brand-pink font-medium hover:underline">View All Orders</button>
                       </div>
                    </div>
                 </div>
              </div>
            )}

            {activeTab === 'promotions' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
                 {/* Discount Codes */}
                 <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-gray-200 dark:border-white/10 p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Discount Codes</h3>
                    <form onSubmit={handleAddPromo} className="flex gap-2 mb-8">
                       <input 
                         required 
                         placeholder="Code (e.g. SAVEDAY)" 
                         value={promoCode}
                         onChange={e => setPromoCode(e.target.value)}
                         className="flex-1 p-3 rounded-xl bg-gray-50 dark:bg-black/20 dark:text-white border-none text-sm"
                       />
                       <input 
                         required 
                         type="number" 
                         min="1" max="100"
                         placeholder="%" 
                         value={promoDiscount}
                         onChange={e => setPromoDiscount(parseInt(e.target.value))}
                         className="w-20 p-3 rounded-xl bg-gray-50 dark:bg-black/20 dark:text-white border-none text-sm"
                       />
                       <Button type="submit">Add</Button>
                    </form>
                    <div className="space-y-3">
                       {promos.map(p => (
                         <div key={p.code} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-white/5 rounded-xl">
                            <div>
                               <p className="text-sm font-bold">{p.code}</p>
                               <p className="text-xs text-gray-500">{p.discount}% Off</p>
                            </div>
                            <button onClick={() => handleRemovePromo(p.code)} className="text-red-500 hover:text-red-700">
                               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                         </div>
                       ))}
                    </div>
                 </div>

                 {/* Free Order Schemes & Rates */}
                 <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-gray-200 dark:border-white/10 p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Free Order Scheme & Rates</h3>
                    <form onSubmit={handleUpdateSettings} className="space-y-6">
                       <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Free Shipping Threshold (₵)</label>
                          <input 
                            type="number"
                            value={settings.freeShippingThreshold}
                            onChange={e => setSettings({...settings, freeShippingThreshold: parseInt(e.target.value)})}
                            className="w-full p-3 rounded-xl bg-gray-50 dark:bg-black/20 dark:text-white border-none"
                          />
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Standard Rate (₵)</label>
                            <input 
                              type="number"
                              value={settings.standardShippingRate}
                              onChange={e => setSettings({...settings, standardShippingRate: parseInt(e.target.value)})}
                              className="w-full p-3 rounded-xl bg-gray-50 dark:bg-black/20 dark:text-white border-none"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Express Rate (₵)</label>
                            <input 
                              type="number"
                              value={settings.expressShippingRate}
                              onChange={e => setSettings({...settings, expressShippingRate: parseInt(e.target.value)})}
                              className="w-full p-3 rounded-xl bg-gray-50 dark:bg-black/20 dark:text-white border-none"
                            />
                          </div>
                       </div>
                       <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Gift Wrapping Rate (₵)</label>
                          <input 
                            type="number"
                            value={settings.giftWrapRate}
                            onChange={e => setSettings({...settings, giftWrapRate: parseInt(e.target.value)})}
                            className="w-full p-3 rounded-xl bg-gray-50 dark:bg-black/20 dark:text-white border-none"
                          />
                       </div>
                       <Button type="submit" className="w-full">Update Store Settings</Button>
                    </form>
                 </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="animate-fade-in space-y-6">
                <div className="bg-white dark:bg-dark-card p-4 rounded-xl shadow-sm border border-gray-100 dark:border-white/10 flex flex-col md:flex-row gap-4 items-end md:items-center justify-between">
                   <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                     <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Status</label>
                        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-200">
                          <option value="All">All Statuses</option>
                          <option value="Order Confirmed">Order Confirmed</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                     </div>
                     <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">From Date</label>
                        <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-200" />
                     </div>
                     <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">To Date</label>
                        <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-200" />
                     </div>
                   </div>
                </div>

                <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-gray-200 dark:border-white/10 overflow-hidden">
                  <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left whitespace-nowrap">
                      <thead className="bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/10">
                        <tr>
                          <th className="p-4 font-semibold text-gray-700 dark:text-gray-200 text-xs uppercase tracking-wider">Order ID</th>
                          <th className="p-4 font-semibold text-gray-700 dark:text-gray-200 text-xs uppercase tracking-wider">Date</th>
                          <th className="p-4 font-semibold text-gray-700 dark:text-gray-200 text-xs uppercase tracking-wider">Customer</th>
                          <th className="p-4 font-semibold text-gray-700 dark:text-gray-200 text-xs uppercase tracking-wider">Total</th>
                          <th className="p-4 font-semibold text-gray-700 dark:text-gray-200 text-xs uppercase tracking-wider">Status</th>
                          <th className="p-4 font-semibold text-gray-700 dark:text-gray-200 text-xs uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredOrders.map(order => (
                          <tr key={order.id} className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                            <td className="p-4 text-sm text-gray-600 dark:text-gray-300 font-mono">{order.id}</td>
                            <td className="p-4 text-sm text-gray-600 dark:text-gray-300">{order.date}</td>
                            <td className="p-4 text-sm text-gray-800 dark:text-white font-medium">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</td>
                            <td className="p-4 text-sm font-bold text-gray-800 dark:text-white">₵{order.total.toLocaleString()}</td>
                            <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>{order.status}</span></td>
                            <td className="p-4 flex gap-2">
                               <select value={order.status} onChange={(e) => handleStatusUpdate(order.id, e.target.value as Order['status'])} className="bg-gray-100 dark:bg-black/40 border-none rounded-lg text-xs py-1 px-2">
                                  <option value="Order Confirmed">Confirmed</option>
                                  <option value="Processing">Processing</option>
                                  <option value="Shipped">Shipped</option>
                                  <option value="Delivered">Delivered</option>
                                  <option value="Cancelled">Cancelled</option>
                               </select>
                               <button onClick={() => setSelectedOrder(order)} className="p-1 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                               </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Customers Tab */}
            {activeTab === 'customers' && (
              <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-gray-200 dark:border-white/10 overflow-hidden animate-fade-in">
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left whitespace-nowrap">
                    <thead className="bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/10">
                      <tr>
                        <th className="p-4 font-semibold text-gray-700 dark:text-gray-200 text-xs uppercase tracking-wider">Name</th>
                        <th className="p-4 font-semibold text-gray-700 dark:text-gray-200 text-xs uppercase tracking-wider">Email</th>
                        <th className="p-4 font-semibold text-gray-700 dark:text-gray-200 text-xs uppercase tracking-wider">Orders</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers.map(customer => (
                        <tr key={customer.id} className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                          <td className="p-4 text-sm text-gray-800 dark:text-white font-medium">
                            <div className="flex items-center gap-3">
                               <div className="w-8 h-8 bg-brand-pink text-white rounded-full flex items-center justify-center text-xs font-bold">{customer.name.charAt(0)}</div>
                               {customer.name}
                            </div>
                          </td>
                          <td className="p-4 text-sm text-gray-600 dark:text-gray-300">{customer.email}</td>
                          <td className="p-4 text-sm text-gray-800 dark:text-white">{customer.orders.length}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Products Tab */}
            {activeTab === 'products' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex justify-end">
                  <Button onClick={() => openProductForm()}>+ Add Product</Button>
                </div>

                {isEditingProduct ? (
                  <div className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-white/10 max-w-2xl mx-auto">
                     <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">{productForm.id ? 'Edit Product' : 'New Product'}</h3>
                     <form onSubmit={handleProductSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                             <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Name</label>
                             <input required placeholder="Product Name" value={productForm.name || ''} onChange={e => setProductForm({...productForm, name: e.target.value})} className="w-full p-3 rounded-xl bg-gray-50 dark:bg-black/20 dark:text-white border-none" />
                          </div>
                          <div className="space-y-1">
                             <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Category</label>
                             <input required placeholder="Category" value={productForm.category || ''} onChange={e => setProductForm({...productForm, category: e.target.value})} className="w-full p-3 rounded-xl bg-gray-50 dark:bg-black/20 dark:text-white border-none" />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div className="space-y-1">
                             <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Price (₵)</label>
                             <input required type="number" placeholder="Price" value={productForm.price || ''} onChange={e => setProductForm({...productForm, price: parseFloat(e.target.value)})} className="w-full p-3 rounded-xl bg-gray-50 dark:bg-black/20 dark:text-white border-none" />
                           </div>
                           <div className="space-y-1">
                             <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Stock Count</label>
                             <input required type="number" placeholder="Stock" value={productForm.stock ?? ''} onChange={e => setProductForm({...productForm, stock: parseInt(e.target.value)})} className="w-full p-3 rounded-xl bg-gray-50 dark:bg-black/20 dark:text-white border-none" />
                           </div>
                        </div>
                        <div className="space-y-1">
                           <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Fragrance Notes (Comma separated)</label>
                           <input placeholder="e.g. Vanilla, Bergamot, Musk" value={notesInput} onChange={e => setNotesInput(e.target.value)} className="w-full p-3 rounded-xl bg-gray-50 dark:bg-black/20 dark:text-white border-none" />
                        </div>
                        <div className="space-y-1">
                           <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Description</label>
                           <textarea required placeholder="Fragrance backstory and vibe..." rows={4} value={productForm.description || ''} onChange={e => setProductForm({...productForm, description: e.target.value})} className="w-full p-3 rounded-xl bg-gray-50 dark:bg-black/20 dark:text-white border-none" />
                        </div>
                        <div className="flex gap-2 pt-4">
                           <Button type="submit">Save Product</Button>
                           <Button variant="outline" type="button" onClick={() => setIsEditingProduct(false)}>Cancel</Button>
                        </div>
                     </form>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map(product => (
                      <div key={product.id} className="bg-white dark:bg-dark-card p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-white/10 flex gap-4 relative overflow-hidden group hover:border-brand-pink transition-colors">
                         {heroProductId === product.id && <div className="absolute top-0 right-0 bg-brand-pink text-white text-[10px] px-2 py-1 rounded-bl-xl font-bold z-10">HERO</div>}
                         <img src={product.image} alt={product.name} className="w-20 h-20 rounded-xl object-cover bg-gray-50" />
                         <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-800 dark:text-white line-clamp-1">{product.name}</h4>
                            <p className="text-xs text-gray-500 mb-1">{product.category}</p>
                            <div className="flex justify-between items-center">
                              <p className="text-brand-pink font-bold">₵{product.price.toLocaleString()}</p>
                              <p className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${product.stock > 5 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>Stock: {product.stock}</p>
                            </div>
                            <div className="flex gap-3 mt-2">
                               <button onClick={() => openProductForm(product)} className="text-xs text-blue-500 hover:text-blue-700 font-medium">Edit</button>
                               <button onClick={() => handleDeleteProduct(product.id)} className="text-xs text-red-500 hover:text-red-700 font-medium">Delete</button>
                               {heroProductId !== product.id && <button onClick={() => handleSetHero(product.id)} className="text-xs text-brand-pink font-bold hover:underline ml-auto">Hero</button>}
                            </div>
                         </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedOrder(null)}></div>
          <div className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 dark:border-white/10 flex justify-between items-center bg-gray-50 dark:bg-white/5">
              <div><h2 className="text-xl font-bold text-gray-900 dark:text-white font-serif">Order Details</h2><p className="text-xs text-gray-500 font-mono uppercase tracking-widest">{selectedOrder.id}</p></div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
               <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Customer</p><p className="text-sm font-bold">{selectedOrder.shippingAddress.firstName} {selectedOrder.shippingAddress.lastName}</p></div>
                  <div><p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Status</p><span className={`text-xs px-2 py-1 rounded-full font-bold ${getStatusColor(selectedOrder.status)}`}>{selectedOrder.status}</span></div>
               </div>
               <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-3">Items</p>
                  <div className="space-y-3">
                     {selectedOrder.items.map(item => (
                       <div key={item.id} className="flex gap-4 items-center bg-gray-50 dark:bg-white/5 p-2 rounded-xl">
                          <img src={item.image} className="w-12 h-12 object-cover rounded-lg" alt={item.name} />
                          <div className="flex-1"><p className="text-sm font-bold truncate">{item.name}</p><p className="text-[10px] text-gray-500">Qty: {item.quantity}</p></div>
                          <p className="text-sm font-bold">₵{(item.price * item.quantity).toLocaleString()}</p>
                       </div>
                     ))}
                  </div>
               </div>
               <div className="pt-4 border-t border-gray-100 dark:border-white/10 flex justify-between text-lg font-bold">
                  <span>Total Paid</span><span className="text-brand-pink">₵{selectedOrder.total.toLocaleString()}</span>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
