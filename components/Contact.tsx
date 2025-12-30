
import React, { useState } from 'react';
import { Button } from './ui/Button';
import { useToast } from '../context/ToastContext';
import { SEO } from './SEO';

const Contact: React.FC = () => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const WHATSAPP_NUMBER = "233242802741";
  const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=Bonjour! I would like to consult with a scent expert about your collection. ✨`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate form submission
    showToast('Your message has been received. Our concierge will contact you shortly.', 'success');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "PerfumeStore",
    "name": "Immense Perfumery Collects",
    "image": "https://images.unsplash.com/photo-1541643600914-78b084683601",
    "telephone": "+233 24 280 2741",
    "email": "concierge@immenseperfumery.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "ACP Estate",
      "addressLocality": "Accra",
      "addressRegion": "Greater Accra",
      "addressCountry": "GH"
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "09:00",
        "closes": "19:00"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": "Saturday",
        "opens": "10:00",
        "closes": "18:00"
      }
    ]
  };

  return (
    <div className="animate-fade-in py-16 px-6 max-w-7xl mx-auto">
      <SEO 
        title="Concierge & Contact" 
        description="Connect with Immense Perfumery in ACP Estate, Accra. Consult with our scent experts via WhatsApp or visit our boutique."
        schema={localBusinessSchema}
      />
      
      <div className="flex flex-col items-center text-center mb-16">
        <span className="text-brand-pink font-bold tracking-[0.3em] uppercase text-xs mb-4 opacity-80">Personalized Service</span>
        <h1 className="text-4xl md:text-6xl font-serif font-bold text-gray-900 dark:text-white mb-6 transition-colors">How can we assist you?</h1>
        <div className="w-20 h-1 bg-brand-pink/20 rounded-full"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
        {/* Contact Info Card */}
        <div className="lg:col-span-5 bg-gray-900 text-white rounded-[2.5rem] p-8 md:p-12 flex flex-col justify-between relative overflow-hidden shadow-2xl">
          {/* Decorative radial gradients */}
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-brand-pink/20 rounded-full blur-[100px]"></div>
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-brand-pink/10 rounded-full blur-[80px]"></div>
          
          <div className="space-y-10 relative z-10">
            <div>
              <h3 className="text-sm font-bold text-brand-pink uppercase tracking-widest mb-4">The Boutique</h3>
              <p className="text-2xl font-serif mb-2 text-white">Immense Perfumery Collects</p>
              <p className="text-gray-400 leading-relaxed">ACP Estate<br />Accra, Ghana</p>
              <a 
                href="https://maps.app.goo.gl/oEkBFSauFLofJ2KA7" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center gap-2 mt-4 text-brand-pink hover:text-white transition-colors text-sm font-bold group"
              >
                 <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><polygon points="3 11 22 2 13 21 11 13 3 11"></polygon></svg>
                 GET DIRECTIONS
              </a>
            </div>
            
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-brand-pink uppercase tracking-widest">Connect Directly</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4 group cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-brand-pink group-hover:bg-brand-pink group-hover:text-white transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold">Email Us</p>
                    <p className="text-sm font-medium">concierge@immenseperfumery.com</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 group cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-brand-pink group-hover:bg-brand-pink group-hover:text-white transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.12 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold">Call Us</p>
                    <p className="text-sm font-medium">+233 24 280 2741</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center">
                   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                </div>
                <div>
                  <h4 className="font-bold text-white">Scent Expert</h4>
                  <p className="text-xs text-green-500 font-bold uppercase tracking-wider">Online Now</p>
                </div>
              </div>
              <p className="text-xs text-gray-400 mb-4 leading-relaxed">Chat with us live for instant fragrance recommendations and order updates.</p>
              <a 
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-green-900/20"
              >
                WHATSAPP CHAT
              </a>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-white/5 flex flex-col gap-4">
             <p className="text-[10px] text-gray-500 uppercase font-bold tracking-[0.2em]">Opening Hours</p>
             <div className="flex justify-between text-xs text-gray-400">
               <span>Monday — Friday</span>
               <span className="text-white font-medium">09:00 — 19:00</span>
             </div>
             <div className="flex justify-between text-xs text-gray-400">
               <span>Saturday</span>
               <span className="text-white font-medium">10:00 — 18:00</span>
             </div>
          </div>
        </div>

        {/* Contact Form Section */}
        <div className="lg:col-span-7 flex flex-col justify-center">
           <div className="bg-white dark:bg-dark-card p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-white/10 transition-colors">
              <div className="mb-8">
                <h3 className="text-2xl font-serif font-bold text-gray-900 dark:text-white mb-2">Send a Message</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">We typically respond within 24 hours.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 group">
                       <label htmlFor="name" className="text-xs font-bold text-gray-400 dark:text-gray-500 group-focus-within:text-brand-pink transition-colors uppercase tracking-widest">Full Name</label>
                       <input 
                         type="text" 
                         id="name" 
                         name="name" 
                         required
                         value={formData.name}
                         onChange={handleChange}
                         className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-black/20 border-2 border-transparent focus:border-brand-pink/30 focus:bg-white dark:focus:bg-black/40 transition-all text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-700"
                         placeholder="Enter your name"
                       />
                    </div>
                    <div className="space-y-2 group">
                       <label htmlFor="email" className="text-xs font-bold text-gray-400 dark:text-gray-500 group-focus-within:text-brand-pink transition-colors uppercase tracking-widest">Email Address</label>
                       <input 
                         type="email" 
                         id="email" 
                         name="email" 
                         required
                         value={formData.email}
                         onChange={handleChange}
                         className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-black/20 border-2 border-transparent focus:border-brand-pink/30 focus:bg-white dark:focus:bg-black/40 transition-all text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-700"
                         placeholder="your@email.com"
                       />
                    </div>
                 </div>
                 <div className="space-y-2 group">
                     <label htmlFor="subject" className="text-xs font-bold text-gray-400 dark:text-gray-500 group-focus-within:text-brand-pink transition-colors uppercase tracking-widest">Inquiry Type</label>
                     <select 
                       id="subject" 
                       name="subject" 
                       required
                       value={formData.subject}
                       onChange={handleChange as any}
                       className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-black/20 border-2 border-transparent focus:border-brand-pink/30 focus:bg-white dark:focus:bg-black/40 transition-all text-gray-900 dark:text-white appearance-none"
                     >
                       <option value="">Select a category</option>
                       <option value="Scent Consultation">Scent Consultation</option>
                       <option value="Order Status">Order Status</option>
                       <option value="Corporate Gifting">Corporate Gifting</option>
                       <option value="Other">Other</option>
                     </select>
                 </div>
                 <div className="space-y-2 group">
                     <label htmlFor="message" className="text-xs font-bold text-gray-400 dark:text-gray-500 group-focus-within:text-brand-pink transition-colors uppercase tracking-widest">Your Message</label>
                     <textarea 
                       id="message" 
                       name="message" 
                       required
                       rows={6}
                       value={formData.message}
                       onChange={handleChange}
                       className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-black/20 border-2 border-transparent focus:border-brand-pink/30 focus:bg-white dark:focus:bg-black/40 transition-all resize-none text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-700"
                       placeholder="How can our concierge help you today?"
                     ></textarea>
                 </div>
                 <Button type="submit" className="w-full py-5 text-lg font-serif tracking-widest shadow-brand-pink/20 uppercase">
                    Submit Inquiry
                 </Button>
              </form>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
