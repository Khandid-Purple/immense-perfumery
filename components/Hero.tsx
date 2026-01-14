
import React, { useRef, useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { useShop } from '../context/ShopContext';
import { Product } from '../types';

interface HeroProps {
  onNavigate: (page: string) => void;
  onProductSelect: (product: Product) => void;
}

const Hero: React.FC<HeroProps> = ({ onNavigate, onProductSelect }) => {
  const { products, heroProductId, buyNow, isLoadingProducts } = useShop();
  
  const heroProduct = products.find(p => p.id === heroProductId) || (products.length > 0 ? products[0] : null);

  const cardRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -10; 
    const rotateY = ((x - centerX) / centerX) * 10;

    setRotation({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setRotation({ x: 0, y: 0 });
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleBuyNow = () => {
    if (heroProduct) {
      buyNow(heroProduct);
      onNavigate('checkout');
    }
  };

  const handleExplore = () => {
    onNavigate('products');
  };

  if (isLoadingProducts || !heroProduct) {
    return (
      <section className="w-full max-w-7xl mx-auto px-6 pt-20 pb-20 md:pb-32 flex flex-col md:flex-row items-center gap-12">
        <div className="w-full md:w-1/2 space-y-6 animate-pulse">
          <div className="h-20 bg-gray-200 dark:bg-white/10 rounded-3xl w-3/4"></div>
          <div className="h-8 bg-gray-200 dark:bg-white/10 rounded-xl w-1/2"></div>
          <div className="h-24 bg-gray-200 dark:bg-white/10 rounded-2xl w-full"></div>
        </div>
        <div className="w-full md:w-1/2 flex justify-center">
           <div className="w-80 h-[28rem] bg-gray-200 dark:bg-white/10 rounded-[3rem]"></div>
        </div>
      </section>
    );
  }

  return (
    <section id="home" className="relative w-full max-w-7xl mx-auto px-6 pt-6 md:pt-16 pb-20 md:pb-32 flex flex-col md:flex-row items-center perspective-1000 overflow-visible gap-12 md:gap-8 lg:gap-16">
      
      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-24 h-24 rounded-full border-[12px] border-green-300/30 dark:border-green-500/20 -z-10 animate-pulse hidden xl:block"></div>
      
      {/* Left Content */}
      <div className="w-full md:w-1/2 lg:w-1/2 z-10 flex flex-col items-start gap-4 md:gap-6">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-gray-900 dark:text-white leading-[1.1]">
          <span className="block opacity-0 animate-fade-in" style={{ animationDelay: '0.1s' }}>Smell is a</span>
          <span className="block opacity-0 animate-fade-in" style={{ animationDelay: '0.2s' }}>word,</span>
          <span className="relative inline-block opacity-0 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <span className="relative z-10 text-brand-pink font-serif italic transform -rotate-2 inline-block">Perfume</span>
            <svg className="absolute -bottom-1 -left-1 w-[105%] h-full -z-0 text-brand-pink opacity-20 dark:opacity-40" viewBox="0 0 100 40" preserveAspectRatio="none">
              <path d="M0 20 Q 50 40 100 20" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray="5,5" />
              <ellipse cx="50" cy="20" rx="55" ry="15" fill="currentColor" />
            </svg>
          </span>
          <span className="block opacity-0 animate-fade-in" style={{ animationDelay: '0.6s' }}>is literature.</span>
        </h1>
        
        <p className="text-gray-500 dark:text-gray-300 max-w-md leading-relaxed font-light text-base md:text-lg opacity-0 animate-fade-in" style={{ animationDelay: '0.8s' }}>
          ✦ Her dress was her canvas, her perfume was the ink in which she wrote her story. ✨ Experience the essence of elegance.
        </p>

        <div className="flex flex-wrap gap-4 mt-2 md:mt-4 opacity-0 animate-fade-in-up" style={{ animationDelay: '1s' }}>
          <Button variant="primary" onClick={handleBuyNow} className="shadow-brand-pink/40 px-8 py-3">
            BUY NOW
          </Button>
          <Button variant="outline" onClick={handleExplore} className="border-gray-300 dark:border-white/20 text-gray-600 dark:text-white hover:border-brand-pink px-8 py-3">
             Explore Collection
          </Button>
        </div>
      </div>

      {/* Right Content - 3D Interactive Image */}
      <div className="w-full md:w-1/2 relative mt-8 md:mt-0 flex justify-center lg:justify-end perspective-1000 opacity-0 animate-fade-in" style={{ animationDelay: '0.5s' }}>
        <div 
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onMouseEnter={handleMouseEnter}
          onClick={() => onProductSelect(heroProduct)}
          className="relative w-72 h-[26rem] sm:w-80 sm:h-[28rem] md:w-72 md:h-[24rem] lg:w-80 lg:h-[28rem] xl:w-96 xl:h-[32rem] transition-transform duration-100 ease-out transform-style-3d cursor-pointer group"
          style={{
            transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(${isHovering ? 1.02 : 1})`,
          }}
        >
            <div className="absolute inset-3 md:inset-4 border-2 border-white/60 dark:border-white/10 z-20 rounded-sm translate-z-10 pointer-events-none" style={{ transform: 'translateZ(20px)' }}></div>
            
            <div className="relative z-10 w-full h-full flex items-center justify-center bg-white/5 dark:bg-white/5 rounded-3xl backdrop-blur-sm shadow-2xl overflow-hidden border border-white/20 dark:border-white/5">
                 <img 
                    src={heroProduct.image} 
                    alt={heroProduct.name}
                    className="h-full w-full object-contain opacity-90 transition-transform duration-700 hover:scale-110"
                 />
                 <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none" style={{ transform: 'translateZ(40px)' }}>
                     <div className="border border-white/50 bg-white/10 backdrop-blur-md p-3 md:p-4 px-6 md:px-8 text-center text-white shadow-lg">
                         <h3 className="text-xl md:text-3xl font-serif font-light tracking-widest uppercase">{heroProduct.name.split(' ')[0] || 'IMMENSE'}</h3>
                         <span className="text-[8px] md:text-[10px] tracking-[0.3em] mt-2 block opacity-80 uppercase">Eau de Parfum</span>
                     </div>
                 </div>
            </div>

            <div 
              className="absolute top-1/2 -left-4 md:-left-6 lg:-left-12 transform -translate-y-1/2 bg-white/95 dark:bg-dark-card/95 p-3 md:p-4 rounded-xl shadow-2xl z-40 w-40 md:w-44 lg:w-48 border border-gray-100 dark:border-white/10 transition-colors backdrop-blur-xl hidden sm:block"
              style={{ transform: 'translateZ(60px) translateY(-50%)' }}
            >
                <h4 className="font-bold text-gray-800 dark:text-gray-100 text-sm lg:text-base truncate">{heroProduct.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                    <span className="bg-brand-pink text-white text-[10px] md:text-xs px-2 py-1 rounded-md font-bold">₵ {heroProduct.price.toLocaleString()}</span>
                </div>
                <p className="text-[10px] md:text-xs text-gray-400 mt-2 uppercase tracking-widest font-bold">✦ Signature Scent</p>
            </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2 opacity-40 animate-bounce">
         <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Scroll to Explore</span>
         <svg className="w-4 h-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7-7-7" />
         </svg>
      </div>
    </section>
  );
};

export default Hero;
