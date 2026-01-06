
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/Button';
import { useToast } from '../context/ToastContext';
import { Address } from '../types';
import DeliveryMap from './DeliveryMap';
import { GHANA_REGIONS } from '../services/api';

const Account: React.FC = () => {
  const { user, logout, updateProfile, addAddress, removeAddress, cancelOrder, refreshUser } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'orders'>('profile');
  
  // Refresh user data when orders tab is active to get latest status updates
  useEffect(() => {
    if (activeTab === 'orders') {
      refreshUser();
    }
  }, [activeTab]);
  
  // Profile Form State
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');

  // Address Form State
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState<Omit<Address, 'id'>>({
    label: '',
    firstName: '',
    lastName: '',
    street: '',
    digitalAddress: '',
    region: 'Greater Accra',
    city: '',
    zip: '',
    phone: ''
  });

  // Cancellation State
  const [cancellationOrderId, setCancellationOrderId] = useState<string | null>(null);
  const [cancellationReason, setCancellationReason] = useState<string>('');
  const [otherReason, setOtherReason] = useState<string>('');

  // Tracking State
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);

  if (!user) return null;

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ name, email });
    showToast('Profile updated successfully');
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    addAddress(newAddress);
    setShowAddressForm(false);
    setNewAddress({
      label: '',
      firstName: '',
      lastName: '',
      street: '',
      digitalAddress: '',
      region: 'Greater Accra',
      city: '',
      zip: '',
      phone: ''
    });
    showToast('Address added successfully');
  };

  const handleCancelOrderClick = (orderId: string) => {
    setCancellationOrderId(orderId);
    setCancellationReason('');
    setOtherReason('');
  };

  const confirmCancellation = () => {
    if (!cancellationReason) {
      showToast('Please select a reason for cancellation.', 'info');
      return;
    }
    if (cancellationReason === 'Other' && !otherReason.trim()) {
      showToast('Please specify the reason.', 'info');
      return;
    }
    if (cancellationOrderId) {
      cancelOrder(cancellationOrderId);
      showToast('Order cancelled successfully.', 'success');
      setCancellationOrderId(null);
    }
  };

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

  const inputClass = "w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black/20 border-transparent dark:border-white/5 focus:bg-white dark:focus:bg-black/40 focus:border-brand-pink focus:ring-0 transition-colors text-gray-900 dark:text-white";
  const tabButtonClass = (tabName: string) => 
    `w-full text-left px-6 py-4 transition-colors ${activeTab === tabName ? 'bg-pink-50 dark:bg-white/10 text-brand-pink font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'}`;

  const cancellationReasons = [
    "Changed my mind",
    "Found a better price",
    "Ordered by mistake",
    "Delivery time is too long",
    "Other"
  ];

  return (
    <div className="animate-fade-in py-10 px-6 max-w-5xl mx-auto relative">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar */}
        <div className="w-full md:w-64 flex flex-col gap-2">
          <div className="bg-white dark:bg-dark-card p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-white/10 mb-4 text-center">
             <div className="w-20 h-20 bg-brand-pink text-white rounded-full flex items-center justify-center text-3xl font-serif font-bold mx-auto mb-4">
               {user.name.charAt(0).toUpperCase()}
             </div>
             <h2 className="font-bold text-gray-900 dark:text-white">{user.name}</h2>
             <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
          </div>
          
          <div className="bg-white dark:bg-dark-card rounded-3xl shadow-sm border border-gray-100 dark:border-white/10 overflow-hidden">
             <button onClick={() => setActiveTab('profile')} className={tabButtonClass('profile')}>
               Profile Info
             </button>
             <button onClick={() => setActiveTab('addresses')} className={tabButtonClass('addresses')}>
               Saved Addresses
             </button>
             <button onClick={() => setActiveTab('orders')} className={tabButtonClass('orders')}>
               Order History
             </button>
             <button 
               onClick={logout}
               className="w-full text-left px-6 py-4 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors border-t border-gray-100 dark:border-white/10"
             >
               Sign Out
             </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white dark:bg-dark-card p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-white/10 min-h-[500px]">
          
          {activeTab === 'profile' && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white mb-6">Profile Information</h2>
              <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-md">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <Button type="submit">Save Changes</Button>
              </form>
            </div>
          )}

          {activeTab === 'addresses' && (
            <div className="animate-fade-in">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white">Saved Addresses</h2>
                {!showAddressForm && (
                  <Button variant="outline" onClick={() => setShowAddressForm(true)} className="text-sm py-2 px-4">
                    + Add New
                  </Button>
                )}
              </div>

              {showAddressForm ? (
                 <form onSubmit={handleAddAddress} className="bg-gray-50 dark:bg-white/5 p-6 rounded-2xl mb-6 border border-gray-100 dark:border-white/10">
                    <h3 className="font-bold text-gray-800 dark:text-white mb-4">New Address</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                       <input placeholder="Label (e.g. Home)" required value={newAddress.label} onChange={e => setNewAddress({...newAddress, label: e.target.value})} className={inputClass} />
                       <input placeholder="Phone" required value={newAddress.phone} onChange={e => setNewAddress({...newAddress, phone: e.target.value})} className={inputClass} />
                       <input placeholder="First Name" required value={newAddress.firstName} onChange={e => setNewAddress({...newAddress, firstName: e.target.value})} className={inputClass} />
                       <input placeholder="Last Name" required value={newAddress.lastName} onChange={e => setNewAddress({...newAddress, lastName: e.target.value})} className={inputClass} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <select 
                        required 
                        value={newAddress.region} 
                        onChange={e => setNewAddress({...newAddress, region: e.target.value})} 
                        className={inputClass}
                      >
                        {GHANA_REGIONS.map(region => (
                          <option key={region} value={region}>{region}</option>
                        ))}
                      </select>
                      <input placeholder="Digital Address (e.g. GA-123-4567)" value={newAddress.digitalAddress} onChange={e => setNewAddress({...newAddress, digitalAddress: e.target.value})} className={inputClass} />
                    </div>
                    <div className="space-y-4 mb-6">
                      <input placeholder="Street Address" required value={newAddress.street} onChange={e => setNewAddress({...newAddress, street: e.target.value})} className={inputClass} />
                      <div className="grid grid-cols-2 gap-4">
                        <input placeholder="City / Town" required value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} className={inputClass} />
                        <input placeholder="Postal Code (Optional)" value={newAddress.zip} onChange={e => setNewAddress({...newAddress, zip: e.target.value})} className={inputClass} />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit">Save Address</Button>
                      <button type="button" onClick={() => setShowAddressForm(false)} className="px-6 py-2 rounded-full font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">Cancel</button>
                    </div>
                 </form>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {user.addresses.map((addr) => (
                    <div key={addr.id} className="border border-gray-200 dark:border-white/10 rounded-2xl p-5 relative group hover:border-brand-pink transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <span className="bg-pink-100 dark:bg-pink-900/30 text-brand-pink text-xs font-bold px-2 py-1 rounded">{addr.label}</span>
                        <button onClick={() => removeAddress(addr.id)} className="text-gray-400 hover:text-red-500">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                      </div>
                      <p className="font-bold text-gray-800 dark:text-white">{addr.firstName} {addr.lastName}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{addr.street}</p>
                      {addr.digitalAddress && (
                        <p className="text-[10px] font-bold text-brand-pink bg-pink-50 dark:bg-pink-900/20 px-2 py-1 rounded inline-block mt-2 tracking-wider">
                           GPS: {addr.digitalAddress}
                        </p>
                      )}
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{addr.city}, {addr.region}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{addr.phone}</p>
                    </div>
                  ))}
                  {user.addresses.length === 0 && (
                    <div className="col-span-full text-center py-10 text-gray-500 dark:text-gray-400">
                      No addresses saved yet.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="animate-fade-in">
               <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white mb-6">Order History</h2>
               {!user.orders || user.orders.length === 0 ? (
                  <div className="text-center py-10">
                    <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                       <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="2" width="12" height="20" rx="2" ry="2"></rect><line x1="6" y1="18" x2="18" y2="18"></line></svg>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400">You haven't placed any orders yet.</p>
                  </div>
               ) : (
                 <div className="space-y-6">
                    {user.orders.map(order => (
                      <div key={order.id} className="border border-gray-100 dark:border-white/10 rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
                         <div className="bg-gray-50 dark:bg-white/5 p-4 flex flex-wrap justify-between items-center gap-4 border-b border-gray-100 dark:border-white/10">
                            <div>
                               <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-bold">Order ID</p>
                               <p className="text-sm text-gray-800 dark:text-gray-200 font-mono">{order.id}</p>
                            </div>
                            <div>
                               <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-bold">Order Placed</p>
                               <p className="text-sm text-gray-800 dark:text-gray-200">{order.date}</p>
                            </div>
                            <div>
                               <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-bold">Total</p>
                               <p className="text-sm text-gray-800 dark:text-gray-200 font-bold">₵{order.total.toLocaleString()}</p>
                            </div>
                             <div>
                               <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-bold">Ship To</p>
                               <p className="text-sm text-gray-800 dark:text-gray-200">{order.shippingAddress.label} </p>
                            </div>
                            <div className="flex items-center gap-2">
                               <span className={`${getStatusColor(order.status)} px-3 py-1 rounded-full text-xs font-bold`}>
                                 {order.status}
                               </span>
                               
                               {/* Track Order Button */}
                               {order.status !== 'Cancelled' && (
                                 <button 
                                  onClick={() => setTrackingOrderId(trackingOrderId === order.id ? null : order.id)}
                                  className="text-xs flex items-center gap-1 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 px-3 py-1 rounded-full hover:bg-gray-50 dark:hover:bg-white/5"
                                 >
                                   <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon><line x1="8" y1="2" x2="8" y2="18"></line><line x1="16" y1="6" x2="16" y2="22"></line></svg>
                                   {trackingOrderId === order.id ? 'Hide Map' : 'Track'}
                                 </button>
                               )}

                               {(order.status === 'Processing' || order.status === 'Order Confirmed') && (
                                 <button 
                                   onClick={() => handleCancelOrderClick(order.id)}
                                   className="text-xs font-medium text-red-500 hover:text-red-700 underline ml-2"
                                 >
                                   Cancel
                                 </button>
                               )}
                            </div>
                         </div>
                         
                         {/* Map Integration */}
                         {trackingOrderId === order.id && (
                           <div className="border-b border-gray-100 dark:border-white/10 animate-fade-in p-4 bg-gray-50 dark:bg-black/10">
                             <DeliveryMap status={order.status} />
                           </div>
                         )}

                         <div className="p-4 bg-white dark:bg-dark-card">
                            <div className="flex flex-col gap-4">
                               {order.items.map(item => (
                                 <div key={item.id} className="flex gap-4 items-center">
                                    <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover bg-gray-50" />
                                    <div>
                                       <h4 className="font-bold text-gray-800 dark:text-white">{item.name}</h4>
                                       <p className="text-sm text-gray-500 dark:text-gray-400">Qty: {item.quantity}</p>
                                    </div>
                                 </div>
                               ))}

                               {/* Display Order Note if it exists */}
                               {order.orderNote && (
                                 <div className="mt-4 p-4 rounded-xl bg-pink-50 dark:bg-white/5 border border-pink-100 dark:border-white/10 italic text-sm text-gray-600 dark:text-gray-300">
                                    <p className="text-[10px] font-bold text-brand-pink uppercase tracking-widest not-italic mb-1">Your Note:</p>
                                    "{order.orderNote}"
                                 </div>
                               )}
                            </div>
                         </div>
                      </div>
                    ))}
                 </div>
               )}
            </div>
          )}
        </div>
      </div>

      {/* Cancellation Modal */}
      {cancellationOrderId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setCancellationOrderId(null)}></div>
          <div className="bg-white dark:bg-dark-card rounded-3xl p-8 max-w-md w-full relative shadow-2xl animate-fade-in-up border border-gray-100 dark:border-white/10">
             <h3 className="text-xl font-serif font-bold text-gray-900 dark:text-white mb-4">Cancel Order</h3>
             <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">Are you sure you want to cancel this order? This action cannot be undone.</p>
             
             <div className="space-y-3 mb-6">
                <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Reason for cancellation:</p>
                {cancellationReasons.map(reason => (
                  <label key={reason} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5">
                    <input 
                      type="radio" 
                      name="cancelReason" 
                      value={reason} 
                      checked={cancellationReason === reason}
                      onChange={(e) => setCancellationReason(e.target.value)}
                      className="text-brand-pink focus:ring-brand-pink"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{reason}</span>
                  </label>
                ))}
                
                {cancellationReason === 'Other' && (
                  <textarea 
                    placeholder="Please specify..."
                    value={otherReason}
                    onChange={(e) => setOtherReason(e.target.value)}
                    className="w-full mt-2 p-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/20 text-sm focus:outline-none focus:border-brand-pink"
                    rows={3}
                  />
                )}
             </div>

             <div className="flex gap-3">
                <Button variant="outline" onClick={() => setCancellationOrderId(null)} className="flex-1">
                  Keep Order
                </Button>
                <Button 
                  onClick={confirmCancellation} 
                  className="flex-1 bg-red-500 hover:bg-red-600 border-red-500 shadow-none"
                >
                  Confirm Cancel
                </Button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Account;
