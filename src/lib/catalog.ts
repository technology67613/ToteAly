export type CatalogProduct = {
  id: string;
  _id: string;
  title: string;
  price: number;
  description: string;
  category: string;
  images: string[];
  is_customizable: boolean;
  isCustomizable: boolean;
  is_featured: boolean;
  isFeatured: boolean;
  stock: number;
};

export const FALLBACK_PRODUCTS: CatalogProduct[] = [
  {
    id: "e0df39a3-5c21-4fa3-9097-40d99ef87b01",
    _id: "e0df39a3-5c21-4fa3-9097-40d99ef87b01",
    title: "Everyday Canvas Tote",
    price: 599,
    description: "A clean cotton canvas tote for daily errands, college runs, and coffee plans.",
    category: "Plain Totes",
    images: ["/products/plain.png"],
    is_customizable: true,
    isCustomizable: true,
    is_featured: true,
    isFeatured: true,
    stock: 24,
  },
  {
    id: "e0df39a3-5c21-4fa3-9097-40d99ef87b02",
    _id: "e0df39a3-5c21-4fa3-9097-40d99ef87b02",
    title: "Premium Structured Tote",
    price: 1199,
    description: "A sturdier statement tote with a premium finish and extra room for your day.",
    category: "Premium",
    images: ["/products/premium.png"],
    is_customizable: true,
    isCustomizable: true,
    is_featured: true,
    isFeatured: true,
    stock: 14,
  },
  {
    id: "e0df39a3-5c21-4fa3-9097-40d99ef87b03",
    _id: "e0df39a3-5c21-4fa3-9097-40d99ef87b03",
    title: "Midnight Black Tote",
    price: 899,
    description: "A bold black tote made for high-contrast prints, initials, and minimal artwork.",
    category: "Premium",
    images: ["/products/black.png"],
    is_customizable: true,
    isCustomizable: true,
    is_featured: true,
    isFeatured: true,
    stock: 18,
  },
  {
    id: "e0df39a3-5c21-4fa3-9097-40d99ef87b04",
    _id: "e0df39a3-5c21-4fa3-9097-40d99ef87b04",
    title: "Gift Ready Hamper",
    price: 1599,
    description: "A curated tote gift set for birthdays, bridesmaids, and festive gifting.",
    category: "Hampers",
    images: ["/products/hamper.png"],
    is_customizable: false,
    isCustomizable: false,
    is_featured: true,
    isFeatured: true,
    stock: 10,
  },
];

export function getFallbackProduct(id: string) {
  return FALLBACK_PRODUCTS.find((product) => product.id === id || product._id === id) || null;
}
