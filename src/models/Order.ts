export interface IOrder {
  id?: string;
  user_id?: string;
  total_amount: number;
  status: "Pending" | "Confirmed" | "Shipped" | "Delivered" | "Cancelled";
  payment_status: "Pending" | "Paid" | "Failed";
  payment_id?: string;
  shipping_details?: Record<string, any>;
  created_at?: Date | string;
}

export interface IOrderItem {
  id?: string;
  order_id?: string;
  product_id?: string;
  name: string;
  price: number;
  quantity: number;
  is_customized: boolean;
  customization_details?: Record<string, any>;
}
