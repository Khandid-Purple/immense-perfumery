import React from 'react';

interface MarqueeProps {
  items: string[];
  direction?: 'left' | 'right';
  className?: string;
}

export const Marquee: React.FC<MarqueeProps> = ({ items, direction = 'left', className = '' }) => {
  return (
    <div className={`relative flex overflow-hidden py-4 bg-white/30 dark:bg-black/20 backdrop-blur-sm border-y border-pink-100 dark:border-white/5 ${className}`}>
      <div className={`flex whitespace-nowrap animate-${direction === 'left' ? 'marquee' : 'marquee-reverse'} hover:[animation-play-state:paused]`}>
        {/* Repeat enough times to fill screen seamlessly */}
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center mx-4">
            {items.map((item, idx) => (
              <React.Fragment key={idx}>
                <span className="text-4xl md:text-6xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-400 dark:from-white/5 dark:to-white/20 px-8 uppercase tracking-widest">
                  {item}
                </span>
                <span className="text-2xl text-brand-pink opacity-50">✦</span>
              </React.Fragment>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};