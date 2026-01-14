
import React, { useState, useMemo, useEffect } from 'react';
import { SEO } from './SEO';
import { Button } from './ui/Button';
import { useShop } from '../context/ShopContext';
import { Product } from '../types';
import Confetti from './ui/Confetti';

interface GiftGuideProps {
  onNavigate: (page: string) => void;
}

type QuizStep = 'start' | 'recipient' | 'vibe' | 'occasion' | 'calculating' | 'result';

const GiftGuide: React.FC<GiftGuideProps> = ({ onNavigate }) => {
  const { products, addToCart } = useShop();
  const [step, setStep] = useState<QuizStep>('start');
  const [showCelebrate, setShowCelebrate] = useState(false);
  const [answers, setAnswers] = useState({
    recipient: '',
    vibe: '',
    occasion: ''
  });

  const occasions = [
    { name: "Anniversaries", icon: "💍", tag: "Romantic", desc: "Celebrate your shared story with a timeless floral or deep amber." },
    { name: "Birthdays", icon: "🎂", tag: "Personal", desc: "A thoughtful scent tailored to their unique energy and personality." },
    { name: "Graduations", icon: "🎓", tag: "Fresh", desc: "Inspire their next chapter with bright citrus or crisp aquatic notes." },
    { name: "Corporate", icon: "💼", tag: "Polished", desc: "Impress clients or colleagues with sophisticated, subtle wood notes." }
  ];

  const recommendedGifts = useMemo(() => {
    if (step !== 'result') return [];
    return products
      .filter(p => {
        if (answers.vibe === 'Bold' && (p.notes?.some(n => ['Oud', 'Leather', 'Saffron', 'Spices'].includes(n)))) return true;
        if (answers.vibe === 'Fresh' && (p.notes?.some(n => ['Citrus', 'Sea Salt', 'Mint', 'Marine'].includes(n)))) return true;
        if (answers.vibe === 'Classic' && (p.category === 'Ladies' || p.notes?.some(n => ['Jasmine', 'Rose', 'Bergamot'].includes(n)))) return true;
        return false;
      })
      .slice(0, 3);
  }, [step, answers, products]);

  const handleNext = (key: keyof typeof answers, value: string, nextStep: QuizStep) => {
    const updatedAnswers = { ...answers, [key]: value };
    setAnswers(updatedAnswers);
    
    if (nextStep === 'result') {
      setStep('calculating');
      setTimeout(() => {
        setStep('result');
        setShowCelebrate(true);
        setTimeout(() => setShowCelebrate(false), 5000);
      }, 2000);
    } else {
      setStep(nextStep);
    }
  };

  const resetQuiz = () => {
    setAnswers({ recipient: '', vibe: '', occasion: '' });
    setShowCelebrate(false);
    setStep('start');
  };

  const renderStep = () => {
    switch (step) {
      case 'start':
        return (
          <div className="animate-fade-in w-full max-w-4xl relative">
            {/* Background Blobs for Luxury Effect */}
            <div className="absolute -top-40 -left-20 w-[600px] h-[600px] bg-brand-pink/5 dark:bg-brand-pink/10 rounded-full blur-[100px] -z-10"></div>
            
            <div className="text-left space-y-6 md:space-y-8">
              <div className="w-16 h-16 bg-pink-100 dark:bg-pink-900/30 rounded-full flex items-center justify-center text-brand-pink mb-4 shadow-sm border border-brand-pink/10">
                 <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7 12 7 12 7z"></path></svg>
              </div>
              
              <div className="max-w-2xl">
                <h1 className="text-5xl md:text-7xl font-serif font-bold text-gray-900 dark:text-white mb-6 leading-tight">Flora's Gift Concierge</h1>
                <p className="text-gray-500 dark:text-gray-400 text-xl font-light leading-relaxed mb-10 max-w-xl">
                  Answer 3 simple questions and our Senior Scent Consultant will curate the perfect signature gift.
                </p>
                <Button onClick={() => setStep('recipient')} className="px-12 py-5 text-lg font-bold shadow-2xl shadow-brand-pink/30 hover:scale-105 transition-transform">
                  Begin Consultation
                </Button>
              </div>
            </div>
          </div>
        );

      case 'recipient':
        return (
          <div className="animate-slide-up max-w-4xl mx-auto text-center">
            <span className="text-brand-pink font-bold uppercase tracking-widest text-xs mb-4 block">Question 01</span>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-gray-900 dark:text-white mb-12">Who are we celebrating?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {['For Her', 'For Him', 'Unisex / Neutral'].map(option => (
                <button key={option} onClick={() => handleNext('recipient', option, 'vibe')} className="p-10 bg-white dark:bg-dark-card rounded-[2.5rem] border-2 border-transparent hover:border-brand-pink shadow-sm transition-all text-xl font-bold text-gray-800 dark:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink">{option}</button>
              ))}
            </div>
          </div>
        );

      case 'vibe':
        return (
          <div className="animate-slide-up max-w-4xl mx-auto text-center">
             <span className="text-brand-pink font-bold uppercase tracking-widest text-xs mb-4 block">Question 02</span>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-gray-900 dark:text-white mb-12">What is their scent personality?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { label: 'Bold & Striking', val: 'Bold', icon: '⚡' },
                { label: 'Classic & Elegant', val: 'Classic', icon: '🏛️' },
                { label: 'Fresh & Airy', val: 'Fresh', icon: '🍃' }
              ].map(option => (
                <button key={option.val} onClick={() => handleNext('vibe', option.val, 'occasion')} className="p-10 bg-white dark:bg-dark-card rounded-[2.5rem] border-2 border-transparent hover:border-brand-pink shadow-sm transition-all flex flex-col items-center gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink">
                  <span className="text-4xl">{option.icon}</span>
                  <span className="text-xl font-bold text-gray-800 dark:text-white">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 'occasion':
        return (
          <div className="animate-slide-up max-w-4xl mx-auto text-center">
             <span className="text-brand-pink font-bold uppercase tracking-widest text-xs mb-4 block">Question 03</span>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-gray-900 dark:text-white mb-12">What is the occasion?</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['Birthday', 'Anniversary', 'Work Event', 'Just Because'].map(option => (
                <button key={option} onClick={() => handleNext('occasion', option, 'result')} className="p-8 bg-white dark:bg-dark-card rounded-3xl border-2 border-transparent hover:border-brand-pink shadow-sm transition-all text-sm font-bold text-gray-800 dark:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink">{option}</button>
              ))}
            </div>
          </div>
        );

      case 'calculating':
        return (
          <div className="text-center animate-fade-in flex flex-col items-center">
             <div className="w-24 h-24 relative mb-10">
                <div className="absolute inset-0 border-4 border-brand-pink/10 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-brand-pink rounded-full border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center text-brand-pink">
                   <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a10 10 0 1 0 10 10H12V2z"></path><path d="M12 2a10 10 0 0 1 10 10h-10V2z"></path><path d="m9 22 3-8 3 8"></path></svg>
                </div>
             </div>
             <h2 className="text-3xl font-serif font-bold text-gray-900 dark:text-white mb-4">Consulting Flora...</h2>
             <p className="text-gray-500 font-light italic animate-pulse">Matching notes for a {answers.vibe.toLowerCase()} energy on a {answers.occasion.toLowerCase()}...</p>
          </div>
        );

      case 'result':
        return (
          <div className="animate-fade-in max-w-6xl mx-auto">
            <div className="bg-white dark:bg-dark-card rounded-[3rem] p-10 md:p-16 border border-gray-100 dark:border-white/10 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-brand-pink/5 rounded-full blur-3xl"></div>
               <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-8">
                  <div className="text-left">
                    <span className="text-brand-pink font-bold uppercase tracking-widest text-[10px] mb-2 block">Curated Signature Pairings</span>
                    <h2 className="text-3xl md:text-5xl font-serif font-bold text-gray-900 dark:text-white">The "{answers.vibe}" Selection</h2>
                    <p className="text-gray-500 mt-4 max-w-xl text-lg leading-relaxed">
                      "For a {answers.occasion.toLowerCase()} where you want to feel {answers.vibe.toLowerCase()}, I've handpicked these specific silhouettes from our collection."
                    </p>
                  </div>
                  <Button onClick={resetQuiz} variant="outline" className="text-xs uppercase font-bold tracking-widest">Restart Guide</Button>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {recommendedGifts.length > 0 ? recommendedGifts.map(product => (
                    <div key={product.id} className="group flex flex-col">
                       <div className="aspect-[3/4] bg-gray-50 dark:bg-black/20 rounded-[2.5rem] p-8 flex items-center justify-center relative mb-6 border border-transparent group-hover:border-brand-pink/30 transition-all overflow-hidden">
                          <img src={product.image} alt={product.name} className="h-full object-contain group-hover:scale-110 transition-transform duration-700 z-10" />
                          <div className="absolute inset-0 bg-brand-pink/0 group-hover:bg-brand-pink/5 transition-colors"></div>
                          <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-dark-card/90 backdrop-blur-md px-3 py-1.5 rounded-full text-[9px] font-bold text-brand-pink uppercase tracking-widest z-20 border border-brand-pink/10 opacity-0 group-hover:opacity-100 transition-opacity">
                             Matches: {product.notes?.[0]} & {product.notes?.[1]}
                          </div>
                       </div>
                       <div className="text-center px-4">
                          <h4 className="font-bold text-xl text-gray-900 dark:text-white mb-2">{product.name}</h4>
                          <p className="text-brand-pink font-bold text-lg mb-6">₵{product.price.toLocaleString()}</p>
                          <Button onClick={() => addToCart(product)} className="w-full py-4 text-xs uppercase tracking-widest font-bold">Select this Gift</Button>
                       </div>
                    </div>
                  )) : (
                    <div className="col-span-3 py-20 text-center">
                       <p className="text-gray-500 mb-6 italic">My apologies, that specific combination is currently evolving in our workshop. May I show you our full catalog?</p>
                       <Button onClick={() => onNavigate('products')}>Browse All Fragrances</Button>
                    </div>
                  )}
               </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="animate-fade-in py-16 px-6 max-w-7xl mx-auto pb-32">
      <SEO title="Signature Gift Guide" description="Find the perfect fragrance gift with Flora's interactive consultation." />
      
      {showCelebrate && <Confetti />}

      {step !== 'start' && step !== 'result' && step !== 'calculating' && (
        <div className="max-w-md mx-auto mb-16 px-4">
           <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
              <span>Flora's Analysis</span>
              <span>{step === 'recipient' ? '33%' : step === 'vibe' ? '66%' : '90%'}</span>
           </div>
           <div className="h-1 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-brand-pink transition-all duration-700 ease-out" 
                style={{ width: step === 'recipient' ? '33%' : step === 'vibe' ? '66%' : '90%' }}
              ></div>
           </div>
        </div>
      )}

      <section className="min-h-[450px] flex items-center justify-start mb-32">
        {renderStep()}
      </section>

      {/* Occasion Section */}
      <section className="mb-28">
        <div className="flex items-center gap-4 mb-12">
           <h2 className="text-3xl font-serif font-bold text-gray-900 dark:text-white">Gift by Occasion</h2>
           <div className="h-[1px] bg-gradient-to-r from-gray-200 via-brand-pink/20 to-transparent dark:from-white/10 flex-1"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
           {occasions.map((occ) => (
             <button key={occ.name} onClick={() => onNavigate('products')} className="group bg-white dark:bg-dark-card p-10 rounded-[3rem] border border-gray-100 dark:border-white/10 shadow-sm hover:shadow-2xl hover:border-brand-pink/40 transition-all text-center flex flex-col items-center relative overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-pink/0 to-brand-pink/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-700 relative z-10">{occ.icon}</div>
                <h3 className="font-bold text-xl text-gray-800 dark:text-white mb-2 relative z-10">{occ.name}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-8 leading-relaxed line-clamp-2 relative z-10">{occ.desc}</p>
                <span className="mt-auto text-[10px] text-brand-pink uppercase font-bold tracking-widest border-b border-brand-pink/30 pb-1 group-hover:border-brand-pink transition-all relative z-10">Shop Selection</span>
             </button>
           ))}
        </div>
      </section>

      {/* Gift Card & Luxury Wrap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
         <div className="bg-gray-900 text-white p-12 md:p-20 rounded-[5rem] flex flex-col justify-center relative overflow-hidden shadow-2xl">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-pink/10 rounded-full blur-[120px]"></div>
            <span className="text-brand-pink font-bold uppercase tracking-widest text-[10px] mb-8 block relative z-10">Luxury Unboxing</span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-8 relative z-10">Signature Wrap</h2>
            <p className="text-gray-400 mb-12 leading-relaxed relative z-10 text-lg font-light">Elevate your gesture. Our premium wrapping service includes a heavy-weight matte box, silk ribbon, and a hand-calligraphed envelope.</p>
            <div className="flex items-center gap-6 relative z-10 bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-sm self-start">
               <div className="w-12 h-12 bg-brand-pink/10 text-brand-pink rounded-xl flex items-center justify-center border border-brand-pink/20"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7 12 7 12 7z"></path></svg></div>
               <div><p className="font-bold uppercase tracking-[0.2em] text-xs">Included with Gift Option</p><p className="text-[10px] text-gray-500">Available at Checkout</p></div>
            </div>
         </div>
         
         <div className="bg-white dark:bg-dark-card p-12 md:p-20 rounded-[5rem] border border-gray-100 dark:border-white/10 shadow-xl flex flex-col justify-center text-center items-center">
            <div className="w-16 h-1 bg-brand-pink/20 rounded-full mb-10"></div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 dark:text-white mb-8">Digital Gift Card</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-12 leading-relaxed text-lg font-light max-w-sm">The freedom of choice is the ultimate luxury. Delivered via email instantly.</p>
            <Button className="px-20 py-5 text-base font-bold shadow-2xl shadow-brand-pink/20 uppercase tracking-widest">Buy Gift Card</Button>
         </div>
      </div>
    </div>
  );
};

export default GiftGuide;
