import React from 'react';

interface FragrancePyramidProps {
  notes: string[];
}

export const FragrancePyramid: React.FC<FragrancePyramidProps> = ({ notes }) => {
  // Distribute notes into layers (fallback logic if simple array)
  // Logic: First 1/3 are Top, next 1/3 are Heart, rest are Base
  const total = notes.length;
  const topCount = Math.ceil(total * 0.3);
  const heartCount = Math.ceil(total * 0.4);
  
  const topNotes = notes.slice(0, topCount);
  const heartNotes = notes.slice(topCount, topCount + heartCount);
  const baseNotes = notes.slice(topCount + heartCount);

  // If distribution failed (too few notes), just put them all in heart
  const safeTop = topNotes.length ? topNotes : [];
  const safeHeart = heartNotes.length ? heartNotes : notes;
  const safeBase = baseNotes.length ? baseNotes : [];

  return (
    <div className="py-8 animate-fade-in-up">
      <h3 className="font-serif font-bold text-gray-800 dark:text-white mb-6 text-center text-xl">Olfactory Pyramid</h3>
      
      <div className="relative flex flex-col items-center gap-2">
        
        {/* Connecting Line */}
        <div className="absolute top-4 bottom-4 w-0.5 bg-gradient-to-b from-transparent via-brand-pink/30 to-transparent"></div>

        {/* Top Notes */}
        <div className="relative z-10 flex flex-col items-center">
           <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-2 bg-white dark:bg-dark-card px-2">Top Notes</span>
           <div className="flex gap-3 flex-wrap justify-center">
             {safeTop.map((note, i) => (
               <div key={i} className="bg-pink-50 dark:bg-white/10 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-t-xl rounded-b-md shadow-sm border-t-2 border-brand-pink/50 text-sm hover:-translate-y-1 transition-transform">
                 {note}
               </div>
             ))}
           </div>
           <p className="text-[10px] text-gray-400 mt-1 italic">First impression, volatile, fresh</p>
        </div>

        {/* Heart Notes */}
        <div className="relative z-10 flex flex-col items-center py-4">
           <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-2 bg-white dark:bg-dark-card px-2">Heart Notes</span>
           <div className="flex gap-3 flex-wrap justify-center max-w-md">
             {safeHeart.map((note, i) => (
               <div key={i} className="bg-white dark:bg-dark-card text-gray-800 dark:text-white px-5 py-3 rounded-xl shadow-md border border-gray-100 dark:border-white/10 text-sm font-medium hover:scale-105 transition-transform">
                 {note}
               </div>
             ))}
           </div>
           <p className="text-[10px] text-gray-400 mt-1 italic">The core personality of the fragrance</p>
        </div>

        {/* Base Notes */}
        <div className="relative z-10 flex flex-col items-center">
           <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-2 bg-white dark:bg-dark-card px-2">Base Notes</span>
           <div className="flex gap-3 flex-wrap justify-center">
             {safeBase.map((note, i) => (
               <div key={i} className="bg-gray-800 dark:bg-black/40 text-white/90 px-6 py-3 rounded-b-xl rounded-t-md shadow-lg text-sm border-b-4 border-gray-600 dark:border-white/10 hover:translate-y-1 transition-transform">
                 {note}
               </div>
             ))}
           </div>
           <p className="text-[10px] text-gray-400 mt-1 italic">Long-lasting depth and richness</p>
        </div>

      </div>
    </div>
  );
};