'use strict';

const { InvalidOrderTransitionError, UnauthorizedError } = require('../errors/DomainError');

/** All valid order states. */
const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'preparing',
  'ready',
  'delivering',
  'delivered',
  'cancelled',
  'refunded',
];

/** Allowed state transitions (domain rule). */
const TRANSITIONS = {
  pending:    ['confirmed', 'cancelled'],
  confirmed:  ['preparing', 'cancelled'],
  preparing:  ['ready', 'cancelled'],
  ready:      ['delivering'],
  delivering: ['delivered'],
  delivered:  ['refunded'],
  cancelled:  [],
  refunded:   [],
};

/** Delivery is free above this threshold (XOF). */
const DELIVERY_FREE_THRESHOLD = 50_000;
const DELIVERY_FEE_STANDARD   = 2_000;

/**
 * Order — core domain entity.
 * Encapsulates order lifecycle and business invariants.
 * Has NO dependency on Express, Mongoose, or any framework.
 */
class Order {
  /**
   * @param {object} props
   * @param {string|null}      props.id
   * @param {string|null}      props.orderNumber
   * @param {string}           props.userId
   * @param {OrderItem[]}      props.items
   * @param {string}           props.paymentMethod
   * @param {object}           props.deliveryAddress
   * @param {object}           props.contactInfo
   * @param {object}           [props.notes]
   * @param {string}           [props.status]
   * @param {object[]}         [props.tracking]
   * @param {string|null}      [props.couponCode]
   * @param {number}           [props.discount]
   */
  constructor({
    id = null,
    orderNumber = null,
    userId,
    items,
    paymentMethod,
    deliveryAddress,
    contactInfo,
    notes = {},
    status = 'pending',
    tracking = [],
    couponCode = null,
    discount = 0,
  }) {
    this.id            = id;
    this.orderNumber   = orderNumber;
    this.userId        = userId;
    this.items         = items;
    this.paymentMethod = paymentMethod;
    this.deliveryAddress = deliveryAddress;
    this.contactInfo   = contactInfo;
    this.notes         = notes;
    this.status        = status;
    this.tracking      = tracking;
    this.couponCode    = couponCode;
    this.discount      = discount;

    this.subtotal    = this._calculateSubtotal();
    this.deliveryFee = this._calculateDeliveryFee();
    this.total       = this.subtotal - this.discount + this.deliveryFee;
  }

  // ── Calculations ──────────────────────────────────────────────────────────

  _calculateSubtotal() {
    return this.items.reduce((sum, item) => sum + item.total, 0);
  }

  _calculateDeliveryFee() {
    return this.subtotal >= DELIVERY_FREE_THRESHOLD ? 0 : DELIVERY_FEE_STANDARD;
  }

  // ── State machine ─────────────────────────────────────────────────────────

  /**
   * Returns true when transitioning to `newStatus` is valid from current state.
   * @param {string} newStatus
   */
  canTransitionTo(newStatus) {
    return (TRANSITIONS[this.status] ?? []).includes(newStatus);
  }

  /**
   * Transitions the order to a new status and records it in the tracking log.
   * Throws InvalidOrderTransitionError if the transition is not allowed.
   *
   * @param {string} newStatus
   * @param {string} message    Human-readable reason
   * @param {string} updatedBy  User ID performing the transition
   */
  transitionTo(newStatus, message, updatedBy) {
    if (!this.canTransitionTo(newStatus)) {
      throw new InvalidOrderTransitionError(this.status, newStatus);
    }
    this.status = newStatus;
    this._addTracking(newStatus, message, updatedBy);
  }

  /**
   * Appends an entry to the tracking log without changing the status.
   */
  addTrackingEntry(status, message, updatedBy) {
    this._addTracking(status, message, updatedBy);
  }

  _addTracking(status, message, updatedBy) {
    this.tracking.push({ status, message, updatedBy, timestamp: new Date() });
  }

  // ── Authorization helpers ─────────────────────────────────────────────────

  /**
   * Returns true if the given user is allowed to cancel this order.
   */
  canBeCancelledBy(userId, role) {
    const nonCancellableStatuses = ['delivered', 'cancelled', 'refunded'];
    if (role === 'admin') {
      return !nonCancellableStatuses.includes(this.status);
    }
    return (
      this.userId.toString() === userId.toString() &&
      !['delivered', 'cancelled', 'refunded', 'delivering'].includes(this.status)
    );
  }

  /**
   * Asserts the given user can view this order; throws UnauthorizedError otherwise.
   */
  assertViewableBy(userId, role) {
    if (role !== 'customer') return; // admins and delivery agents see everything
    if (this.userId.toString() !== userId.toString()) {
      throw new UnauthorizedError('Accès non autorisé à cette commande');
    }
  }
}

module.exports = { Order, ORDER_STATUSES, TRANSITIONS, DELIVERY_FREE_THRESHOLD, DELIVERY_FEE_STANDARD };
