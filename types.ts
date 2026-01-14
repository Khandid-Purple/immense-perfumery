
export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  isVerified: boolean;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  rating: number;
  reviews: number;
  image: string; // Main image
  images: string[]; // Gallery images
  description: string;
  notes?: string[]; 
  stock: number; 
  customerReviews?: Review[]; // Real user reviews
}

export interface CartItem extends Product {
  quantity: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  groundingChunks?: any[]; 
  productRecommendations?: string[]; 
}

export interface Address {
  id: string;
  label: string; 
  firstName: string;
  lastName: string;
  street: string;
  digitalAddress?: string; // Ghana Post GPS
  region: string; 
  city: string;
  zip?: string;
  phone: string;
}

export interface Order {
  id: string;
  userId: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  giftWrap: boolean;
  orderNote?: string;
  shippingMethod: string;
  shippingCost: number;
  total: number;
  status: 'Order Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  shippingAddress: Address;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string; // Base64 or URL
  role: 'customer' | 'admin';
  addresses: Address[];
  orders: Order[];
}
