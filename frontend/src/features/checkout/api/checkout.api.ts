/**
 * checkout.api — the single call that submits an order to the backend.
 *
 * CLAUDE.md §13: Only this flow is connected: UI Checkout → POST /api/v2/orders
 *
 * The frontend sends user INTENT only:
 *   - Which products, in what quantities
 *   - Where to deliver
 *   - How to pay
 *
 * The backend (CreateOrder.usecase) is the source of truth for:
 *   - stock availability
 *   - final price computation
 *   - order number generation
 */

import { httpClient } from '@/shared/api/httpClient';
import type { CreateOrderCommand, OrderResponse } from '@/shared/types/order.types';

type CreateOrderResult = { order: OrderResponse };

export type PaymentRecord = {
  _id: string;
  order: string;
  amount: number;
  method: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
};

type InitiatePaymentResult = {
  payment: PaymentRecord;
  nextAction?: string; // Payment URL returned by Wave / Orange Money
};

export type CouponValidation = {
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxDiscount: number | null;
  discount: number; // calculated discount for the given subtotal
};

export const checkoutApi = {
  /**
   * Submit a new order to the DDD backend endpoint.
   * Throws ApiError on validation or stock failure.
   */
  createOrder: (command: CreateOrderCommand): Promise<CreateOrderResult> =>
    httpClient.post<CreateOrderResult>('/api/v2/orders', command),

  /**
   * Initiate a Wave or Orange Money payment for an existing order.
   * Returns a payment record + an optional redirect URL (nextAction).
   */
  initiatePayment: (data: {
    orderId:       string;
    paymentMethod: 'wave' | 'orange_money';
    phone:         string;
  }): Promise<InitiatePaymentResult> =>
    httpClient.post<InitiatePaymentResult>('/api/payments', {
      orderId:       data.orderId,
      paymentMethod: data.paymentMethod,
      paymentDetails: { phone: data.phone },
    }),

  /**
   * Poll the status of a payment.
   */
  getPaymentStatus: (paymentId: string): Promise<PaymentRecord> =>
    httpClient.get<PaymentRecord>(`/api/payments/${paymentId}/status`),

  /**
   * Validate a coupon code and get the discount amount.
   */
  validateCoupon: (code: string, subtotal: number): Promise<CouponValidation> =>
    httpClient.post<CouponValidation>('/api/coupons/validate', { code, subtotal }),
};
