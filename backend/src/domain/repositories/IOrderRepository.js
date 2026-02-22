'use strict';

/**
 * IOrderRepository — persistence contract for Orders.
 *
 * All implementations must live in infrastructure/repositories/.
 * Domain code must ONLY depend on this interface, never on concrete classes.
 */
class IOrderRepository {
  /**
   * Persist a new Order entity or update an existing one.
   * @param   {import('../entities/Order').Order} order
   * @returns {Promise<object>} The persisted order (with generated id, etc.)
   */
  async save(order) {
    throw new Error('IOrderRepository.save() not implemented');
  }

  /**
   * @param   {string} id
   * @returns {Promise<object|null>}
   */
  async findById(id) {
    throw new Error('IOrderRepository.findById() not implemented');
  }

  /**
   * @param   {string} userId
   * @param   {{ page?: number, limit?: number, status?: string }} options
   * @returns {Promise<{ orders: object[], pagination: object }>}
   */
  async findByUserId(userId, options) {
    throw new Error('IOrderRepository.findByUserId() not implemented');
  }

  /**
   * @param   {object} filters
   * @param   {{ page?: number, limit?: number }} options
   * @returns {Promise<{ orders: object[], pagination: object }>}
   */
  async findAll(filters, options) {
    throw new Error('IOrderRepository.findAll() not implemented');
  }

  /**
   * Generate the next sequential order number for today.
   * e.g. CD260222001
   * @returns {Promise<string>}
   */
  async generateOrderNumber() {
    throw new Error('IOrderRepository.generateOrderNumber() not implemented');
  }
}

module.exports = { IOrderRepository };
