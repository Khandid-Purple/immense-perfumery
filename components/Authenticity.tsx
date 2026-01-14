
import React from 'react';
import { SEO } from './SEO';

const Authenticity: React.FC = () => {
  return (
    <div className="animate-fade-in py-16 px-6 max-w-4xl mx-auto">
      <SEO title="Authenticity Guarantee" description="Learn about Immense Perfumery's commitment to 100% original, genuine fragrances sourced directly from authorized global distributors." />
      
      <div className="text-center mb-16">
        <div className="w-20 h-20 bg-pink-50 dark:bg-pink-900/20 rounded-full flex items-center justify-center mx-auto mb-8 text-brand-pink">
           <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
        </div>
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 dark:text-white mb-6">Guaranteed Original</h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg">In a world of imitations, we stand for the Immense truth.</p>
      </div>

      <div className="space-y-12">
         {[
           {
             title: "Direct Sourcing",
             text: "We bypass middlemen to source directly from authorized fragrance houses and verified global distributors. This ensures the chain of custody remains unbroken from the perfumer to your doorstep."
           },
           {
             title: "Batch Code Verification",
             text: "Every bottle in our collection features a valid manufacturer batch code. We encourage our customers to verify these codes on global databases to confirm production dates and authenticity."
           },
           {
             title: "Original Packaging",
             text: "All fragrances are delivered in their original retail packaging, complete with cellophane seals where provided by the manufacturer. We do not sell 'testers' or unboxed units unless explicitly stated."
           }
         ].map((item, idx) => (
           <div key={idx} className="bg-white dark:bg-dark-card p-8 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                 <span className="text-brand-pink text-sm">0{idx + 1}.</span> {item.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{item.text}</p>
           </div>
         ))}
      </div>

      <div className="mt-20 p-10 bg-gray-900 text-white rounded-[2.5rem] text-center">
         <h2 className="text-2xl font-serif mb-4">The Immense Promise</h2>
         <p className="text-gray-400 mb-8 max-w-lg mx-auto italic">"If any product purchased from us is proven to be anything less than 100% genuine, we offer an immediate full refund and a personal apology from our founder."</p>
         <div className="font-serif text-brand-pink font-bold text-xl">Immense Perfumery Collects</div>
      </div>
    </div>
  );
};

export default Authenticity;
