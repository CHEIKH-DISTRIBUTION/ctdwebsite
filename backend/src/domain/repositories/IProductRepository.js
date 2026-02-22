'use strict';

/**
 * IProductRepository — persistence contract for Products.
 */
class IProductRepository {
  /**
   * @param   {string} id
   * @returns {Promise<object|null>}
   */
  async findById(id) {
    throw new Error('IProductRepository.findById() not implemented');
  }

  /**
   * Atomically decrement stock for each entry in `reservations`.
   * Must throw if any product does not have sufficient stock.
   *
   * @param   {{ productId: string, quantity: number }[]} reservations
   * @returns {Promise<void>}
   */
  async reserveStock(reservations) {
    throw new Error('IProductRepository.reserveStock() not implemented');
  }

  /**
   * Atomically increment stock for each entry in `releases` (used on cancellation).
   *
   * @param   {{ productId: string, quantity: number }[]} releases
   * @returns {Promise<void>}
   */
  async releaseStock(releases) {
    throw new Error('IProductRepository.releaseStock() not implemented');
  }
}

module.exports = { IProductRepository };
