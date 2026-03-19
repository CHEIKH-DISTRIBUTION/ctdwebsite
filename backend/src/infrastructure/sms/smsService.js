'use strict';

/**
 * smsService — transactional SMS notifications.
 *
 * Priority order:
 *   1. Orange SMS API   (ORANGE_SMS_CLIENT_ID + ORANGE_SMS_CLIENT_SECRET set) ← Sénégal natif
 *   2. Twilio           (TWILIO_ACCOUNT_SID + TWILIO_AUTH_TOKEN set)
 *   3. Console log      (no config at all)                                    ← CI / dev
 *
 * In production, configure one of the above providers in your environment.
 */

const ORDER_STATUS_FR = {
  pending:    'en attente',
  confirmed:  'confirmée',
  preparing:  'en préparation',
  ready:      'prête pour livraison',
  delivering: 'en cours de livraison',
  delivered:  'livrée',
  cancelled:  'annulée',
  refunded:   'remboursée',
};

// ── Transport layer ────────────────────────────────────────────────────────

/**
 * Send SMS via Orange SMS API (Sénégal).
 * Requires ORANGE_SMS_CLIENT_ID, ORANGE_SMS_CLIENT_SECRET, ORANGE_SMS_SENDER_ADDRESS.
 */
async function sendViaOrangeSMS(to, message) {
  const authUrl  = 'https://api.orange.com/oauth/v3/token';
  const smsUrl   = 'https://api.orange.com/smsmessaging/v1/outbound';
  const clientId = process.env.ORANGE_SMS_CLIENT_ID;
  const secret   = process.env.ORANGE_SMS_CLIENT_SECRET;
  const sender   = process.env.ORANGE_SMS_SENDER_ADDRESS || 'tel:+221000000';

  // 1. OAuth2 token
  const authRes = await fetch(authUrl, {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(`${clientId}:${secret}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  if (!authRes.ok) throw new Error(`Orange SMS auth failed: ${authRes.status}`);
  const { access_token } = await authRes.json();

  // 2. Send SMS
  const encodedSender = encodeURIComponent(sender);
  const res = await fetch(`${smsUrl}/${encodedSender}/requests`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      outboundSMSMessageRequest: {
        address: `tel:${to}`,
        senderAddress: sender,
        outboundSMSTextMessage: { message },
      },
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Orange SMS API ${res.status}: ${body}`);
  }
}

/**
 * Send SMS via Twilio.
 * Requires TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER.
 */
async function sendViaTwilio(to, message) {
  const sid   = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from  = process.env.TWILIO_FROM_NUMBER;

  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
    {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${sid}:${token}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ To: to, From: from, Body: message }).toString(),
    }
  );
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Twilio API ${res.status}: ${body}`);
  }
}

/**
 * Core dispatcher — picks the right transport.
 */
async function sendSMS(to, message) {
  // Normalize phone: ensure +221 prefix
  const phone = to.startsWith('+') ? to : `+221${to.replace(/^0/, '')}`;

  if (process.env.ORANGE_SMS_CLIENT_ID && process.env.ORANGE_SMS_CLIENT_SECRET) {
    return sendViaOrangeSMS(phone, message);
  }
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    return sendViaTwilio(phone, message);
  }
  // Dev/CI fallback
  console.log(`[smsService] No SMS transport configured — simulating:`);
  console.log(`  To: ${phone}`);
  console.log(`  Message: ${message}`);
}

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * Notify customer of order status change (if they have SMS notifications enabled).
 * Failures are caught and logged — never surfaces as HTTP error.
 *
 * @param {object}  user   - { phone, preferences: { smsNotifications } }
 * @param {object}  order  - { orderNumber, status }
 */
async function sendOrderStatusSMS(user, order) {
  if (!user?.preferences?.smsNotifications) return;
  if (!user.phone) return;

  const statusFr = ORDER_STATUS_FR[order.status] || order.status;
  const message = `Cheikh Distribution — Votre commande #${order.orderNumber} est ${statusFr}. Merci pour votre confiance !`;

  try {
    await sendSMS(user.phone, message);
    console.log(`[smsService] SMS envoyé à ${user.phone} — commande #${order.orderNumber}`);
  } catch (err) {
    console.error(`[smsService] Erreur envoi SMS à ${user.phone}:`, err.message);
  }
}

/**
 * Send order confirmation SMS.
 */
async function sendOrderConfirmationSMS(user, order) {
  if (!user?.preferences?.smsNotifications) return;
  if (!user.phone) return;

  const message = `Cheikh Distribution — Commande #${order.orderNumber} confirmée ! Total: ${order.total?.toLocaleString('fr-FR')} FCFA. Merci !`;

  try {
    await sendSMS(user.phone, message);
    console.log(`[smsService] SMS confirmation envoyé à ${user.phone}`);
  } catch (err) {
    console.error(`[smsService] Erreur envoi SMS à ${user.phone}:`, err.message);
  }
}

module.exports = { sendSMS, sendOrderStatusSMS, sendOrderConfirmationSMS };
