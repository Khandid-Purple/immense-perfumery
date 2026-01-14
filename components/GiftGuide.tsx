
import React, { useState, useMemo } from 'react';
import { SEO } from './SEO';
import { Button } from './ui/Button';
import { useShop } from '../context/ShopContext';
import { Product } from '../types';

interface GiftGuideProps {
  onNavigate: (page: string) => void;
}

type QuizStep = 'start' | 'recipient' | 'vibe' | 'occasion' | 'result';

const GiftGuide: React.FC<GiftGuideProps> = ({ onNavigate }) => {
  const { products, addToCart } = useShop();
  const [step, setStep] = useState<QuizStep>('start');
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

  const characters = [
    {
      title: "The Visionary",
      desc: "Bold, commanding, and unforgettable. For those who lead with unwavering confidence.",
      notes: "Oud, Leather, Black Pepper",
      image: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=600"
    },
    {
      title: "The Minimalist",
      desc: "Clean, subtle, and airy. For the person who believes true elegance is understated.",
      notes: "White Musk, Sea Salt, Cotton",
      image: "https://images.unsplash.com/photo-1585232004423-244e0e6904e3?q=80&w=600"
    },
    {
      title: "The Dreamer",
      desc: "Whimsical florals and warm vanilla. A nostalgic choice for the gentle heart.",
      notes: "Peony, Jasmine, Vanilla",
      image: "https://images.unsplash.com/photo-1594035910387-fea4779426e9?q=80&w=600"
    }
  ];

  const recommendedGifts = useMemo(() => {
    if (step !== 'result') return [];
    
    // Simple logic-based matching for the demo
    // In a production app, this could call the Gemini API for more nuanced matching
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
    setAnswers(prev => ({ ...prev, [key]: value }));
    setStep(nextStep);
  };

  const resetQuiz = () => {
    setAnswers({ recipient: '', vibe: '', occasion: '' });
    setStep('start');
  };

  const renderStep = () => {
    switch (step) {
      case 'start':
        return (
          <div className="text-center animate-fade-in max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-brand-pink/10 rounded-full flex items-center justify-center mx-auto mb-8 text-brand-pink">
               <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7 12 7 12 7z"></path></svg>
            </div>
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-gray-900 dark:text-white mb-6">Flora's Gift Concierge</h1>
            <p className="text-gray-500 dark:text-gray-400 text-lg font-light leading-relaxed mb-10">
              Answer 3 simple questions and our Senior Scent Consultant will curate the perfect signature gift for your loved one.
            </p>
            <Button onClick={() => setStep('recipient')} className="px-12 py-5 text-lg font-bold shadow-xl shadow-brand-pink/30">
              Begin Consultation
            </Button>
          </div>
        );

      case 'recipient':
        return (
          <div className="animate-slide-up max-w-4xl mx-auto text-center">
            <span className="text-brand-pink font-bold uppercase tracking-widest text-xs mb-4 block">Question 01</span>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-gray-900 dark:text-white mb-12">Who are we celebrating?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {['For Her', 'For Him', 'Unisex / Neutral'].map(option => (
                <button 
                  key={option}
                  onClick={() => handleNext('recipient', option, 'vibe')}
                  className="p-10 bg-white dark:bg-dark-card rounded-[2.5rem] border-2 border-transparent hover:border-brand-pink shadow-sm transition-all text-xl font-bold text-gray-800 dark:text-white"
                >
                  {option}
                </button>
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
                <button 
                  key={option.val}
                  onClick={() => handleNext('vibe', option.val, 'occasion')}
                  className="p-10 bg-white dark:bg-dark-card rounded-[2.5rem] border-2 border-transparent hover:border-brand-pink shadow-sm transition-all flex flex-col items-center gap-4"
                >
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
              {['Birthday', 'Anniversary', 'Work / Promotion', 'Just Because'].map(option => (
                <button 
                  key={option}
                  onClick={() => handleNext('occasion', option, 'result')}
                  className="p-8 bg-white dark:bg-dark-card rounded-3xl border-2 border-transparent hover:border-brand-pink shadow-sm transition-all text-sm font-bold text-gray-800 dark:text-white"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        );

      case 'result':
        return (
          <div className="animate-fade-in max-w-6xl mx-auto">
            <div className="bg-white dark:bg-dark-card rounded-[3rem] p-10 md:p-16 border border-gray-100 dark:border-white/10 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-brand-pink/5 rounded-full blur-3xl"></div>
               <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-8">
                  <div className="text-left">
                    <span className="text-brand-pink font-bold uppercase tracking-widest text-xs mb-2 block">Flora's Recommendation</span>
                    <h2 className="text-4xl font-serif font-bold text-gray-900 dark:text-white">Curated Selection</h2>
                    <p className="text-gray-500 mt-4 max-w-md italic">
                      "Based on their {answers.vibe.toLowerCase()} personality and the {answers.occasion.toLowerCase()} occasion, I have handpicked these scents that I believe will leave a lasting impression."
                    </p>
                  </div>
                  <Button onClick={resetQuiz} variant="outline" className="text-xs">Start Over</Button>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {recommendedGifts.length > 0 ? recommendedGifts.map(product => (
                    <div key={product.id} className="group flex flex-col">
                       <div className="aspect-[3/4] bg-gray-50 dark:bg-black/20 rounded-[2.5rem] p-8 flex items-center justify-center relative mb-6 border border-transparent group-hover:border-brand-pink/30 transition-all">
                          <img src={product.image} alt={product.name} className="h-full object-contain group-hover:scale-110 transition-transform duration-700" />
                          <div className="absolute inset-0 bg-brand-pink/0 group-hover:bg-brand-pink/5 transition-colors rounded-[2.5rem]"></div>
                       </div>
                       <div className="text-center px-4">
                          <h4 className="font-bold text-xl text-gray-900 dark:text-white mb-2">{product.name}</h4>
                          <p className="text-brand-pink font-bold text-lg mb-6">₵{product.price.toLocaleString()}</p>
                          <div className="flex gap-2">
                             <Button onClick={() => addToCart(product)} className="flex-1 py-3 text-xs uppercase tracking-widest font-bold">Gift This</Button>
                          </div>
                       </div>
                    </div>
                  )) : (
                    <div className="col-span-3 py-20 text-center">
                       <p className="text-gray-500 mb-6">It seems our collection is currently evolving. May I suggest a gift card?</p>
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
      <SEO title="Signature Gift Guide" description="Find the perfect fragrance gift for any occasion or character. Expertly curated at Immense Perfumery Accra." />
      
      {/* Quiz Progress Bar */}
      {step !== 'start' && step !== 'result' && (
        <div className="max-w-md mx-auto mb-16 px-4">
           <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
              <span>Consultation Progress</span>
              <span>{step === 'recipient' ? '33%' : step === 'vibe' ? '66%' : '99%'}</span>
           </div>
           <div className="h-1.5 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-brand-pink transition-all duration-500" 
                style={{ width: step === 'recipient' ? '33%' : step === 'vibe' ? '66%' : '100%' }}
              ></div>
           </div>
        </div>
      )}

      {/* Main Quiz Area */}
      <section className="min-h-[400px] flex items-center justify-center mb-32">
        {renderStep()}
      </section>

      {/* Occasion Section (Enhanced Visuals) */}
      <section className="mb-28">
        <div className="flex items-center gap-4 mb-12">
           <h2 className="text-3xl font-serif font-bold text-gray-900 dark:text-white">Gift by Occasion</h2>
           <div className="h-[1px] bg-gradient-to-r from-gray-200 via-brand-pink/20 to-transparent dark:from-white/10 flex-1"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
           {occasions.map((occ) => (
             <button 
                key={occ.name}
                onClick={() => onNavigate('products')}
                className="group bg-white dark:bg-dark-card p-10 rounded-[3rem] border border-gray-100 dark:border-white/10 shadow-sm hover:shadow-2xl hover:border-brand-pink/40 transition-all text-center flex flex-col items-center relative overflow-hidden"
             >
                <div className="absolute inset-0 bg-gradient-to-br from-brand-pink/0 to-brand-pink/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-700 relative z-10">{occ.icon}</div>
                <h3 className="font-bold text-xl text-gray-800 dark:text-white mb-2 relative z-10">{occ.name}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-8 leading-relaxed line-clamp-2 relative z-10">{occ.desc}</p>
                <span className="mt-auto text-[10px] text-brand-pink uppercase font-bold tracking-widest border-b border-brand-pink/30 pb-1 group-hover:border-brand-pink transition-all relative z-10">Shop Selection</span>
             </button>
           ))}
        </div>
      </section>

      {/* Character Profiles (Matte Style) */}
      <section className="mb-28">
        <div className="flex items-center gap-4 mb-12">
           <h2 className="text-3xl font-serif font-bold text-gray-900 dark:text-white">Gift by Character</h2>
           <div className="h-[1px] bg-gradient-to-r from-gray-200 via-brand-pink/20 to-transparent dark:from-white/10 flex-1"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {characters.map((c, idx) => (
            <div key={idx} className="flex flex-col bg-white dark:bg-dark-card rounded-[3.5rem] overflow-hidden shadow-lg border border-gray-50 dark:border-white/5 group">
               <div className="h-96 overflow-hidden relative">
                  <img src={c.image} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2000ms]" />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
                  <div className="absolute bottom-6 left-6 right-6">
                     <span className="bg-brand-pink/90 backdrop-blur-md text-white text-[10px] font-bold px-4 py-2 rounded-full uppercase tracking-[0.2em] shadow-lg">Character Map</span>
                  </div>
               </div>
               <div className="p-10 md:p-12 flex flex-col flex-1">
                  <h3 className="text-3xl font-serif font-bold text-gray-900 dark:text-white mb-4 group-hover:text-brand-pink transition-colors">{c.title}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-10 flex-1">{c.desc}</p>
                  <div className="space-y-8">
                    <div className="flex flex-wrap gap-2">
                       {c.notes.split(', ').map(n => (
                         <span key={n} className="text-[10px] font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-white/5 px-4 py-2 rounded-full uppercase tracking-tighter">{n}</span>
                       ))}
                    </div>
                    <Button variant="outline" className="w-full py-4 text-xs font-bold uppercase tracking-widest hover:bg-brand-pink hover:text-white transition-all" onClick={() => onNavigate('products')}>View Matches</Button>
                  </div>
               </div>
            </div>
          ))}
        </div>
      </section>

      {/* Gift Card & Luxury Wrap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
         <div className="bg-gray-900 text-white p-12 md:p-20 rounded-[5rem] flex flex-col justify-center relative overflow-hidden shadow-2xl">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-pink/10 rounded-full blur-[120px]"></div>
            <span className="text-brand-pink font-bold uppercase tracking-widest text-[10px] mb-8 block relative z-10">Luxury Unboxing</span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-8 relative z-10">Signature Wrap</h2>
            <p className="text-gray-400 mb-12 leading-relaxed relative z-10 text-lg font-light">
              Elevate your gesture. Our ₵25 premium wrapping service includes a heavy-weight matte box, silk ribbon, and a hand-calligraphed envelope.
            </p>
            <div className="flex items-center gap-6 relative z-10 bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-sm self-start">
               <div className="w-12 h-12 bg-brand-pink/10 text-brand-pink rounded-xl flex items-center justify-center border border-brand-pink/20">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7 12 7 12 7z"></path></svg>
               </div>
               <div>
                 <p className="font-bold uppercase tracking-[0.2em] text-xs">Included with Gift Option</p>
                 <p className="text-[10px] text-gray-500">Available at Checkout</p>
               </div>
            </div>
         </div>
         
         <div className="bg-white dark:bg-dark-card p-12 md:p-20 rounded-[5rem] border border-gray-100 dark:border-white/10 shadow-xl flex flex-col justify-center text-center items-center">
            <div className="w-16 h-1 bg-brand-pink/20 rounded-full mb-10"></div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 dark:text-white mb-8">Digital Gift Card</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-12 leading-relaxed text-lg font-light max-w-sm">The freedom of choice is the ultimate luxury. Delivered via email instantly.</p>
            <Button className="px-20 py-5 text-base font-bold shadow-2xl shadow-brand-pink/20 uppercase tracking-widest">Buy Gift Card</Button>
            <p className="mt-10 text-[10px] text-gray-400 uppercase font-bold tracking-[0.5em] opacity-60">From ₵200 to ₵5000</p>
         </div>
      </div>
    </div>
  );
};

export default GiftGuide;
