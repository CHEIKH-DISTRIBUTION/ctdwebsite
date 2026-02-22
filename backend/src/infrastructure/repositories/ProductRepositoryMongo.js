'use strict';

const ProductModel = require('../../models/Product');
const { IProductRepository } = require('../../domain/repositories/IProductRepository');
const { InsufficientStockError } = require('../../domain/errors/DomainError');

/**
 * ProductRepositoryMongo — Mongoose implementation of IProductRepository.
 *
 * All MongoDB-specific code is confined here; the domain never touches Mongoose.
 */
class ProductRepositoryMongo extends IProductRepository {
  async findById(id) {
    return ProductModel.findById(id);
  }

  /**
   * Atomically decrement stock for each reservation.
   * Uses a conditional update ($gte guard) to prevent overselling.
   * Processes sequentially — use MongoDB sessions for true ACID transactions.
   *
   * @param {{ productId: string, quantity: number }[]} reservations
   */
  async reserveStock(reservations) {
    for (const { productId, quantity } of reservations) {
      const updated = await ProductModel.findOneAndUpdate(
        { _id: productId, stock: { $gte: quantity } },
        { $inc: { stock: -quantity } },
        { new: true }
      );

      if (!updated) {
        // Race condition: another request claimed the last units
        const product = await ProductModel.findById(productId);
        const available = product?.stock ?? 0;
        const name      = product?.name  ?? productId;
        throw new InsufficientStockError(name, available, quantity);
      }
    }
  }

  /**
   * Restore stock on order cancellation.
   * @param {{ productId: string, quantity: number }[]} releases
   */
  async releaseStock(releases) {
    for (const { productId, quantity } of releases) {
      await ProductModel.findByIdAndUpdate(productId, { $inc: { stock: quantity } });
    }
  }
}

module.exports = { ProductRepositoryMongo };
