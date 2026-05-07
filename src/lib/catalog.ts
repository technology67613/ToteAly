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
    id: "plain-canvas-tote",
    _id: "plain-canvas-tote",
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
    id: "premium-structured-tote",
    _id: "premium-structured-tote",
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
    id: "midnight-black-tote",
    _id: "midnight-black-tote",
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
    id: "gift-ready-hamper",
    _id: "gift-ready-hamper",
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
