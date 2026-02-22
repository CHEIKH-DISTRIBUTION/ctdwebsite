'use strict';

class DomainError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'DomainError';
    this.code = code;
  }
}

class InsufficientStockError extends DomainError {
  constructor(productName, available, requested) {
    super(
      `Stock insuffisant pour ${productName}. Disponible: ${available}, Requis: ${requested}`,
      'INSUFFICIENT_STOCK'
    );
    this.name = 'InsufficientStockError';
    this.productName = productName;
    this.available = available;
    this.requested = requested;
  }
}

class ProductNotFoundError extends DomainError {
  constructor(productId) {
    super(`Produit ${productId} non trouvé`, 'PRODUCT_NOT_FOUND');
    this.name = 'ProductNotFoundError';
    this.productId = productId;
  }
}

class OrderNotFoundError extends DomainError {
  constructor(orderId) {
    super(`Commande ${orderId} non trouvée`, 'ORDER_NOT_FOUND');
    this.name = 'OrderNotFoundError';
    this.orderId = orderId;
  }
}

class InvalidOrderTransitionError extends DomainError {
  constructor(from, to) {
    super(`Transition de statut invalide: ${from} → ${to}`, 'INVALID_ORDER_TRANSITION');
    this.name = 'InvalidOrderTransitionError';
    this.from = from;
    this.to = to;
  }
}

class UnauthorizedError extends DomainError {
  constructor(message) {
    super(message || 'Action non autorisée', 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

class EmptyOrderError extends DomainError {
  constructor() {
    super('La commande doit contenir au moins un produit ou un pack', 'EMPTY_ORDER');
    this.name = 'EmptyOrderError';
  }
}

module.exports = {
  DomainError,
  InsufficientStockError,
  ProductNotFoundError,
  OrderNotFoundError,
  InvalidOrderTransitionError,
  UnauthorizedError,
  EmptyOrderError,
};
