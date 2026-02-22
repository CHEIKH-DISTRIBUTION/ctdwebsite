'use strict';

/**
 * asyncHandler — wraps an async Express route handler so that any
 * rejected promise is forwarded to Express's error-handling middleware
 * via `next(err)` instead of causing an unhandled rejection.
 *
 * Usage:
 *   router.get('/route', asyncHandler(async (req, res) => { ... }));
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
