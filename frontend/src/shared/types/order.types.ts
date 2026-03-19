/**
 * Order types — aligned with the backend domain model.
 * Source of truth: backend/src/domain/entities/Order.js
 *
 * IMPORTANT (CLAUDE.md §12): Frontend must NEVER compute prices or
 * validate stock. All values come from backend responses.
 */

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'delivering'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'refunded';

/** Must match backend Order model enum exactly */
export type PaymentMethod = 'wave' | 'orange_money' | 'cash' | 'bank_transfer';

export type DeliveryAddress = {
  street: string;
  city: string;
  region?: string;
  postalCode?: string;
  country?: string;
  instructions?: string;
};

export type ContactInfo = {
  phone: string;
  alternativePhone?: string;
  email?: string;
};

export type OrderTrackingEntry = {
  status: OrderStatus;
  message: string;
  timestamp: string;
  updatedBy?: { name: string } | null;
};

export type OrderItemResponse = {
  product?: { _id: string; name: string; price: number; images: { url: string }[] } | null;
  pack?: { _id: string; name: string; price: number } | null;
  quantity: number;
  price: number;
  name: string;
  total: number;
};

export type OrderResponse = {
  _id: string;
  orderNumber: string;
  user: { _id: string; name: string; email: string; phone: string };
  items: OrderItemResponse[];
  subtotal: number;
  deliveryFee: number;
  discount?: number;
  couponCode?: string | null;
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  deliveryAddress: DeliveryAddress;
  contactInfo: ContactInfo;
  notes?: { customer?: string; admin?: string; delivery?: string };
  tracking: OrderTrackingEntry[];
  deliveryPerson?: { _id: string; name: string; phone: string } | null;
  createdAt: string;
  updatedAt: string;
};

/** Command sent to POST /api/v2/orders */
export type CreateOrderCommand = {
  products: { product: string; quantity: number }[];
  packs: { pack: string; quantity: number }[];
  paymentMethod: PaymentMethod;
  deliveryAddress: DeliveryAddress;
  contactInfo: ContactInfo;
  notes?: { customer?: string };
  couponCode?: string;
};

export type PaginatedOrders = {
  orders: OrderResponse[];
  pagination: {
    current: number;
    pages: number;
    total: number;
    limit: number;
  };
};
