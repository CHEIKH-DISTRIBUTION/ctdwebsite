'use strict';

const nodemailer = require('nodemailer');

/**
 * emailService — transactional email via SMTP (Nodemailer).
 *
 * Environment variables required (set in backend/.env):
 *   EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS
 *
 * In development with no SMTP config, emails are logged to the console
 * rather than throwing so the order-creation flow never fails due to email.
 */

function createTransporter() {
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER) {
    return null; // SMTP not configured
  }

  return nodemailer.createTransport({
    host:   process.env.EMAIL_HOST,
    port:   parseInt(process.env.EMAIL_PORT || '587', 10),
    secure: process.env.EMAIL_PORT === '465',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

const PAYMENT_LABELS = {
  wave:          'Wave',
  orange_money:  'Orange Money',
  cash:          'Paiement à la livraison',
  bank_transfer: 'Virement bancaire',
};

/**
 * Format a number as XOF currency string.
 * @param {number} amount
 */
function formatXOF(amount) {
  return `${amount.toLocaleString('fr-FR')} FCFA`;
}

/**
 * Build the HTML body for the order confirmation email.
 * @param {object} order  — Populated Mongoose document (or plain object with same shape)
 * @param {string} email  — Customer email address
 */
function buildConfirmationHtml(order, email) {
  const itemRows = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #eee;">${item.name}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${formatXOF(item.price)}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${formatXOF(item.total)}</td>
      </tr>`
    )
    .join('');

  const deliveryFeeText =
    order.deliveryFee === 0 ? 'Gratuite' : formatXOF(order.deliveryFee);

  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:Arial,sans-serif;margin:0;padding:0;background:#f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:24px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);">

        <!-- Header -->
        <tr>
          <td style="background:#284bcc;padding:24px 32px;">
            <h1 style="color:#fff;margin:0;font-size:22px;">Cheikh Distribution</h1>
            <p style="color:#a9bbff;margin:4px 0 0;">Votre commande est confirmée</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px;">
            <p style="font-size:16px;color:#333;">Bonjour,</p>
            <p style="color:#555;">Merci pour votre commande ! Voici le récapitulatif.</p>

            <!-- Order info -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              <tr>
                <td style="padding:8px 0;color:#555;">Numéro de commande</td>
                <td style="padding:8px 0;font-weight:bold;color:#284bcc;text-align:right;">#${order.orderNumber}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#555;">Mode de paiement</td>
                <td style="padding:8px 0;text-align:right;">${PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#555;">Adresse de livraison</td>
                <td style="padding:8px 0;text-align:right;">${order.deliveryAddress.street}, ${order.deliveryAddress.city}</td>
              </tr>
            </table>

            <!-- Items -->
            <h3 style="border-bottom:2px solid #284bcc;padding-bottom:8px;color:#333;">Articles commandés</h3>
            <table width="100%" cellpadding="0" cellspacing="0">
              <thead>
                <tr style="background:#f8f9ff;">
                  <th style="padding:8px;text-align:left;color:#555;font-size:13px;">Article</th>
                  <th style="padding:8px;text-align:center;color:#555;font-size:13px;">Qté</th>
                  <th style="padding:8px;text-align:right;color:#555;font-size:13px;">Prix unit.</th>
                  <th style="padding:8px;text-align:right;color:#555;font-size:13px;">Total</th>
                </tr>
              </thead>
              <tbody>${itemRows}</tbody>
            </table>

            <!-- Totals -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
              <tr>
                <td style="padding:8px;color:#555;">Sous-total</td>
                <td style="padding:8px;text-align:right;">${formatXOF(order.subtotal)}</td>
              </tr>
              <tr>
                <td style="padding:8px;color:#555;">Livraison</td>
                <td style="padding:8px;text-align:right;${order.deliveryFee === 0 ? 'color:#16a34a;font-weight:bold;' : ''}">${deliveryFeeText}</td>
              </tr>
              <tr style="background:#f8f9ff;">
                <td style="padding:12px 8px;font-size:16px;font-weight:bold;color:#333;">Total</td>
                <td style="padding:12px 8px;font-size:16px;font-weight:bold;color:#284bcc;text-align:right;">${formatXOF(order.total)}</td>
              </tr>
            </table>

            <p style="color:#555;margin-top:24px;">
              Vous pouvez suivre l'état de votre commande depuis votre espace client.
            </p>
            <p style="color:#888;font-size:13px;">
              Des questions ? Contactez-nous à l'adresse
              <a href="mailto:support@cheikhdistribution.sn" style="color:#284bcc;">support@cheikhdistribution.sn</a>.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f8f9ff;padding:16px 32px;text-align:center;">
            <p style="color:#aaa;font-size:12px;margin:0;">
              © ${new Date().getFullYear()} Cheikh Distribution · Dakar, Sénégal
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/**
 * Send an order-confirmation email to the customer.
 *
 * Failures are caught and logged — they must never surface as HTTP errors
 * because the order has already been persisted successfully at this point.
 *
 * @param {object} order      — Populated order document (Mongoose or plain)
 * @param {string} userEmail  — Customer email address
 */
async function sendOrderConfirmation(order, userEmail) {
  const transporter = createTransporter();

  const subject = `Confirmation de votre commande #${order.orderNumber} — Cheikh Distribution`;

  if (!transporter) {
    // Dev fallback: log to console when SMTP is not configured
    console.log(`[emailService] SMTP non configuré — e-mail simulé :`);
    console.log(`  To: ${userEmail}`);
    console.log(`  Subject: ${subject}`);
    console.log(`  Commande: #${order.orderNumber}  Total: ${formatXOF(order.total)}`);
    return;
  }

  try {
    await transporter.sendMail({
      from:    `"Cheikh Distribution" <${process.env.EMAIL_USER}>`,
      to:      userEmail,
      subject,
      html:    buildConfirmationHtml(order, userEmail),
    });
    console.log(`[emailService] Confirmation envoyée à ${userEmail}`);
  } catch (err) {
    // Log but do not re-throw — email failure must not break order creation
    console.error(`[emailService] Erreur envoi email à ${userEmail}:`, err.message);
  }
}

/**
 * Send a password-reset link to the user.
 *
 * @param {string} email      — Recipient email address
 * @param {string} resetToken — Plain (un-hashed) reset token
 */
async function sendPasswordResetEmail(email, resetToken) {
  const resetUrl = `${process.env.CLIENT_URL ?? 'http://localhost:3000'}/reset-password/${resetToken}`;

  const subject = 'Réinitialisation de votre mot de passe — Cheikh Distribution';
  const html = `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;background:#f4f4f4;padding:24px;">
  <div style="max-width:520px;margin:auto;background:#fff;border-radius:8px;padding:32px;box-shadow:0 2px 8px rgba(0,0,0,.08);">
    <h2 style="color:#284bcc;margin-top:0;">Réinitialisation de mot de passe</h2>
    <p>Vous recevez cet email car vous (ou quelqu'un d'autre) avez demandé à réinitialiser le mot de passe de votre compte.</p>
    <p>Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe. Ce lien expirera dans <strong>10 minutes</strong>.</p>
    <div style="text-align:center;margin:32px 0;">
      <a href="${resetUrl}"
         style="background:#284bcc;color:#fff;padding:14px 28px;border-radius:6px;text-decoration:none;font-size:15px;font-weight:bold;">
        Réinitialiser mon mot de passe
      </a>
    </div>
    <p style="color:#888;font-size:13px;">Si vous n'avez pas demandé cette réinitialisation, ignorez simplement cet email. Votre mot de passe restera inchangé.</p>
    <p style="color:#aaa;font-size:12px;border-top:1px solid #eee;padding-top:16px;margin-bottom:0;">
      © ${new Date().getFullYear()} Cheikh Distribution · Dakar, Sénégal
    </p>
  </div>
</body>
</html>`;

  const transporter = createTransporter();

  if (!transporter) {
    console.log(`[emailService] SMTP non configuré — e-mail simulé :`);
    console.log(`  To: ${email}`);
    console.log(`  Subject: ${subject}`);
    console.log(`  Reset URL: ${resetUrl}`);
    return;
  }

  try {
    await transporter.sendMail({
      from:    `"Cheikh Distribution" <${process.env.EMAIL_USER}>`,
      to:      email,
      subject,
      html,
    });
    console.log(`[emailService] Email de réinitialisation envoyé à ${email}`);
  } catch (err) {
    console.error(`[emailService] Erreur envoi email à ${email}:`, err.message);
    throw err; // Re-throw for password reset — caller needs to know if email failed
  }
}

module.exports = { sendOrderConfirmation, sendPasswordResetEmail };
