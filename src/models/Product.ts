export interface IProduct {
  _id?: string;
  title: string;
  description: string;
  price: number;
  category: "Plain Totes" | "Premium" | "Customized" | "Hampers";
  images: string[];
  isCustomizable: boolean;
  stock: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

// Mock model for compatibility
const Product = {};
export default Product;
