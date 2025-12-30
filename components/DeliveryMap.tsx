
import React from 'react';

interface DeliveryMapProps {
  status: 'Processing' | 'Shipped' | 'Delivered' | 'Order Confirmed' | 'Cancelled';
}

const DeliveryMap: React.FC<DeliveryMapProps> = ({ status }) => {
  // Simulate progress based on status
  const getProgress = () => {
    switch (status) {
      case 'Order Confirmed': return 10;
      case 'Processing': return 40; // Past Sorting Center
      case 'Shipped': return 75;    // Past Local Hub, Out for Delivery
      case 'Delivered': return 100;
      default: return 0;
    }
  };

  const progress = getProgress();

  const checkpoints = [
    { label: 'Warehouse', pos: 0 },
    { label: 'Sorting Center', pos: 33 },
    { label: 'Local Hub', pos: 66 },
    { label: 'You', pos: 100 }
  ];

  return (
    <div className="w-full h-72 bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden relative shadow-inner border border-gray-200 dark:border-white/10 group">
      
      {/* Simulated Map Background Grid */}
      <div className="absolute inset-0 opacity-10 dark:opacity-5" style={{ 
          backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', 
          backgroundSize: '20px 20px' 
      }}></div>

      {/* Simulated Roads/Map Features */}
      <div className="absolute top-1/2 left-0 w-full h-3 bg-white/40 dark:bg-white/10 -translate-y-1/2"></div>
      <div className="absolute top-0 left-1/3 w-3 h-full bg-white/40 dark:bg-white/10"></div>
      <div className="absolute top-0 right-1/4 w-3 h-full bg-white/40 dark:bg-white/10 transform rotate-12"></div>
      
      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 w-8 h-8 bg-blue-200/50 rounded-full animate-pulse"></div>
      <div className="absolute bottom-12 right-20 w-12 h-12 bg-green-200/50 rounded-full"></div>

      {/* Path Line Container (Centered) */}
      <div className="absolute top-1/2 left-[10%] w-[80%] -translate-y-1/2">
        
        {/* Gray Background Line */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-300 dark:bg-gray-600 rounded-full -translate-y-1/2"></div>
        
        {/* Pink Progress Line */}
        <div 
          className="absolute top-1/2 left-0 h-1 bg-brand-pink rounded-full -translate-y-1/2 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(255,77,141,0.5)]" 
          style={{ width: `${progress}%` }}
        ></div>

        {/* Checkpoints */}
        {checkpoints.map((point, index) => {
          const isActive = progress >= point.pos;
          const isCurrent = (progress >= point.pos && progress < (checkpoints[index + 1]?.pos || 101));

          return (
            <div 
              key={index}
              className="absolute top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group/point"
              style={{ left: `${point.pos}%` }}
            >
              {/* Dot */}
              <div className={`w-4 h-4 rounded-full border-2 border-white shadow-md z-10 transition-colors duration-500 ${
                isActive ? 'bg-brand-pink scale-110' : 'bg-gray-300 dark:bg-gray-600'
              }`}>
                {isActive && (
                  <div className="absolute inset-0 bg-brand-pink rounded-full animate-ping opacity-20"></div>
                )}
              </div>
              
              {/* Label */}
              <div className={`mt-3 px-2 py-1 rounded text-[10px] font-bold whitespace-nowrap transition-all duration-500 ${
                isActive 
                  ? 'bg-brand-pink text-white shadow-lg -translate-y-1' 
                  : 'bg-white/80 dark:bg-black/50 text-gray-500'
              }`}>
                {point.label}
              </div>

              {/* Status Tooltip (Only for current stage) */}
              {isCurrent && status !== 'Delivered' && status !== 'Cancelled' && (
                <div className="absolute -top-10 bg-black/80 text-white text-[10px] px-2 py-1 rounded animate-bounce">
                  Current Stop
                </div>
              )}
            </div>
          );
        })}

        {/* Moving Truck */}
        {status !== 'Delivered' && status !== 'Cancelled' && (
          <div 
            className="absolute top-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 ease-out z-20"
            style={{ left: `${progress}%` }}
          >
            <div className="relative">
               <div className="w-10 h-10 bg-white dark:bg-gray-700 rounded-full shadow-xl flex items-center justify-center border border-gray-100 dark:border-white/20">
                 <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-pink"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
               </div>
               <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-brand-pink text-white text-[10px] px-2 py-1 rounded-full shadow-lg whitespace-nowrap font-bold">
                 {status === 'Shipped' ? 'On the way' : 'Processing'}
               </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Status */}
      <div className="absolute bottom-2 left-2 right-2 flex justify-between items-end">
        <div className="bg-white/90 dark:bg-black/80 backdrop-blur-sm px-3 py-1 rounded-lg border border-gray-100 dark:border-white/10">
          <p className="text-xs font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            {status === 'Shipped' ? (
               <>
                 <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  Live Tracking Active
               </>
            ) : (
               <>Status: {status}</>
            )}
          </p>
        </div>
        <div className="text-[10px] text-gray-400 dark:text-gray-500 font-mono">
          ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}
        </div>
      </div>

    </div>
  );
};

export default DeliveryMap;
