export interface IProduct {
  id?: string;
  title: string;
  description?: string;
  price: number;
  category: "Plain Totes" | "Premium" | "Customized" | "Hampers" | string;
  images: string[];
  stock: number;
  is_customizable: boolean;
  is_featured: boolean;
  created_at?: Date | string;
  updated_at?: Date | string;
}
