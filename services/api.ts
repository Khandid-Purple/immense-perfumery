
import { Product, User, Order, Address, Review } from '../types';
import { products as initialProducts } from '../data/products';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const STORAGE_KEYS = {
  USERS: 'immense_users',
  PRODUCTS: 'immense_products',
  ORDERS: 'immense_orders',
  SETTINGS: 'immense_settings',
  PROMOS: 'immense_promos',
};

const seedData = () => {
  if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(initialProducts));
  }
  
  if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({ 
      heroProductId: '1',
      freeShippingThreshold: 3000,
      standardShippingRate: 45,
      expressShippingRate: 80,
      giftWrapRate: 25
    }));
  }

  if (!localStorage.getItem(STORAGE_KEYS.PROMOS)) {
    localStorage.setItem(STORAGE_KEYS.PROMOS, JSON.stringify([
      { code: 'SAVE10', discount: 10 },
      { code: 'IMMENSE20', discount: 20 }
    ]));
  }
  
  let users: User[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
  let changed = false;

  if (!users.find(u => u.email === 'admin@immense.com')) {
    users.push({
      id: 'admin-1',
      name: 'Admin User',
      email: 'admin@immense.com',
      role: 'admin',
      addresses: [],
      orders: []
    });
    changed = true;
  }

  if (!users.find(u => u.email === 'user@immense.com')) {
    users.push({
      id: 'user-1',
      name: 'Jane Doe',
      email: 'user@immense.com',
      role: 'customer',
      addresses: [{
          id: 'addr-default',
          label: 'Home',
          firstName: 'Jane',
          lastName: 'Doe',
          street: '123 Perfume Lane, ACP Estate',
          digitalAddress: 'GA-123-4567',
          region: 'Greater Accra',
          city: 'Accra',
          zip: '00233',
          phone: '0555551234'
      }],
      orders: []
    });
    changed = true;
  }

  if (changed) localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify([]));
};

seedData();

export const GHANA_REGIONS = [
  'Ahafo', 'Ashanti', 'Bono', 'Bono East', 'Central', 'Eastern', 
  'Greater Accra', 'North East', 'Northern', 'Oti', 'Savannah', 
  'Upper East', 'Upper West', 'Volta', 'Western', 'Western North'
];

