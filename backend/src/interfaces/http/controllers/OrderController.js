'use strict';

const { CreateOrderUseCase } = require('../../../application/usecases/order/CreateOrder.usecase');
const { OrderRepositoryMongo }   = require('../../../infrastructure/repositories/OrderRepositoryMongo');
const { ProductRepositoryMongo } = require('../../../infrastructure/repositories/ProductRepositoryMongo');
const { PackRepositoryMongo }    = require('../../../infrastructure/repositories/PackRepositoryMongo');
const { DomainError }            = require('../../../domain/errors/DomainError');
const User                       = require('../../../models/User');

// Singleton repositories (stateless — safe to share across requests)
const orderRepository   = new OrderRepositoryMongo();
const productRepository = new ProductRepositoryMongo();
const packRepository    = new PackRepositoryMongo();

/**
 * OrderController — thin HTTP adapter.
 *
 * Responsibilities:
 *   ✅ Extract validated data from req
 *   ✅ Instantiate and call the appropriate UseCase
 *   ✅ Map UseCase result / errors to HTTP responses
 *
 * ❌ No business logic here
 * ❌ No direct DB calls
 */
class OrderController {
  /**
   * POST /api/v2/orders
   */
  static async createOrder(req, res) {
    try {
      // Block unverified users from ordering
      const currentUser = await User.findById(req.user.id).select('isEmailVerified');
      if (currentUser && !currentUser.isEmailVerified) {
        return res.status(403).json({
          success: false,
          message: 'Veuillez vérifier votre adresse email avant de passer une commande.',
        });
      }

      const { products, packs, paymentMethod, deliveryAddress, contactInfo, notes, couponCode } = req.body;

      const useCase = new CreateOrderUseCase({
        orderRepository,
        productRepository,
        packRepository,
      });

      const order = await useCase.execute({
        userId: req.user.id,
        products,
        packs,
        paymentMethod,
        deliveryAddress,
        contactInfo,
        notes,
        couponCode,
      });

      return res.status(201).json({
        success: true,
        message: 'Commande créée avec succès',
        data:    { order },
      });
    } catch (error) {
      if (error instanceof DomainError) {
        return res.status(400).json({
          success: false,
          message: error.message,
          code:    error.code,
        });
      }

      console.error('Erreur création commande:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la création de la commande',
      });
    }
  }

  /**
   * GET /api/v2/orders/my-orders
   */
  static async getMyOrders(req, res) {
    try {
      const { page = 1, limit = 10, status } = req.query;

      const result = await orderRepository.findByUserId(req.user.id, {
        page:   parseInt(page),
        limit:  parseInt(limit),
        status,
      });

      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      console.error('Erreur récupération commandes:', error);
      return res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  }

  /**
   * GET /api/v2/orders/:id
   */
  static async getOrder(req, res) {
    try {
      const order = await orderRepository.findById(req.params.id);

      if (!order) {
        return res.status(404).json({ success: false, message: 'Commande non trouvée' });
      }

      // Authorization check (delegates to domain knowledge stored in Order entity)
      if (req.user.role === 'customer' && order.user._id.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Accès non autorisé à cette commande' });
      }

      return res.status(200).json({ success: true, data: { order } });
    } catch (error) {
      console.error('Erreur récupération commande:', error);
      return res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  }

  /**
   * GET /api/v2/orders/admin/all
   */
  static async getAllOrders(req, res) {
    try {
      const { page = 1, limit = 20, status, startDate, endDate } = req.query;

      const filters = {};
      if (status) filters.status = status;
      if (startDate || endDate) {
        filters.createdAt = {};
        if (startDate) filters.createdAt.$gte = new Date(startDate);
        if (endDate)   filters.createdAt.$lte = new Date(endDate);
      }

      const result = await orderRepository.findAll(filters, {
        page:  parseInt(page),
        limit: parseInt(limit),
      });

      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      console.error('Erreur récupération toutes commandes:', error);
      return res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  }
}

module.exports = { OrderController };
