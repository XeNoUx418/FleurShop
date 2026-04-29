export interface DashboardSummary {
  total_revenue: number;
  total_orders: number;
}

export interface DailyRevenue {
  date: string;
  revenue: string;
  order_count: number;
}

export interface ProductStat {
  product_id: number;
  product_name: string;
  units_sold: number;
  revenue: string;
  order_count: number;
}

export interface HourlyStat {
  hour: number;
  order_count: number;
}

export interface OrderStatusStat {
  status: string;
  count: number;
}

export interface RecentEvent {
  event_type: string;
  order_id: number;
  customer_name: string;
  total: string;
  status: string;
  occurred_at: string;
}

export interface DashboardData {
  summary: DashboardSummary;
  daily_revenue: DailyRevenue[];
  top_products: ProductStat[];
  hourly: HourlyStat[];
  status_counts: OrderStatusStat[];
  recent_events: RecentEvent[];
}