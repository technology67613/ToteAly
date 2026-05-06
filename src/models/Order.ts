export interface IOrder {
  _id?: string;
  user: any;
  products: any[];
  totalAmount: number;
  paymentId: string;
  shippingDetails: any;
  status: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

// Mock model for compatibility
const Order = {};
export default Order;
