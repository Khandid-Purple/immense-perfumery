
import React, { useState, useRef } from 'react';
import { analyzeImage, AnalysisResponse } from '../services/geminiService';
import { Button } from './ui/Button';
import { useShop } from '../context/ShopContext';
import { Product } from '../types';

interface ImageAnalyzerProps {
  onProductSelect: (product: Product) => void;
}

const ImageAnalyzer: React.FC<ImageAnalyzerProps> = ({ onProductSelect }) => {
  const { products, addToCart } = useShop();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('');
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const base64Data = result.split(',')[1];
        setSelectedImage(base64Data);
        setMimeType(file.type);
        setAnalysis(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    setLoading(true);
    try {
      const result = await analyzeImage(selectedImage, mimeType, products);
      setAnalysis(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const renderProductCard = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return null;

    return (
      <div key={productId} className="flex flex-col bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-white/10 overflow-hidden shadow-sm group animate-pop">
        <div className="h-28 sm:h-32 bg-gray-50 dark:bg-black/40 flex items-center justify-center p-3 relative overflow-hidden">
           <img src={product.image} alt={product.name} className="h-full object-contain group-hover:scale-110 transition-transform duration-500" />
        </div>
        <div className="p-3">
          <h4 className="text-[10px] sm:text-xs font-bold text-gray-900 dark:text-white truncate mb-1">{product.name}</h4>
          <p className="text-[10px] sm:text-xs font-bold text-brand-pink mb-3">₵{product.price.toLocaleString()}</p>
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => addToCart(product)}
              className="bg-brand-pink text-white text-[9px] py-2 rounded-lg hover:bg-brand-pink-dark transition-colors font-bold uppercase tracking-wider"
            >
              Add
            </button>
            <button 
              onClick={() => onProductSelect(product)}
              className="bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-200 text-[9px] py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-white/20 transition-colors font-bold uppercase tracking-wider"
            >
              View
            </button>
          </div>
        </div>
      </div>
    );
  };

  const formatText = (text: string) => {
    if (!text) return null;
    return text.split(/(\*\*.*?\*\*|\*.*?\*)/g).map((part, j) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={j} className="text-gray-900 dark:text-white font-bold">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={j} className="text-brand-pink italic">{part.slice(1, -1)}</em>;
      }
      return part;
    });
  };

  return (
    <section className="py-20 bg-white dark:bg-dark-card w-full transition-colors border-t border-gray-100 dark:border-white/5">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          
          <div className="w-full lg:w-1/2">
             <div className="mb-10">
               <h2 className="text-3xl md:text-5xl font-serif font-bold text-gray-900 dark:text-white mb-4 transition-colors">
                 Scent <span className="text-brand-pink">Match AI</span>
               </h2>
               <p className="text-gray-600 dark:text-gray-300 leading-relaxed transition-colors text-lg font-light">
                 Capture a moment, a mood, or a masterpiece. ✦ Our AI will translate the visual notes into the perfect fragrance.
               </p>
             </div>
             
             <div className="bg-pink-50 dark:bg-black/20 p-6 md:p-8 rounded-[2.5rem] border border-pink-200 dark:border-white/10 shadow-sm transition-colors">
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />
                
                {!selectedImage ? (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-white/80 dark:bg-transparent border-2 border-dashed border-brand-pink/50 rounded-3xl h-72 flex flex-col items-center justify-center cursor-pointer hover:bg-white dark:hover:bg-white/5 hover:border-brand-pink transition-all group shadow-sm"
                  >
                    <div className="bg-pink-100 dark:bg-white/10 p-5 rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform">
                      <svg className="w-10 h-10 text-brand-pink" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="text-brand-pink font-bold text-xl">Upload Inspiration</span>
                    <span className="text-gray-500 dark:text-gray-400 text-sm mt-2">Let the eyes guide the nose</span>
                  </div>
                ) : (
                  <div className="relative h-72 rounded-3xl overflow-hidden shadow-xl bg-gray-100 dark:bg-black/40 border border-white/20">
                     <img 
                      src={`data:${mimeType};base64,${selectedImage}`} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                     />
                     <button 
                      onClick={() => { setSelectedImage(null); setAnalysis(null); }}
                      className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 backdrop-blur-md transition-colors"
                     >
                       <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                     </button>
                  </div>
                )}

                <div className="mt-8">
                  <Button 
                    onClick={handleAnalyze} 
                    disabled={!selectedImage || loading}
                    className={`w-full py-5 text-lg font-serif tracking-widest ${!selectedImage ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {loading ? (
                      <div className="flex items-center gap-3">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        CONSULTING FLORA...
                      </div>
                    ) : (
                      <>ANALYZE VIBES</>
                    )}
                  </Button>
                </div>
             </div>
          </div>

          <div className="w-full lg:w-1/2 min-h-[500px] flex flex-col">
             {!analysis ? (
               <div className="flex-1 bg-gray-50 dark:bg-white/5 rounded-[2.5rem] border border-gray-200 dark:border-white/10 border-dashed p-10 flex flex-col items-center justify-center text-center opacity-60">
                 <div className="w-20 h-20 bg-white dark:bg-dark-card rounded-full flex items-center justify-center shadow-sm mb-6">
                    <svg className="w-10 h-10 text-gray-300 dark:text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                 </div>
                 <h3 className="font-serif text-2xl text-gray-500 dark:text-gray-500 font-medium mb-2">Awaiting Revelation</h3>
                 <p className="text-gray-400 dark:text-gray-600 max-w-xs">Upload your inspiration to unveil its olfactory secret.</p>
               </div>
             ) : (
               <div className="animate-fade-in flex flex-col h-full bg-white dark:bg-dark-card p-6 sm:p-10 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-white/10">
                 <div className="mb-8">
                    <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-brand-pink mb-4 flex items-center gap-3">
                       <span className="w-8 h-[1px] bg-brand-pink"></span>
                       Olfactory Essence
                    </h4>
                    <div className="text-gray-800 dark:text-gray-200 text-base sm:text-xl font-light leading-relaxed italic border-l-2 border-brand-pink/20 pl-4 sm:pl-6">
                      {formatText(analysis.description)}
                    </div>
                 </div>

                 {analysis.recommendedProductIds && analysis.recommendedProductIds.length > 0 && (
                   <div className="mt-auto">
                      <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400 mb-6 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
                        Signature Matches
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                        {analysis.recommendedProductIds.map(id => renderProductCard(id))}
                      </div>
                   </div>
                 )}
               </div>
             )}
          </div>

        </div>
      </div>
    </section>
  );
};

export default ImageAnalyzer;
