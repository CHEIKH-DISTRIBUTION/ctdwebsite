const crypto = require('crypto');
const Payment = require('../models/Payment');
const Order = require('../models/Order');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const {
  initiateWavePayment,
  initiateOrangeMoneyPayment,
  processCardPayment,
  verifyWavePayment,
  verifyOrangeMoneyPayment,
  handleWaveWebhook,
  handleOrangeMoneyWebhook,
  processWaveRefund,
  processOrangeMoneyRefund,
  processCardRefund,
} = require('../services/paymentService');

/**
 * Verify a webhook HMAC-SHA256 signature using constant-time comparison.
 * Returns true if the signature is valid, false otherwise.
 *
 * @param {string} rawBody  - Raw request body string (req.rawBody)
 * @param {string} secret   - Shared secret from env (WAVE_API_SECRET, etc.)
 * @param {string} received - Signature value from the request header
 */
function verifyHmacSignature(rawBody, secret, received) {
  if (!rawBody || !secret || !received) return false;
  const expected = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');
  // timingSafeEqual prevents timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected, 'hex'),
      Buffer.from(received.replace(/^sha256=/, ''), 'hex')
    );
  } catch {
    return false;
  }
}

// @desc    Initier un paiement
// @route   POST /api/payments
// @access  Private
exports.initiatePayment = asyncHandler(async (req, res, next) => {
  const { orderId, paymentMethod, paymentDetails } = req.body;

  // Vérifier la commande
  const order = await Order.findById(orderId);
  if (!order) {
    return next(new ErrorResponse('Commande non trouvée', 404));
  }

  // Vérifier que la commande appartient à l'utilisateur
  if (order.user.toString() !== req.user.id) {
    return next(new ErrorResponse('Non autorisé', 401));
  }

  // Vérifier que la commande n'est pas déjà payée
  if (order.paymentStatus === 'completed') {
    return next(new ErrorResponse('Cette commande est déjà payée', 400));
  }

  let paymentResult;
  let payment;

  try {
    // Créer un enregistrement de paiement
    payment = await Payment.create({
      order: orderId,
      user: req.user.id,
      amount: order.total,
      method: paymentMethod,
      paymentDetails
    });

    // Traiter selon la méthode de paiement
    switch (paymentMethod) {
      case 'wave':
        paymentResult = await initiateWavePayment({
          amount: order.total,
          phone: paymentDetails.phone,
          orderId: order._id,
          paymentId: payment._id
        });
        break;
      
      case 'orange_money':
        paymentResult = await initiateOrangeMoneyPayment({
          amount: order.total,
          phone: paymentDetails.phone,
          orderId: order._id,
          paymentId: payment._id
        });
        break;
      
      case 'credit_card':
        paymentResult = await processCardPayment({
          amount: order.total,
          cardDetails: paymentDetails.card,
          orderId: order._id,
          paymentId: payment._id,
          email: req.user.email
        });
        break;
      
      case 'cash_on_delivery':
        paymentResult = { status: 'pending' };
        break;
      
      default:
        return next(new ErrorResponse('Méthode de paiement non supportée', 400));
    }

    // Mettre à jour le paiement avec la réponse
    payment.status = paymentResult.status || 'processing';
    payment.transactionId = paymentResult.transactionId;
    payment.paymentDetails.gatewayResponse = paymentResult;

    if (paymentResult.error) {
      payment.errorMessage = paymentResult.error;
    }

    await payment.save();

    // Mettre à jour le statut de la commande
    order.paymentStatus = payment.status;
    await order.save();

    res.status(200).json({
      success: true,
      data: {
        payment,
        nextAction: paymentResult.nextAction // URL de redirection pour les paiements mobiles
      }
    });

  } catch (err) {
    console.error('Erreur paiement:', err);
    
    if (payment) {
      payment.status = 'failed';
      payment.errorMessage = err.message;
      await payment.save();
    }

    return next(new ErrorResponse(`Échec du paiement: ${err.message}`, 500));
  }
});

