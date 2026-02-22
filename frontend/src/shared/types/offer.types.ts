export type OfferResponse = {
  _id: string;
  title: string;
  description?: string;
  image?: string;
  discount: string;
  validUntil: string;
  category?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};
