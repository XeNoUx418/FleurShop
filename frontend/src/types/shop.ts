export interface Category {
  id:          number;
  name:        string;
  description: string;
}

export interface Product {
  id:            number;
  name:          string;
  description:   string;
  price:         number;
  stock:         number;
  category:      number;
  category_name: string;
  image_url:     string;
}

export interface CartItem {
  id:            number;
  product:       number;
  product_name:  string;
  product_price: number;
  quantity:      number;
  saved_for_later: boolean;
  expires_at:    string;
  is_expired:    boolean;
  subtotal:      number;
}

export interface Cart {
  id:                number;
  customer_username: string;
  active_items:      CartItem[];
  saved_items:       CartItem[];
  cart_total:        number;
}

export interface OrderItem {
  id:           number;
  product:      number;
  product_name: string;
  quantity:     number;
  price:        number;
}

export interface Payment {
  id:             number;
  method:         string;
  status:         string;
  amount:         number;
  transaction_id: string;
  paid_at:        string | null;
}

export interface Order {
  id:                number;
  customer_email:    string;
  customer_username: string;
  status:            string;
  original_total:    number;
  discount_amount:   number;
  gift_card_amount:  number;
  final_total:       number;
  created_at:        string;
  items:             OrderItem[];
  payment:           Payment;
}

export interface CouponResponse {
  coupon:            { id: number; code: string; coupon_type: string; value: number };
  original_total:    number;
  discounted_total:  number;
  you_save:          number;
}

export interface GiftCardResponse {
  id:                number;
  code:              string;
  remaining_balance: number;
  expires_at:        string;
}