// @desc    Vérifier le statut d'un paiement
// @route   GET /api/payments/:id/status
// @access  Private
exports.checkPaymentStatus = asyncHandler(async (req, res, next) => {
  const payment = await Payment.findById(req.params.id);

  if (!payment) {
    return next(new ErrorResponse('Paiement non trouvé', 404));
  }

  // Vérifier que l'utilisateur a le droit de voir ce paiement
  if (payment.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Non autorisé', 401));
  }

  // Si le paiement est déjà complété, retourner le statut
  if (payment.status === 'completed') {
    return res.status(200).json({
      success: true,
      data: payment
    });
  }

  // Pour les paiements mobiles, vérifier auprès du provider
  let updatedPayment;
  try {
    if (payment.method === 'wave') {
      updatedPayment = await verifyWavePayment(payment.transactionId);
    } else if (payment.method === 'orange_money') {
      updatedPayment = await verifyOrangeMoneyPayment(payment.transactionId);
    }

    // Mettre à jour le statut si nécessaire
    if (updatedPayment && updatedPayment.status !== payment.status) {
      payment.status = updatedPayment.status;
      payment.processedAt = updatedPayment.processedAt;
      await payment.save();

      // Mettre à jour la commande si le paiement est complété
      if (payment.status === 'completed') {
        await Order.findByIdAndUpdate(payment.order, {
          paymentStatus: 'completed',
          status: 'confirmed'
        });
      }
    }
  } catch (err) {
    console.error('Erreur vérification statut:', err);
  }

  res.status(200).json({
    success: true,
    data: payment
  });
});

// @desc    Webhook pour les notifications de paiement
// @route   POST /api/payments/webhook/:provider
// @access  Public — signature MUST be verified before trusting payload
exports.paymentWebhook = asyncHandler(async (req, res, next) => {
  const provider = req.params.provider;
  const payload  = req.body;
  const rawBody  = req.rawBody; // set by express.json() verify callback in server.js

  // ── Signature verification (Task 7) ──────────────────────────────────────
  // Reject the request immediately if the HMAC signature is invalid.
  // This prevents replay attacks and spoofed webhook calls.
  if (provider === 'wave') {
    const signature = req.headers['x-wave-signature'];
    const secret    = process.env.WAVE_API_SECRET;

    if (!verifyHmacSignature(rawBody, secret, signature)) {
      console.warn('[webhook] Invalid Wave signature — request rejected');
      return res.status(401).json({ success: false, message: 'Invalid signature' });
    }
  }

  if (provider === 'orange_money') {
    const signature = req.headers['x-orange-signature'];
    const secret    = process.env.ORANGE_MONEY_API_SECRET;

    if (!verifyHmacSignature(rawBody, secret, signature)) {
      console.warn('[webhook] Invalid Orange Money signature — request rejected');
      return res.status(401).json({ success: false, message: 'Invalid signature' });
    }
  }
  // ─────────────────────────────────────────────────────────────────────────

  try {
    let payment;

    switch (provider) {
      case 'wave':
        payment = await handleWaveWebhook(payload);
        break;

      case 'orange_money':
        payment = await handleOrangeMoneyWebhook(payload);
        break;

      default:
        return res.status(400).json({ success: false });
    }

    if (payment) {
      await Order.findByIdAndUpdate(payment.order, {
        paymentStatus: payment.status,
        status: payment.status === 'completed' ? 'confirmed' : 'pending'
      });
      return res.status(200).json({ success: true });
    }

  } catch (err) {
    console.error(`Erreur webhook ${provider}:`, err);
  }

  res.status(400).json({ success: false });
});

// @desc    Remboursement
// @route   POST /api/payments/:id/refund
// @access  Private/Admin
exports.processRefund = asyncHandler(async (req, res, next) => {
  const payment = await Payment.findById(req.params.id);

  if (!payment) {
    return next(new ErrorResponse('Paiement non trouvé', 404));
  }

  if (payment.status !== 'completed') {
    return next(new ErrorResponse('Seuls les paiements complétés peuvent être remboursés', 400));
  }

  try {
    let refundResult;
    
    switch (payment.method) {
      case 'wave':
        refundResult = await processWaveRefund(payment.transactionId);
        break;
      
      case 'orange_money':
        refundResult = await processOrangeMoneyRefund(payment.transactionId);
        break;
      
      case 'credit_card':
        refundResult = await processCardRefund(payment.transactionId);
        break;
      
      default:
        return next(new ErrorResponse('Remboursement non supporté pour cette méthode', 400));
    }

    // Mettre à jour le paiement
    payment.status = 'refunded';
    payment.refundedAt = Date.now();
    await payment.save();

    // Mettre à jour la commande
    await Order.findByIdAndUpdate(payment.order, {
      paymentStatus: 'refunded',
      status: 'refunded'
    });

    res.status(200).json({
      success: true,
      data: refundResult
    });

  } catch (err) {
    console.error('Erreur remboursement:', err);
    return next(new ErrorResponse(`Échec du remboursement: ${err.message}`, 500));
  }
});