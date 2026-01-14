
import React, { useState } from 'react';
import { SEO } from './SEO';
import { Button } from './ui/Button';
import { useToast } from '../context/ToastContext';

const Wholesale: React.FC = () => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({ company: '', name: '', email: '', phone: '', volume: '10-50 units', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast("Wholesale inquiry received. Our partnership team will contact you.", "success");
    setFormData({ company: '', name: '', email: '', phone: '', volume: '10-50 units', message: '' });
  };

  const inputClass = "w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-black/20 border-2 border-transparent focus:border-brand-pink/30 focus:bg-white dark:focus:bg-black/40 transition-all text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-700";

  return (
    <div className="animate-fade-in py-16 px-6 max-w-5xl mx-auto">
      <SEO title="Wholesale & Corporate" description="Partner with Immense Perfumery for wholesale distribution or premium corporate gifting solutions in Ghana." />
      
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-serif font-bold text-gray-900 dark:text-white mb-6">Business Partnerships</h1>
        <p className="max-w-2xl mx-auto text-gray-500 dark:text-gray-400 text-lg">Elevate your brand or retail collection with the Immense standard of excellence.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
         <div className="space-y-8">
            <div className="bg-white dark:bg-dark-card p-8 rounded-[2rem] border border-gray-100 dark:border-white/10 shadow-sm">
               <h3 className="text-xl font-bold text-brand-pink mb-4">Corporate Gifting</h3>
               <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">Impress your clients and employees with custom-curated fragrance sets. We offer bespoke packaging and handwritten notes for all corporate orders.</p>
            </div>
            <div className="bg-white dark:bg-dark-card p-8 rounded-[2rem] border border-gray-100 dark:border-white/10 shadow-sm">
               <h3 className="text-xl font-bold text-brand-pink mb-4">Retail Distribution</h3>
               <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">Join our network of premium boutiques across West Africa. Gain access to exclusive wholesale pricing and marketing support.</p>
            </div>
         </div>

         <div className="bg-white dark:bg-dark-card p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-white/10">
            <form onSubmit={handleSubmit} className="space-y-6">
               <input placeholder="Company Name" required value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} className={inputClass} />
               <div className="grid grid-cols-2 gap-4">
                  <input placeholder="Contact Name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className={inputClass} />
                  <input placeholder="Phone Number" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className={inputClass} />
               </div>
               <input type="email" placeholder="Business Email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className={inputClass} />
               <select value={formData.volume} onChange={e => setFormData({...formData, volume: e.target.value})} className={inputClass}>
                  <option>10-50 units</option>
                  <option>50-200 units</option>
                  <option>200+ units</option>
               </select>
               <textarea placeholder="Tell us about your requirements..." rows={4} value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className={inputClass + " resize-none"} />
               <Button type="submit" className="w-full py-5 text-lg font-serif tracking-widest uppercase">Send Inquiry</Button>
            </form>
         </div>
      </div>
    </div>
  );
};

export default Wholesale;
