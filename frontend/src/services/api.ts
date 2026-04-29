import axios from 'axios';
import type { RegisterData, LoginData, LoginResponse, User } from '../types/auth';
import type {Product, Category, Cart, CouponResponse, GiftCardResponse, Order} from '../types/shop';
import type { DashboardData } from '../types/analytics';

// ─── AUTH SERVICE ─────────────────────────────────────────
const authAPI = axios.create({
  baseURL: 'http://localhost:80',   // ← was http://127.0.0.1:8001
});

authAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const registerUser = (data: RegisterData) =>
  authAPI.post<User>('/auth/register/', data);

export const loginUser = (data: LoginData) =>
  authAPI.post<LoginResponse>('/auth/login/', data);

export const getMe = () =>
  authAPI.get<User>('/auth/me/');


// ─── API SERVICE ──────────────────────────────────────────
const shopAPI = axios.create({
  baseURL: 'http://localhost:80',   // ← was http://127.0.0.1:8002
});

shopAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});



// ─── CALLING API DATA ──────────────────────────────────────────
export const getProducts   = (categoryId?: number) =>
  shopAPI.get<Product[]>('/api/products/', {
    params: categoryId ? { category: categoryId } : {}
  });

export const getCategories = () =>
  shopAPI.get<Category[]>('/api/categories/');

// ─── CART ─────────────────────────────────────────────────
export const getCart = () =>
  shopAPI.get<Cart>('/api/cart/');

export const addToCart = (product_id: number, quantity: number) =>
  shopAPI.post<Cart>('/api/cart/', { product_id, quantity });

export const removeFromCart = (item_id: number) =>
  shopAPI.delete('/api/cart/', { data: { item_id } });

export const toggleSaveForLater = (item_id: number) =>
  shopAPI.patch(`/api/cart/items/${item_id}/save/`);

// ─── COUPON & GIFT CARD ───────────────────────────────────
export const validateCoupon = (code: string, order_total: number) =>
  shopAPI.post<CouponResponse>('/api/coupons/validate/', { code, order_total });

export const validateGiftCard = (code: string) =>
  shopAPI.post<GiftCardResponse>('/api/giftcards/validate/', { code });

// ─── ORDERS ───────────────────────────────────────────────
export const placeOrder = (data: {
  items:          { product_id: number; quantity: number }[];
  coupon_code?:    string;
  gift_card_code?: string;
  payment_method:  string;
}) => shopAPI.post<Order>('/api/orders/', data);

export const getOrders = () =>
  shopAPI.get<Order[]>('/api/orders/');

export const getOrderById = (id: number) =>
  shopAPI.get<Order>(`/api/orders/${id}/`);


// ─── ADMIN ────────────────────────────────────────────────
export const adminGetAllOrders = () =>
  shopAPI.get<Order[]>('/api/admin/orders/');

export const adminUpdateOrderStatus = (id: number, status: string) =>
  shopAPI.patch(`/api/admin/orders/${id}/`, { status });

export const adminGetDashboard = () =>
  shopAPI.get<DashboardData>('/analytics/dashboard/');

export const adminCreateProduct = (data: Omit<Product, 'id' | 'category_name'>) =>
  shopAPI.post<Product>('/api/products/', data);

export const adminUpdateProduct = (id: number, data: Partial<Product>) =>
  shopAPI.put<Product>(`/api/products/${id}/`, data);

export const adminDeleteProduct = (id: number) =>
  shopAPI.delete(`/api/products/${id}/`);

export const adminCreateCategory = (data: Omit<Category, 'id'>) =>
  shopAPI.post<Category>('/api/admin/categories/', data);

export const adminCreateCoupon = (data: any) =>
  shopAPI.post('/api/admin/coupons/', data);

export const adminGetCoupons = () =>
  shopAPI.get('/api/admin/coupons/');

export const adminCreateGiftCard = (data: any) =>
  shopAPI.post('/api/admin/giftcards/', data);

export const adminGetGiftCards = () =>
  shopAPI.get('/api/admin/giftcards/');

// ─── ANALYTICS SERVICE ────────────────────────────────────
export const getAnalytics = () =>
  shopAPI.get('/analytics/dashboard/');