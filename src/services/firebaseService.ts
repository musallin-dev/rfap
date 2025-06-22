import { database } from '../config/firebase';
import { ref, set, get, push, update, remove } from 'firebase/database';

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  images: string[];
  video?: string;
  category: string;
  stock: number;
  extraFields?: { [key: string]: any };
  addons?: { name: string; price: number }[];
}

export interface Order {
  id: string;
  productId: string;
  customerName: string;
  phone: string;
  address: string;
  quantity: number;
  extraFields?: {
    deliveryNote?: string;
    jerseyDetails?: { 
      name: string;
      number: string;
      size: string;
    }[];
  };
  addons?: { name: string; price: number }[];
  totalPrice: number;
  securityCharge: number;
  paymentScreenshot?: string;
  senderNumber?: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  trackingSteps?: { step: string; completed: boolean; date?: string }[];
  createdAt: string;
}

export const initializeDemoData = async () => {
  try {
    const snapshot = await get(ref(database, 'products'));
    if (!snapshot.exists()) {
      const demoProducts: Product[] = [
        {
          id: 'p1',
          name: 'কাস্টম জার্সি',
          price: 1200,
          description: '<p>উচ্চ মানের কাস্টম জার্সি। যেকোনো ডিজাইন এবং নাম্বার প্রিন্ট করা যায়।</p><ul><li>১০০% পলিয়েস্টার</li><li>ড্রাই ফিট ম্যাটেরিয়াল</li><li>কাস্টম নাম এবং নাম্বার</li></ul>',
          images: [
            'https://images.pexels.com/photos/114296/pexels-photo-114296.jpeg',
            'https://images.pexels.com/photos/1618932/pexels-photo-1618932.jpeg'
          ],
          video: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
          category: 'জার্সি',
          stock: 50,
          extraFields: {
            deliveryNote: '',
          },
          addons: [
            { name: 'সামনে নাম্বার প্রিন্ট', price: 100 }
          ]
        }
      ];

      for (const product of demoProducts) {
        await set(ref(database, `products/${product.id}`), product);
      }
    }
  } catch (error) {
    console.error('Error initializing demo data:', error);
  }
};

export const getProduct = async (id: string): Promise<Product | null> => {
  try {
    const snapshot = await get(ref(database, `products/${id}`));
    return snapshot.exists() ? snapshot.val() : null;
  } catch (error) {
    console.error('Error getting product:', error);
    return null;
  }
};

export const getAllProducts = async (): Promise<Product[]> => {
  try {
    const snapshot = await get(ref(database, 'products'));
    if (snapshot.exists()) {
      return Object.values(snapshot.val());
    }
    return [];
  } catch (error) {
    console.error('Error getting products:', error);
    return [];
  }
};

export const createOrder = async (order: Omit<Order, 'id' | 'createdAt'>): Promise<string> => {
  try {
    const orderRef = push(ref(database, 'orders'));
    const orderId = orderRef.key!;
    const newOrder: Order = {
      ...order,
      id: orderId,
      createdAt: new Date().toISOString(),
      trackingSteps: [
        { step: 'অর্ডার প্রাপ্ত', completed: true, date: new Date().toLocaleDateString('bn-BD') },
        { step: 'পেমেন্ট যাচাই', completed: false },
        { step: 'প্রোডাকশন শুরু', completed: false },
        { step: 'শিপমেন্ট প্রস্তুত', completed: false },
        { step: 'ডেলিভারি সম্পন্ন', completed: false }
      ]
    };

    await set(orderRef, newOrder);
    return orderId;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

export const getOrder = async (id: string): Promise<Order | null> => {
  try {
    const snapshot = await get(ref(database, `orders/${id}`));
    return snapshot.exists() ? snapshot.val() : null;
  } catch (error) {
    console.error('Error getting order:', error);
    return null;
  }
};

export const getAllOrders = async (): Promise<Order[]> => {
  try {
    const snapshot = await get(ref(database, 'orders'));
    if (snapshot.exists()) {
      return Object.values(snapshot.val());
    }
    return [];
  } catch (error) {
    console.error('Error getting orders:', error);
    return [];
  }
};

export const updateOrder = async (id: string, updates: Partial<Order>): Promise<void> => {
  try {
    await update(ref(database, `orders/${id}`), updates);
  } catch (error) {
    console.error('Error updating order:', error);
    throw error;
  }
};

export const deleteOrder = async (id: string): Promise<void> => {
  try {
    await remove(ref(database, `orders/${id}`));
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error;
  }
};

export const createProduct = async (product: Omit<Product, 'id'> & { id: string }): Promise<void> => {
  try {
    await set(ref(database, `products/${product.id}`), product);
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

export const updateProduct = async (id: string, updates: Partial<Product>): Promise<void> => {
  try {
    await update(ref(database, `products/${id}`), updates);
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

export const deleteProduct = async (id: string): Promise<void> => {
  try {
    await remove(ref(database, `products/${id}`));
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};