// Product interface
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  created_at?: string;
  updated_at?: string;
}

// Product form data interface
export interface ProductFormData {
  name: string;
  description: string;
  price: string;
  stock: string;
}

// Dashboard statistics interface
export interface DashboardStats {
  totalProducts: number;
  totalInbound: number;
  totalOutbound: number;
  dbStatus: 'connected' | 'error' | 'unknown';
}