export const api = {
  auth: {
    login: async (email: string, password: string): Promise<User> => {
      await delay(800);
      const users: User[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
      const user = users.find(u => u.email === email);
      if (user) {
        if (user.role === 'admin' && password !== 'admin123') throw new Error('Invalid credentials');
        if (user.email === 'user@immense.com' && password !== 'user123') throw new Error('Invalid credentials');
        return user;
      }
      throw new Error('User not found');
    },
    register: async (name: string, email: string, password: string): Promise<User> => {
      await delay(800);
      const users: User[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
      if (users.find(u => u.email === email)) throw new Error('Email already exists');
      const newUser: User = { id: 'user-' + Date.now(), name, email, role: 'customer', addresses: [], orders: [] };
      users.push(newUser);
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      return newUser;
    },
    updateProfile: async (user: User): Promise<User> => {
      await delay(500);
      const users: User[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
      const index = users.findIndex(u => u.id === user.id);
      if (index !== -1) {
        users[index] = user;
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
        return user;
      }
      throw new Error('User not found');
    }
  },
  products: {
    getAll: async (): Promise<Product[]> => {
      await delay(600);
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]');
    },
    getById: async (id: string): Promise<Product | undefined> => {
      const products: Product[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]');
      return products.find(p => p.id === id);
    },
    addReview: async (productId: string, userId: string, review: Omit<Review, 'id' | 'date' | 'isVerified'>): Promise<Product> => {
      await delay(800);
      const products: Product[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]');
      const users: User[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
      
      const user = users.find(u => u.id === userId);
      if (!user) throw new Error('Unauthorized');

      const productIndex = products.findIndex(p => p.id === productId);
      if (productIndex === -1) throw new Error('Product not found');
      
      const hasOrdered = user.orders.some(o => 
        o.items.some(i => i.id === productId) && o.status !== 'Cancelled'
      );
      
      if (!hasOrdered) throw new Error('Only purchasers can review this fragrance.');

      const newReview: Review = {
        ...review,
        id: 'rev-' + Date.now(),
        date: new Date().toLocaleDateString(),
        isVerified: true
      };
      
      const currentReviews = products[productIndex].customerReviews || [];
      const updatedReviews = [newReview, ...currentReviews];
      
      const avgRating = updatedReviews.reduce((acc, r) => acc + r.rating, 0) / updatedReviews.length;
      
      products[productIndex] = {
        ...products[productIndex],
        customerReviews: updatedReviews,
        rating: Number(avgRating.toFixed(1)),
        reviews: updatedReviews.length
      };
      
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
      return products[productIndex];
    },
    update: async (product: Product): Promise<Product> => {
      const products: Product[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]');
      const index = products.findIndex(p => p.id === product.id);
      if (index !== -1) {
        products[index] = product;
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
        return product;
      }
      throw new Error('Product not found');
    },
    delete: async (id: string): Promise<void> => {
      const products: Product[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]');
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products.filter(p => p.id !== id)));
    },
    add: async (product: Omit<Product, 'id'>): Promise<Product> => {
      const products: Product[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]');
      const newProduct = { ...product, id: 'prod-' + Date.now(), reviews: 0, rating: 0 };
      products.push(newProduct as any);
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
      return newProduct as any;
    }
  },
  settings: {
    get: async () => {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || '{}');
    },
    update: async (settings: any) => {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    },
    getHeroProductId: async (): Promise<string> => {
      const settings = JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || '{"heroProductId": "1"}');
      return settings.heroProductId;
    },
    setHeroProductId: async (id: string): Promise<void> => {
      const current = JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || '{}');
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({ ...current, heroProductId: id }));
    }
  },
  promos: {
    getAll: async () => {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.PROMOS) || '[]');
    },
    add: async (promo: { code: string, discount: number }) => {
      const promos = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROMOS) || '[]');
      promos.push(promo);
      localStorage.setItem(STORAGE_KEYS.PROMOS, JSON.stringify(promos));
    },
    remove: async (code: string) => {
      const promos = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROMOS) || '[]');
      localStorage.setItem(STORAGE_KEYS.PROMOS, JSON.stringify(promos.filter((p: any) => p.code !== code)));
    }
  },
  orders: {
    create: async (order: Order): Promise<Order> => {
      await delay(800);
      const products: Product[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]');
      
      for (const item of order.items) {
        const product = products.find(p => p.id === item.id);
        if (!product || product.stock < item.quantity) {
           throw new Error(`Insufficient stock for ${item.name}. It may have been sold out while you were browsing.`);
        }
      }

      order.items.forEach(item => {
        const pIdx = products.findIndex(p => p.id === item.id);
        if (pIdx !== -1) products[pIdx].stock -= item.quantity;
      });

      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
      const orders: Order[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
      orders.push(order);
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));

      const users: User[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
      const uIdx = users.findIndex(u => u.id === order.userId);
      if (uIdx !== -1) {
        users[uIdx].orders = [order, ...users[uIdx].orders];
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      }
      return order;
    },
    getAll: async (): Promise<Order[]> => {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
    },
    updateStatus: async (orderId: string, status: Order['status']): Promise<void> => {
      const orders: Order[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
      const oIdx = orders.findIndex(o => o.id === orderId);
      if (oIdx !== -1) {
        orders[oIdx].status = status;
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
        const users: User[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
        const uIdx = users.findIndex(u => u.id === orders[oIdx].userId);
        if (uIdx !== -1) {
           users[uIdx].orders = users[uIdx].orders.map(o => o.id === orderId ? { ...o, status } : o);
           localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
        }
      }
    }
  },
  users: {
    getAll: async (): Promise<User[]> => {
      const users: User[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
      return users.filter(u => u.role !== 'admin');
    },
    getById: async (id: string): Promise<User | undefined> => {
      const users: User[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
      return users.find(u => u.id === id);
    }
  }
};
