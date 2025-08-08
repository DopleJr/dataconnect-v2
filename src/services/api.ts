import axios from 'axios';
import { Product, ProductFormData, DashboardStats } from '../types';

interface SearchCondition {
  id: string;
  field: string;
  operation: string;
  value: string;
  boolean: 'AND' | 'OR';
}

// Configuration matching your Express server setup
const API_BASE_URLS = {
  localhost: 'http://localhost:3001/api',       // Matches PORT_LOCALHOST
  localNetwork: (ip: string) => `http://${ip}:3002/api`  // Matches PORT_LAN
};

const isLocalhost = window.location.hostname === 'localhost' || 
                    window.location.hostname === '127.0.0.1';

const getBaseURL = () => {
  if (process.env.NODE_ENV === 'production') {
    return 'https://your-production-api.com/api';
  }
  
  // Get current host IP (for local network access)
  const currentHost = window.location.hostname;
  
  return isLocalhost 
    ? API_BASE_URLS.localhost
    : API_BASE_URLS.localNetwork(currentHost);
};

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 600000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Check database connection
export const checkDatabaseConnection = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    console.error('Database connection check failed:', error);
    return { connected: false, error: 'Connection failed' };
  }
};

// Get dashboard statistics
export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const response = await api.get('/query/stats');
    return {
      totalProducts: response.data.totalInventory,
      totalInbound: response.data.totalInbound,
      totalOutbound: response.data.totalOutbound,
      dbStatus: 'connected'
    };
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error);
    return {
      totalProducts: 0,
      totalInbound: 0,
      totalOutbound: 0,
      dbStatus: 'error'
    };
  }
};

// Get all products with filtering and pagination
export const getAllProducts = async (params: { 
  page?: number; 
  limit?: number; 
  searchConditions?: SearchCondition[];
  type?: string; 
  signal?: AbortSignal;
  downloadMode?: boolean;
  countOnly?: boolean;
}): Promise<{ data: Product[]; total: number; page: number; totalPages: number }> => {
  try {
    if (params.searchConditions && params.searchConditions.length > 0) {
      const queryParams = {
        page: params.page,
        limit: params.limit,
        type: params.type,
        searchConditions: JSON.stringify(params.searchConditions),
        countOnly: params.countOnly
      };
      const response = await api.get('/query', { 
        params: queryParams,
        signal: params.signal
      });
      return response.data;
    } else {
      return { data: [], total: 0, page: 0, totalPages: 0 };
    }
  } catch (error) {
    if (error.name !== 'AbortError') {
      console.error('Error fetching products:', error);
    }
    throw error;
  }
};


// Get product by ID
export const getProductById = async (id: number): Promise<Product> => {
  try {
    const response = await api.get(`/query/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching product with id ${id}:`, error);
    throw error;
  }
};

// Create a new product
export const createProduct = async (productData: ProductFormData): Promise<Product> => {
  try {
    const response = await api.post('/query', productData);
    return response.data;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

// Update an existing product
export const updateProduct = async (id: number, productData: ProductFormData): Promise<Product> => {
  try {
    const response = await api.put(`/query/${id}`, productData);
    return response.data;
  } catch (error) {
    console.error(`Error updating product with id ${id}:`, error);
    throw error;
  }
};

// Delete a product
export const deleteProduct = async (id: number): Promise<void> => {
  try {
    await api.delete(`/query/${id}`);
  } catch (error) {
    console.error(`Error deleting product with id ${id}:`, error);
    throw error;
  }
};

// Get order summary data for dashboard
export const getOrderSummary = async (params: {
  startDate?: string;
  endDate?: string;
  orderTypes?: string[];
  page?: number;
  limit?: number;
}): Promise<{ data: any[]; total: number; page: number; totalPages: number }> => {
  try {
    const queryParams = {
      startDate: params.startDate,
      endDate: params.endDate,
      orderTypes: params.orderTypes?.join(','),
      page: params.page || 1,
      limit: params.limit || 1000
    };

    const response = await api.get('/dashboard/order-summary', { params: queryParams });
    return response.data;
  } catch (error) {
    console.error('Error fetching order summary:', error);
    throw error;
  }
};