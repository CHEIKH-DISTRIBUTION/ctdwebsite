/**
 * Product types — aligned with the backend Product Mongoose model.
 * Source of truth: backend/src/models/Product.js
 */

export type ProductCategory = 'Alimentaire' | 'Hygiène' | 'Électroménager' | 'Vêtements';

export type ProductImage = {
  url: string;
  alt?: string;
  isPrimary: boolean;
};

export type ProductWeight = {
  value: number;
  unit: 'kg' | 'g' | 'l' | 'ml';
};

export type ProductDimensions = {
  length: number;
  width: number;
  height: number;
  unit: 'cm' | 'm';
};

export type ProductResponse = {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  images: ProductImage[];
  stock: number;
  minStock: number;
  sku: string;
  brand?: string;
  weight?: ProductWeight;
  dimensions?: ProductDimensions;
  isActive: boolean;
  isFeatured: boolean;
  tags: string[];
  rating: { average: number; count: number };
  createdAt: string;
  updatedAt: string;
};

export type ProductListParams = {
  page?: number;
  limit?: number;
  category?: ProductCategory;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  featured?: boolean;
  sort?: 'price_asc' | 'price_desc' | 'rating' | 'newest';
};

export type PaginatedProducts = {
  products: ProductResponse[];
  pagination: {
    current: number;
    pages: number;
    total: number;
    limit: number;
  };
};
