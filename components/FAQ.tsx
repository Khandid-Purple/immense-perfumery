
import React, { useState } from 'react';
import { SEO } from './SEO';

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer, isOpen, onClick }) => {
  return (
    <div className="border-b border-gray-100 dark:border-white/5 last:border-0">
      <button 
        onClick={onClick}
        className="w-full py-6 flex items-center justify-between text-left group"
      >
        <span className={`text-lg font-medium transition-colors duration-300 ${isOpen ? 'text-brand-pink' : 'text-gray-800 dark:text-gray-200 group-hover:text-brand-pink'}`}>
          {question}
        </span>
        <div className={`flex-shrink-0 ml-4 transition-transform duration-500 ${isOpen ? 'rotate-180 text-brand-pink' : 'text-gray-400'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </div>
      </button>
      <div 
        className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-96 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-light">
          {answer}
        </p>
      </div>
    </div>
  );
};

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqData = [
    {
      category: "Fragrances & Selection",
      items: [
        {
          question: "How do I choose a signature scent for the Ghanaian climate?",
          answer: "Our expert 'Flora' is trained specifically for local conditions. In more humid areas like Accra, we recommend lighter, aquatic, or citrus-heavy scents that stay fresh. For the drier North or during Harmattan, richer ouds, spices, and ambers provide better longevity as they don't evaporate as quickly."
        },
        {
          question: "Are your perfumes original?",
          answer: "Absolutely. Immense Perfumery only sources genuine, authentic fragrances directly from authorized distributors. Every bottle comes in its original retail packaging with valid batch codes."
        }
      ]
    },
    {
      category: "Delivery & Shipping",
      items: [
        {
          question: "How long does delivery take within Accra?",
          answer: "Standard delivery within Accra and Tema typically takes 24-48 hours. Express delivery is available for orders placed before 10 AM, ensuring same-day arrival at your doorstep."
        },
        {
          question: "Do you ship to other regions like Kumasi or Tamale?",
          answer: "Yes, we ship nationwide across all 16 regions of Ghana. Deliveries outside the Greater Accra region usually take 2-4 business days via our premium courier partners."
        }
      ]
    },
    {
      category: "Orders & Returns",
      items: [
        {
          question: "What is your return policy?",
          answer: "Due to the nature of beauty products and for hygiene reasons, we can only accept returns on unopened, sealed products within 7 days of delivery. If a product arrives damaged, please contact Customer Care immediately with photos of the packaging."
        },
        {
          question: "Can I include a gift note?",
          answer: "Certainly. We offer a 'Signature Gift Wrapping' service for ₵25 which includes a premium box and a handwritten note. You can add your personalized message in the 'Order Note' section at checkout."
        }
      ]
    }
  ];

  return (
    <div className="animate-fade-in py-16 px-6 max-w-4xl mx-auto">
      <SEO 
        title="Frequently Asked Questions" 
        description="Find answers to common questions about fragrance selection for Ghana's climate, our nationwide delivery, and authenticity guarantees."
      />
      
      <div className="text-center mb-16">
        <span className="text-brand-pink font-bold tracking-[0.3em] uppercase text-xs mb-4 block">Information Hub</span>
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 dark:text-white mb-6">Frequently Asked Questions</h1>
        <div className="w-20 h-1 bg-brand-pink/20 rounded-full mx-auto"></div>
      </div>

      <div className="space-y-12">
        {faqData.map((section, sIdx) => (
          <div key={sIdx} className="bg-white/50 dark:bg-dark-card/50 backdrop-blur-sm rounded-[2rem] p-8 border border-gray-100 dark:border-white/10 shadow-sm transition-colors">
            <h3 className="text-sm font-bold text-brand-pink uppercase tracking-widest mb-4 border-l-4 border-brand-pink pl-4">
              {section.category}
            </h3>
            <div className="divide-y divide-gray-100 dark:divide-white/5">
              {section.items.map((item, iIdx) => {
                const globalIdx = sIdx * 10 + iIdx; // Simple unique index
                return (
                  <FAQItem 
                    key={iIdx}
                    question={item.question}
                    answer={item.answer}
                    isOpen={openIndex === globalIdx}
                    onClick={() => setOpenIndex(openIndex === globalIdx ? null : globalIdx)}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-20 p-10 bg-gray-900 rounded-[2.5rem] text-center text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-pink/10 rounded-full blur-[80px]"></div>
        <h3 className="text-2xl font-serif mb-4 relative z-10">Still have questions?</h3>
        <p className="text-gray-400 mb-8 relative z-10 max-w-md mx-auto">Our Customer Care experts are available to guide you through your olfactory journey.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
          <a 
            href="mailto:hello@immenseperfumery.com"
            className="px-8 py-3 bg-white text-gray-900 rounded-full font-bold hover:bg-brand-pink hover:text-white transition-all shadow-lg"
          >
            EMAIL US
          </a>
          <a 
            href="https://wa.me/233242802741"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3 bg-brand-pink text-white rounded-full font-bold hover:bg-brand-pink-dark transition-all shadow-lg shadow-brand-pink/20"
          >
            WHATSAPP CHAT
          </a>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
