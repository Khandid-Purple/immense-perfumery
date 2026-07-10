'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Product } from '@/lib/types';
import { useShop } from '@/context/ShopContext';

interface ChatBotProps {
  onProductSelect?: (product: Product) => void;
}

async function streamChatResponse(
  history: { role: string; text: string }[],
  message: string,
  onChunk: (text: string, productIds?: string[]) => void
) {
  const res = await fetch('/api/assistant/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ history, message }),
  });
  if (!res.body) return;
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const frame = JSON.parse(line);
        if (frame.type === 'text') onChunk(frame.value);
        else if (frame.type === 'functionCall') onChunk('', frame.productIds);
      } catch { /* ignore partial/malformed frame */ }
    }
  }
}

const ChatBot: React.FC<ChatBotProps> = ({ onProductSelect }) => {
  const { products, addToCart } = useShop();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Welcome to Immense. I am **Flora**, your personal consultant. ✦ Every fragrance tells a story—let me help you curate yours. What atmosphere shall we create today? ✨', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const QUICK_ACTIONS = [
    { label: "🎁 Find a gift", trigger: "Find a gift" },
    { label: "☀️ Scent for the heat", trigger: "Scent for the heat" },
    { label: "🏠 Store location", trigger: "Where is your store located?" },
    { label: "📦 Order status", trigger: "How do I check my order status?" }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, isTyping]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const triggerMessage = async (text: string) => {
    if (isTyping) return;

    const userMsg: ChatMessage = { role: 'user', text, timestamp: new Date() };
    const currentMessages = [...messages, userMsg];
    setMessages(currentMessages);
    setIsTyping(true);

    const modelMsgIndex = currentMessages.length;
    setMessages(prev => [...prev, { role: 'model', text: '', timestamp: new Date() }]);

    let fullResponseText = "";
    let accumulatedProductIds: string[] = [];

    const historyForApi = currentMessages.map(m => ({ role: m.role, text: m.text }));

    await streamChatResponse(historyForApi, text, (chunk, productIds) => {
      if (chunk) fullResponseText += chunk;
      if (productIds) accumulatedProductIds = Array.from(new Set([...accumulatedProductIds, ...productIds]));

      setMessages(prev => {
        const updated = [...prev];
        if (updated[modelMsgIndex]) {
          updated[modelMsgIndex] = {
            ...updated[modelMsgIndex],
            text: fullResponseText,
            productRecommendations: accumulatedProductIds.length > 0 ? accumulatedProductIds : undefined,
          };
        }
        return updated;
      });
    });

    setIsTyping(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;
    const userMsg = input.trim();
    setInput('');
    triggerMessage(userMsg);
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
      <div key={productId} className="flex flex-col bg-white dark:bg-dark-card rounded-xl border border-gray-100 dark:border-white/10 overflow-hidden shadow-sm group animate-pop w-full">
        <div className="h-28 bg-gray-50 dark:bg-black/40 flex items-center justify-center p-2 relative">
          <img src={product.image} alt={product.name} className="h-full object-contain group-hover:scale-110 transition-transform duration-500" />
        </div>
        <div className="p-3">
          <h4 className="text-[10px] font-bold text-gray-900 dark:text-white truncate mb-0.5">{product.name}</h4>
          <p className="text-[10px] font-bold text-brand-pink mb-3">₵{product.price.toLocaleString()}</p>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => addToCart(product)}
              className="bg-brand-pink text-white text-[8px] py-2 rounded-md hover:bg-brand-pink-dark transition-colors font-bold uppercase tracking-wider focus:outline-none focus-visible:ring-1 focus-visible:ring-white"
            >
              ADD
            </button>
            <button
              onClick={() => handleViewDetails(product)}
              className="bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-200 text-[8px] py-2 rounded-md hover:bg-gray-200 dark:hover:bg-white/20 transition-colors font-bold uppercase tracking-wider focus:outline-none focus-visible:ring-1 focus-visible:ring-brand-pink"
            >
              VIEW
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
            return <em key={j} className="text-brand-pink dark:text-brand-pink italic">{part.slice(1, -1)}</em>;
          }
          return part;
        })}
      </p>
    ));
  };

  return (
    <div className="fixed bottom-6 right-6 md:bottom-12 lg:bottom-12 z-[9000] flex flex-col items-end pointer-events-none">

      {isOpen && (
        <div className="mb-4 w-[calc(100vw-3rem)] sm:w-[400px] bg-white dark:bg-dark-card rounded-[2.5rem] shadow-2xl border border-pink-100 dark:border-white/10 overflow-hidden flex flex-col animate-fade-in-up origin-bottom-right transition-all duration-300 h-[650px] max-h-[calc(100vh-200px)] pointer-events-auto">
          <div className="bg-brand-pink p-5 flex items-center justify-between text-white flex-shrink-0 relative z-10 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md border border-white/30">
                 <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2a10 10 0 1 0 10 10H12V2z"></path><path d="M12 2a10 10 0 0 1 10 10h-10V2z"></path><path d="m9 22 3-8 3 8"></path></svg>
              </div>
              <div>
                <h3 className="font-bold text-base leading-tight">Flora</h3>
                <p className="text-[9px] uppercase tracking-widest font-bold opacity-80">Scent Consultant</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} aria-label="Close Chat" className="hover:bg-white/20 p-2 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 bg-gray-50 dark:bg-black/30 custom-scrollbar space-y-5">
            {messages.map((msg, idx) => {
              const hasText = msg.text && msg.text.trim().length > 0;
              const hasRecs = msg.productRecommendations && msg.productRecommendations.length > 0;

              if (msg.role === 'model' && !hasText && !hasRecs) return null;

              return (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl p-5 text-sm shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-brand-pink text-white rounded-tr-none'
                      : 'bg-white dark:bg-dark-card text-gray-700 dark:text-gray-200 border border-gray-100 dark:border-white/5 rounded-tl-none'
                  }`}>
                    {hasText && <div className="leading-relaxed whitespace-pre-wrap">{formatText(msg.text)}</div>}

                    {hasRecs && (
                      <div className={`${hasText ? 'mt-5' : ''} grid grid-cols-2 gap-3 animate-fade-in-up`}>
                        {msg.productRecommendations!.map(id => renderProductCard(id))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {isTyping && (
              <div className="flex justify-start">
                 <div className="bg-white dark:bg-dark-card text-brand-pink shadow-sm border border-gray-100 dark:border-white/10 rounded-2xl rounded-tl-none p-4 px-5 flex gap-2 items-center">
                    <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms'}}></span>
                    <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms'}}></span>
                    <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms'}}></span>
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="bg-white dark:bg-dark-card border-t border-gray-100 dark:border-white/10 flex-shrink-0">
             <div className="flex gap-2 overflow-x-auto p-4 scrollbar-hide border-b border-gray-50 dark:border-white/5">
                {QUICK_ACTIONS.map(action => (
                  <button
                    key={action.label}
                    onClick={() => triggerMessage(action.trigger)}
                    className="flex-shrink-0 px-4 py-2 rounded-full bg-pink-50 dark:bg-white/5 text-[10px] font-bold text-brand-pink border border-pink-100 dark:border-white/5 hover:bg-brand-pink hover:text-white transition-all whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink"
                  >
                    {action.label}
                  </button>
                ))}
             </div>
             <form onSubmit={handleSubmit} className="p-4 flex gap-3">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Talk to Flora..."
                  aria-label="Chat input"
                  className="flex-1 bg-gray-100 dark:bg-white/5 rounded-full px-6 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink/20 text-gray-800 dark:text-white transition-all"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  aria-label="Send message"
                  className="bg-brand-pink text-white p-3 rounded-full hover:bg-brand-pink-dark transition-all disabled:opacity-50 shadow-lg shadow-brand-pink/20 flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink focus-visible:ring-offset-2 dark:focus-visible:ring-offset-dark-card"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                </button>
             </form>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close Chatbot" : "Open Chatbot"}
        className={`w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 relative pointer-events-auto group focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink focus-visible:ring-offset-4 dark:focus-visible:ring-offset-dark-bg ${isOpen ? 'bg-gray-800 text-white' : 'bg-brand-pink text-white'}`}
      >
        {isOpen ? (
           <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-90 transition-transform duration-300"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        ) : (
           <>
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            <span className="absolute -top-1 -right-1 w-6 h-6 bg-white text-brand-pink text-[11px] font-bold rounded-full flex items-center justify-center animate-bounce shadow-md border-2 border-brand-pink/10">1</span>
           </>
        )}
      </button>
    </div>
  );
};

export default ChatBot;
