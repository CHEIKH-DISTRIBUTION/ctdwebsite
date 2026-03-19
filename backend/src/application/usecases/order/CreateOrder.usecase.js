'use strict';

const { Order }     = require('../../../domain/entities/Order');
const { OrderItem } = require('../../../domain/entities/OrderItem');
const {
  EmptyOrderError,
  InsufficientStockError,
  ProductNotFoundError,
} = require('../../../domain/errors/DomainError');

/**
 * CreateOrder — MVP use case.
 *
 * Orchestrates the full order-creation workflow:
 *   1. Validate input
 *   2. Resolve products / packs and check stock
 *   3. Reserve stock
 *   4. Build Order domain entity
 *   5. Persist and return
 *   6. Send confirmation email (fire-and-forget, never blocks)
 *
 * This class has NO knowledge of Express, HTTP or MongoDB.
 * All I/O goes through injected repository interfaces.
 */
class CreateOrderUseCase {
  /**
   * @param {object} deps
   * @param {import('../../../domain/repositories/IOrderRepository').IOrderRepository}   deps.orderRepository
   * @param {import('../../../domain/repositories/IProductRepository').IProductRepository} deps.productRepository
   * @param {import('../../../domain/repositories/IPackRepository').IPackRepository}     deps.packRepository
   * @param {{ sendOrderConfirmation: Function }} [deps.emailService]  — optional, injected for testability
   */
  constructor({ orderRepository, productRepository, packRepository, emailService }) {
    this.orderRepository   = orderRepository;
    this.productRepository = productRepository;
    this.packRepository    = packRepository;
    this.emailService      = emailService ?? require('../../../infrastructure/email/emailService');
  }

  /**
   * @param {object} cmd
   * @param {string}   cmd.userId
   * @param {{ product: string, quantity: number }[]} [cmd.products]
   * @param {{ pack: string, quantity: number }[]}    [cmd.packs]
   * @param {string}   cmd.paymentMethod
   * @param {object}   cmd.deliveryAddress
   * @param {object}   cmd.contactInfo
   * @param {object}   [cmd.notes]
   * @returns {Promise<object>} The persisted order document
   */
  async execute({
    userId,
    products = [],
    packs    = [],
    paymentMethod,
    deliveryAddress,
    contactInfo,
    notes = {},
    couponCode = null,
  }) {
    // ── 1. Guard: order must not be empty ───────────────────────────────────
    if (products.length === 0 && packs.length === 0) {
      throw new EmptyOrderError();
    }

    const orderItems      = [];
    const stockReservations = []; // { productId, quantity }

    // ── 2a. Resolve individual products ────────────────────────────────────
    for (const item of products) {
      const product = await this.productRepository.findById(item.product);

      if (!product) {
        throw new ProductNotFoundError(item.product);
      }

      if (product.stock < item.quantity) {
        throw new InsufficientStockError(product.name, product.stock, item.quantity);
      }

      orderItems.push(
        new OrderItem({
          productId: product._id.toString(),
          quantity:  item.quantity,
          price:     product.price,
          name:      product.name,
        })
      );

      stockReservations.push({ productId: product._id.toString(), quantity: item.quantity });
    }

    // ── 2b. Resolve packs (each pack bundles multiple products) ─────────────
    for (const packItem of packs) {
      const pack = await this.packRepository.findById(packItem.pack);

      if (!pack) {
        throw new Error(`Pack ${packItem.pack} non trouvé`);
      }

      // Check stock for every product inside the pack
      for (const packProduct of pack.items) {
        const required = packProduct.quantity * packItem.quantity;

        if (!packProduct.product || packProduct.product.stock < required) {
          const productName  = packProduct.product?.name  ?? 'produit inconnu';
          const available    = packProduct.product?.stock ?? 0;
          throw new InsufficientStockError(productName, available, required);
        }

        stockReservations.push({
          productId: packProduct.product._id.toString(),
          quantity:  required,
        });
      }

      orderItems.push(
        new OrderItem({
          packId:   pack._id.toString(),
          quantity: packItem.quantity,
          price:    pack.price,
          name:     pack.name,
        })
      );
    }

    // ── 3. Reserve stock (all checks passed — commit atomically) ────────────
    await this.productRepository.reserveStock(stockReservations);

    // ── 3b. Validate coupon (if provided) ────────────────────────────────────
    let discount = 0;
    let appliedCouponCode = null;

    if (couponCode) {
      const Coupon = require('../../../models/Coupon');
      const subtotal = orderItems.reduce((sum, item) => sum + item.total, 0);
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });

      if (coupon) {
        const now = new Date();
        const isValid =
          now >= coupon.startDate &&
          now <= coupon.endDate &&
          (coupon.maxUses === null || coupon.usedCount < coupon.maxUses) &&
          subtotal >= coupon.minOrderAmount;

        if (isValid) {
          const CouponOrder = require('../../../models/Order');
          const userUses = await CouponOrder.countDocuments({
            user: userId,
            couponCode: coupon.code,
            status: { $nin: ['cancelled'] },
          });

          if (!coupon.maxUsesPerUser || userUses < coupon.maxUsesPerUser) {
            if (coupon.discountType === 'percentage') {
              discount = Math.round(subtotal * coupon.discountValue / 100);
              if (coupon.maxDiscount && discount > coupon.maxDiscount) {
                discount = coupon.maxDiscount;
              }
            } else {
              discount = coupon.discountValue;
            }
            if (discount > subtotal) discount = subtotal;
            appliedCouponCode = coupon.code;
            await Coupon.findByIdAndUpdate(coupon._id, { $inc: { usedCount: 1 } });
          }
        }
      }
    }

    // ── 4. Build domain entity ───────────────────────────────────────────────
    const orderNumber = await this.orderRepository.generateOrderNumber();

    const order = new Order({
      orderNumber,
      userId,
      items: orderItems,
      paymentMethod,
      deliveryAddress,
      contactInfo,
      notes,
      couponCode: appliedCouponCode,
      discount,
    });

    order.addTrackingEntry(
      'pending',
      'Commande créée et en attente de confirmation',
      userId
    );

    // ── 5. Persist ───────────────────────────────────────────────────────────
    const savedOrder = await this.orderRepository.save(order);

    // ── 6. Send confirmation email (fire-and-forget) ─────────────────────────
    // The user object may be a populated Mongoose doc or a plain string ID.
    // We extract the email safely so a missing address never throws.
    const userEmail =
      typeof savedOrder.user === 'object'
        ? savedOrder.user?.email
        : null;

    if (userEmail) {
      // Do not await — email failure must not roll back the order
      this.emailService.sendOrderConfirmation(savedOrder, userEmail).catch(() => {});
    }

    return savedOrder;
  }
}

module.exports = { CreateOrderUseCase };
