
import React from 'react';
import { SEO } from './SEO';

const About: React.FC = () => {
  return (
    <div className="animate-fade-in py-16 px-6 max-w-7xl mx-auto">
      <SEO 
        title="Our Story" 
        description="Established in 2020, Immense Perfumery creates fragrances that capture the scale of human emotion. Discover our journey from a passion for scents to a premium luxury experience."
      />
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 dark:text-white mb-6 transition-colors">The Immense Story</h1>
        <p className="max-w-2xl mx-auto text-gray-500 dark:text-gray-400 text-lg leading-relaxed transition-colors">
          Capturing the vastness of memory, one drop at a time.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-12 items-center mb-20">
        <div className="w-full md:w-1/2">
           <div className="relative">
              <div className="absolute inset-4 border-2 border-brand-pink/20 rounded-full animate-spin-slow"></div>
              <img 
                src="https://images.unsplash.com/photo-1615485290382-441e4d0c9cb5?q=80&w=1000&auto=format&fit=crop" 
                alt="The art of perfumery" 
                className="rounded-full shadow-2xl w-full h-auto aspect-square object-cover border-8 border-white dark:border-dark-card"
              />
           </div>
        </div>
        <div className="w-full md:w-1/2 space-y-6">
           <h2 className="text-3xl font-serif font-bold text-gray-800 dark:text-gray-100 transition-colors">Established in 2020</h2>
           <p className="text-gray-600 dark:text-gray-300 leading-relaxed transition-colors">
             Immense Perfumery was born in 2020 out of a singular vision: to create fragrances that don't just sit on the skin, but resonate with the soul. We believed that the world needed scents that were as bold and "immense" as the people who wear them.
           </p>
           <p className="text-gray-600 dark:text-gray-300 leading-relaxed transition-colors">
             What started as a boutique exploration of rare botanical oils and exotic musks has grown into a destination for those who seek the extraordinary. Our philosophy is rooted in the "Immense" scale of human emotion—from the quiet confidence of a morning dew to the roaring passion of a midnight gala.
           </p>
           <div className="grid grid-cols-2 gap-6 mt-8">
              <div className="bg-pink-50 dark:bg-white/5 p-6 rounded-2xl text-center border border-transparent dark:border-white/10">
                 <span className="block text-3xl font-bold text-brand-pink mb-2">4+</span>
                 <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Years of Excellence</span>
              </div>
              <div className="bg-pink-50 dark:bg-white/5 p-6 rounded-2xl text-center border border-transparent dark:border-white/10">
                 <span className="block text-3xl font-bold text-brand-pink mb-2">100%</span>
                 <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Curated Quality</span>
              </div>
           </div>
        </div>
      </div>

      <div className="bg-gray-900 dark:bg-black rounded-3xl p-10 md:p-20 text-center text-white relative overflow-hidden shadow-xl border border-white/5">
         <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
         <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-brand-pink/20 rounded-full blur-[100px]"></div>
         <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6 relative z-10">Olfactory Mastery</h2>
         <p className="max-w-3xl mx-auto text-gray-300 mb-8 relative z-10 text-lg font-light italic">
           "A signature scent is more than a fragrance; it is the silent introduction you give to the world. At Immense, we ensure that introduction is unforgettable."
         </p>
         <div className="relative z-10 text-brand-pink font-bold tracking-[0.3em] uppercase text-sm">
           The Essence of You.
         </div>
      </div>
    </div>
  );
};

export default About;
