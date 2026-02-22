'use strict';

/**
 * OrderItem — value object representing a line in an order.
 * Pure domain logic, no framework dependency.
 */
class OrderItem {
  /**
   * @param {object} props
   * @param {string|null} props.productId
   * @param {string|null} props.packId
   * @param {number} props.quantity
   * @param {number} props.price  Unit price at time of order
   * @param {string} props.name   Snapshot of the product/pack name
   */
  constructor({ productId = null, packId = null, quantity, price, name }) {
    if (!productId && !packId) {
      throw new Error("Un article doit référencer un produit ou un pack");
    }
    if (!quantity || quantity < 1) {
      throw new Error("La quantité doit être au moins 1");
    }
    if (price === undefined || price === null || price < 0) {
      throw new Error("Le prix ne peut pas être négatif");
    }

    this.productId = productId;
    this.packId = packId;
    this.quantity = quantity;
    this.price = price;
    this.name = name;
    this.total = price * quantity;
  }
}

module.exports = { OrderItem };
