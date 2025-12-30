
import React, { useState, useRef, useEffect } from 'react';
import { streamChatResponse } from '../services/geminiService';
import { ChatMessage, Product } from '../types';
import { useShop } from '../context/ShopContext';

interface ChatBotProps {
  onProductSelect?: (product: Product) => void;
}

const ChatBot: React.FC<ChatBotProps> = ({ onProductSelect }) => {
  const { products, addToCart } = useShop();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Hello! I am **Flora**, your signature scent consultant. ✦ Which mood or occasion are we matching today? ✨', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg = input.trim();
    setInput('');
    
    // Add user message to state
    const currentMessages = [...messages, { role: 'user', text: userMsg, timestamp: new Date() }] as ChatMessage[];
    setMessages(currentMessages);
    setIsTyping(true);

    // Prepare placeholder for model response
    const modelMsgIndex = currentMessages.length;
    setMessages(prev => [...prev, { role: 'model', text: '', timestamp: new Date() }]);

    let fullResponse = "";
    let accumulatedGroundingChunks: any[] = [];
    let accumulatedProductIds: string[] = [];

    // Filter history to strictly include text for the API (as the SDK history handles parts)
    const historyForApi = currentMessages.map(m => ({ 
      role: m.role, 
      text: m.text 
    }));

    await streamChatResponse(
      historyForApi,
      userMsg,
      products,
      (chunk, groundingMetadata, functionCalls) => {
        fullResponse += chunk;
        
        if (groundingMetadata?.groundingChunks) {
          accumulatedGroundingChunks = [...accumulatedGroundingChunks, ...groundingMetadata.groundingChunks];
        }

        if (functionCalls) {
          functionCalls.forEach(call => {
            if (call.name === 'recommendProducts' && call.args.productIds) {
              const ids = Array.isArray(call.args.productIds) ? call.args.productIds : [call.args.productIds];
              accumulatedProductIds = Array.from(new Set([...accumulatedProductIds, ...ids]));
            }
          });
        }

        setMessages(prev => {
          const updated = [...prev];
          updated[modelMsgIndex] = { 
            ...updated[modelMsgIndex], 
            text: fullResponse,
            groundingChunks: accumulatedGroundingChunks.length > 0 ? accumulatedGroundingChunks : undefined,
            productRecommendations: accumulatedProductIds.length > 0 ? accumulatedProductIds : undefined
          };
          return updated;
        });
      }
    );

    setIsTyping(false);
  };

  const handleViewDetails = (product: Product) => {
    if (onProductSelect) {
      onProductSelect(product);
      setIsOpen(false);
    }
  };

  const renderProductCard = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return null;

    return (
      <div key={productId} className="flex flex-col bg-white dark:bg-dark-card rounded-xl border border-gray-100 dark:border-white/10 overflow-hidden shadow-sm group animate-pop">
        <div className="h-20 sm:h-24 bg-gray-50 dark:bg-black/40 flex items-center justify-center p-2 relative">
          <img src={product.image} alt={product.name} className="h-full object-contain group-hover:scale-110 transition-transform" />
        </div>
        <div className="p-2">
          <h4 className="text-[10px] font-bold text-gray-900 dark:text-white truncate">{product.name}</h4>
          <p className="text-[10px] font-bold text-brand-pink mb-2">₵{product.price.toLocaleString()}</p>
          <div className="grid grid-cols-2 gap-1">
            <button 
              onClick={() => addToCart(product)}
              className="bg-brand-pink text-white text-[8px] py-1.5 rounded hover:bg-brand-pink-dark transition-colors font-bold uppercase tracking-wider"
            >
              Add
            </button>
            <button 
              onClick={() => handleViewDetails(product)}
              className="bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white text-[8px] py-1.5 rounded hover:bg-gray-200 dark:hover:bg-white/20 transition-colors font-bold uppercase tracking-wider"
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
    return text.split('\n').map((line, i) => (
      <p key={i} className="mb-2 last:mb-0">
        {line.split(/(\*\*.*?\*\*|\*.*?\*)/g).map((part, j) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={j} className="text-gray-900 dark:text-white font-bold">{part.slice(2, -2)}</strong>;
          }
          if (part.startsWith('*') && part.endsWith('*')) {
            return <em key={j} className="text-brand-pink italic">{part.slice(1, -1)}</em>;
          }
          return part;
        })}
      </p>
    ));
  };

  return (
    <div className="fixed bottom-6 right-6 md:bottom-12 lg:bottom-12 z-[9000] flex flex-col items-end transition-all duration-500 pointer-events-none">
      
      {isOpen && (
        <div className="mb-6 w-[calc(100vw-3rem)] sm:w-[380px] bg-white dark:bg-dark-card rounded-[2rem] shadow-2xl border border-pink-100 dark:border-white/10 overflow-hidden flex flex-col animate-fade-in-up origin-bottom-right transition-all duration-300 h-[60vh] sm:h-[650px] max-h-[calc(100vh-200px)] pointer-events-auto">
          {/* Header */}
          <div className="bg-brand-pink p-4 flex items-center justify-between text-white flex-shrink-0 relative z-10 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md border border-white/30">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10H12V2z"></path><path d="M12 2a10 10 0 0 1 10 10h-10V2z"></path><path d="m9 22 3-8 3 8"></path></svg>
              </div>
              <div>
                <h3 className="font-bold text-sm leading-none mb-1">Flora</h3>
                <p className="text-[9px] uppercase tracking-widest font-bold opacity-80">Scent Consultant</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-2 rounded-full transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-black/20 custom-scrollbar space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-brand-pink text-white rounded-tr-none' 
                    : 'bg-white dark:bg-dark-card text-gray-700 dark:text-gray-200 border border-gray-100 dark:border-white/5 rounded-tl-none'
                }`}>
                  <div className="leading-relaxed whitespace-pre-wrap">{formatText(msg.text)}</div>
                  
                  {msg.productRecommendations && msg.productRecommendations.length > 0 && (
                    <div className="mt-6 grid grid-cols-2 gap-2 animate-fade-in-up">
                      {msg.productRecommendations.map(id => renderProductCard(id))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                 <div className="bg-white dark:bg-white/10 text-brand-pink shadow-sm border border-gray-100 dark:border-white/5 rounded-2xl rounded-tl-none p-3 px-4 flex gap-1.5 items-center">
                    <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms'}}></span>
                    <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms'}}></span>
                    <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms'}}></span>
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-3 bg-white dark:bg-dark-card border-t border-gray-100 dark:border-white/10 flex gap-2 flex-shrink-0">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tell Flora what you need..."
              className="flex-1 bg-gray-100 dark:bg-white/5 rounded-full px-5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink/20 text-gray-800 dark:text-white transition-all"
            />
            <button 
              type="submit" 
              disabled={!input.trim() || isTyping}
              className="bg-brand-pink text-white p-2.5 rounded-full hover:bg-brand-pink-dark transition-all disabled:opacity-50 shadow-lg shadow-brand-pink/20 flex-shrink-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </button>
          </form>
        </div>
      )}

      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 relative pointer-events-auto group ${isOpen ? 'bg-gray-800 text-white' : 'bg-brand-pink text-white'}`}
      >
        {isOpen ? (
           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-90 transition-transform duration-300"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        ) : (
           <>
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-white text-brand-pink text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce shadow-md border-2 border-brand-pink/10">1</span>
           </>
        )}
      </button>
    </div>
  );
};

export default ChatBot;
