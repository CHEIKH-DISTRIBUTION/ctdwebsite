'use strict';

/**
 * ErrorResponse — custom Error subclass that carries an HTTP status code.
 *
 * Used by controllers that rely on the asyncHandler + global error middleware
 * pattern: throw an ErrorResponse and the error handler will use its
 * `statusCode` to set the HTTP response status.
 */
class ErrorResponse extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ErrorResponse;
