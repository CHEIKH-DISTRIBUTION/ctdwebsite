/**
 * Pack types — aligned with the backend Pack Mongoose model.
 * Source of truth: backend/src/models/Pack.js
 */

export type PackCategory = 'alimentaire' | 'hygiene' | 'composite';

export type PackItemResponse = {
  product: {
    _id:    string;
    name:   string;
    price:  number;
    images: { url: string; isPrimary?: boolean }[];
  } | null;
  quantity:               number;
  priceAtTimeOfAddition:  number;
  name:                   string;
};

export type PackResponse = {
  _id:           string;
  name:          string;
  description?:  string;
  items:         PackItemResponse[];
  originalPrice: number;
  price:         number;
  discount?:     number;
  category:      PackCategory;
  isFeatured:    boolean;
  isCustom:      boolean;
  image?:        { url: string; alt?: string };
  tags:          string[];
  isActive:      boolean;
  createdAt:     string;
  updatedAt:     string;
};
