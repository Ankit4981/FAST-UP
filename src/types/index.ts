export type ProductCategory =
  | "Sports Nutrition"
  | "Daily Nutrition"
  | "Women's Nutrition"
  | "Kidz Nutrition"
  | "Plant Power"
  | "Pre-Workout"
  | "Energy Drinks"
  | "Bundles";

export type Product = {
  id: string;
  slug: string;
  name: string;
  price: number;
  mrp: number;
  description: string;
  longDescription: string;
  images: string[];
  category: ProductCategory;
  rating: number;
  reviewCount: number;
  tags: string[];
  goalTags: string[];
  flavours: Array<{
    name: string;
    color: string;
  }>;
  badge?: string;
  nutrition: string[];
  howToUse: string;
  stock: number;
  featured?: boolean;
  imageAccent: string;
};

export type ProductQuery = {
  category?: string;
  tags?: string[];
  minPrice?: number;
  maxPrice?: number;
  sort?: "price-asc" | "price-desc" | "rating-desc" | "newest";
  search?: string;
  limit?: number;
};

export type CartItem = Product & {
  quantity: number;
};

export type Address = {
  fullName: string;
  phone: string;
  email: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
};

export type OrderStatus =
  | "placed"
  | "packed"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "refund_processing";

export type OrderLine = {
  productId: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  quantity: number;
};

export type Order = {
  id: string;
  orderNumber: string;
  userEmail: string;
  address: Address;
  items: OrderLine[];
  subtotal: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  paymentMode: "cod" | "upi";
  createdAt: string;
  estimatedDelivery: string;
};

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};
