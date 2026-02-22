'use strict';

const OrderModel = require('../../models/Order');
const Counter    = require('../../models/Counter');
const { IOrderRepository } = require('../../domain/repositories/IOrderRepository');

/**
 * OrderRepositoryMongo — Mongoose implementation of IOrderRepository.
 *
 * Responsible for mapping between the domain Order entity and the Mongoose document.
 * All MongoDB details are encapsulated here.
 */
class OrderRepositoryMongo extends IOrderRepository {
  /**
   * Persist a new Order domain entity.
   * @param {import('../../domain/entities/Order').Order} order
   * @returns {Promise<object>} Mongoose document (populated)
   */
  async save(order) {
    const doc = await OrderModel.create({
      orderNumber:     order.orderNumber,
      user:            order.userId,
      items:           order.items.map((item) => ({
        product:  item.productId  ?? undefined,
        pack:     item.packId     ?? undefined,
        quantity: item.quantity,
        price:    item.price,
        name:     item.name,
        total:    item.total,
      })),
      subtotal:        order.subtotal,
      deliveryFee:     order.deliveryFee,
      total:           order.total,
      status:          order.status,
      paymentMethod:   order.paymentMethod,
      deliveryAddress: order.deliveryAddress,
      contactInfo:     order.contactInfo,
      notes:           order.notes,
      tracking:        order.tracking,
    });

    // Return populated doc so the HTTP layer can serialize it directly
    return doc.populate([
      { path: 'items.product', select: 'name price images' },
      { path: 'items.pack',    select: 'name price' },
      { path: 'user',          select: 'name email phone' },
    ]);
  }

  /**
   * @param {string} id
   * @returns {Promise<object|null>}
   */
  async findById(id) {
    return OrderModel.findById(id)
      .populate('items.product', 'name price images')
      .populate('items.pack',    'name price')
      .populate('user',          'name email phone')
      .populate('deliveryPerson','name phone')
      .populate('tracking.updatedBy', 'name');
  }

  /**
   * @param {string} userId
   * @param {{ page?: number, limit?: number, status?: string }} options
   */
  async findByUserId(userId, { page = 1, limit = 10, status } = {}) {
    const filter = { user: userId };
    if (status) filter.status = status;

    const skip = (page - 1) * limit;

    const [docs, total] = await Promise.all([
      OrderModel.find(filter)
        .populate('items.product', 'name price images')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      OrderModel.countDocuments(filter),
    ]);

    return {
      orders: docs,
      pagination: {
        current: page,
        pages:   Math.ceil(total / limit),
        total,
        limit,
      },
    };
  }

  /**
   * @param {object} filters
   * @param {{ page?: number, limit?: number }} options
   */
  async findAll(filters = {}, { page = 1, limit = 20 } = {}) {
    const skip = (page - 1) * limit;

    const [docs, total] = await Promise.all([
      OrderModel.find(filters)
        .populate('user',          'name email phone')
        .populate('items.product', 'name price')
        .populate('deliveryPerson','name phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      OrderModel.countDocuments(filters),
    ]);

    return {
      orders: docs,
      pagination: {
        current: page,
        pages:   Math.ceil(total / limit),
        total,
        limit,
      },
    };
  }

  /**
   * Generate a sequential, collision-free order number for the current
   * calendar day using an atomic Counter document.
   *
   * Format: CD{YYYY}{MM}{DD}{NNN}  e.g. CD20260222001
   *
   * The atomic $inc on the Counter document guarantees uniqueness even
   * under concurrent load — replaces the old countDocuments()+1 approach
   * which had a race condition (Task 8).
   *
   * @returns {Promise<string>}
   */
  async generateOrderNumber() {
    const now  = new Date();
    const yyyy = now.getFullYear().toString();
    const mm   = String(now.getMonth() + 1).padStart(2, '0');
    const dd   = String(now.getDate()).padStart(2, '0');

    const counterId = `orders-${yyyy}${mm}${dd}`;

    const { seq } = await Counter.findOneAndUpdate(
      { _id: counterId },
      { $inc: { seq: 1 } },
      { upsert: true, new: true }
    );

    return `CD${yyyy}${mm}${dd}${String(seq).padStart(3, '0')}`;
  }
}

module.exports = { OrderRepositoryMongo };
