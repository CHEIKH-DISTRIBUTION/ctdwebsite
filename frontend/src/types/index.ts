// src/types/index.ts

export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "customer" | "deliverer" | "admin" | "manager";
  address: Address;
};

export type Address = {
  id: string;
  label: string; // ex: "Domicile", "Bureau"
  street: string;
  city: string;
  zipCode?: string;
  coordinates: { lat: number; lng: number };
  isDefault: boolean;
};

// src/types/index.ts
export type Product = {
  id: string;
  name: string;
  description: string;
  price: number; // en FCFA
  originalPrice?: number; // Prix avant réduction (optionnel)
  category: string;
  image: string;
  inStock: boolean;
  quantity: number;
  unit: string; // ex: "kg", "litre", "unité"
  isNew?: boolean; // Nouveau produit (optionnel)
  discount?: number; // Pourcentage de réduction (optionnel)
  rating?: number; // Note sur 5 (optionnel)
  reviewCount?: number; // Nombre d'avis (optionnel)
  tags?: string[]; // Étiquettes supplémentaires (optionnel)
  weight?: number; // Poids en grammes (optionnel)
  dimensions?: { // Dimensions du produit (optionnel)
    length: number;
    width: number;
    height: number;
  };
  brand?: string; // Marque du produit (optionnel)
  sku?: string; // Référence unique du produit (optionnel)
  isBestSeller?: string 
};

export type CartItem = {
  product: Product;
  quantity: number;
};

export type Order = {
  id: string;
  items: CartItem[];
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  deliveryAddress: Address;
  paymentMethod: "wave" | "orange-money" | "card";
  shippingMethod: string;
  createdAt: string;
  estimatedDelivery: string;
  shippingCost: number;
  trackingNumber: string;
  deliveredAt: string;
  shippingAddress: Address;
  paymentStatus: "paid" | "unpaid" | "refunded";
  
};

export type Offer = {
  id: string;
  title: string;
  description: string;
  image: string;
  discount: string;
  validUntil: string;
  category?: string;
};