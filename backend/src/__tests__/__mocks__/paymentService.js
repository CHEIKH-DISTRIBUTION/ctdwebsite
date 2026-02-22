'use strict';

/**
 * Stub for src/services/paymentService.js
 *
 * The real service requires `axios` (not installed as a dev dependency)
 * and external API credentials.  This stub lets the payment controller
 * load correctly during tests without triggering real payment API calls.
 *
 * Mapped via jest.e2e.config.js → moduleNameMapper.
 */
module.exports = {
  initiateWavePayment:        async () => ({ status: 'pending', transactionId: 'stub-wave-txn' }),
  initiateOrangeMoneyPayment: async () => ({ status: 'pending', transactionId: 'stub-orange-txn' }),
  processCardPayment:         async () => ({ status: 'pending', transactionId: 'stub-card-txn' }),
  verifyWavePayment:          async () => ({ status: 'pending' }),
  verifyOrangeMoneyPayment:   async () => ({ status: 'pending' }),
};
