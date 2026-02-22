/**
 * User types — aligned with the backend User Mongoose model.
 * Source of truth: backend/src/models/User.js
 */

export type UserRole = 'customer' | 'admin' | 'delivery';

export type UserAddress = {
  street?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  country: string;
};

export type UserPreferences = {
  newsletter: boolean;
  smsNotifications: boolean;
};

export type UserResponse = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  isActive: boolean;
  address?: UserAddress;
  avatar?: string | null;
  preferences: UserPreferences;
  createdAt: string;
  updatedAt: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  phone: string;
  address?: Partial<UserAddress>;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type AuthResponse = {
  token: string;
  user: UserResponse;
};
