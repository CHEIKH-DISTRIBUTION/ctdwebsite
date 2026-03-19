'use strict';

/**
 * emailService — transactional email.
 *
 * Priority order:
 *   1. Resend HTTP API   (RESEND_API_KEY is set)          ← recommended for Render / cloud
 *   2. Nodemailer SMTP   (EMAIL_HOST + EMAIL_USER are set) ← local dev / self-hosted
 *   3. Console log       (no config at all)               ← CI / test environments
 *
 * Gmail SMTP times out from Render because Gmail blocks connections from
 * cloud-provider IP ranges. Use Resend in production.
 *
 * Sign up at https://resend.com (free: 3 000 emails/month).
 * Add RESEND_API_KEY to your Render environment variables.
 */

const nodemailer = require('nodemailer');

// ── Helpers ────────────────────────────────────────────────────────────────

const PAYMENT_LABELS = {
  wave:          'Wave',
  orange_money:  'Orange Money',
  cash:          'Paiement à la livraison',
  bank_transfer: 'Virement bancaire',
};

function formatXOF(amount) {
  return `${amount.toLocaleString('fr-FR')} FCFA`;
}

// ── HTML builders ──────────────────────────────────────────────────────────

function buildConfirmationHtml(order) {
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
          <td style="background:#001489;padding:24px 32px;">
            <h1 style="color:#fff;margin:0;font-size:22px;">Cheikh Distribution</h1>
            <p style="color:#8899ff;margin:4px 0 0;">Votre commande est confirmée</p>
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
                <td style="padding:8px 0;font-weight:bold;color:#001489;text-align:right;">#${order.orderNumber}</td>
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
            <h3 style="border-bottom:2px solid #001489;padding-bottom:8px;color:#333;">Articles commandés</h3>
            <table width="100%" cellpadding="0" cellspacing="0">
              <thead>
                <tr style="background:#f0f3ff;">
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
              <tr style="background:#f0f3ff;">
                <td style="padding:12px 8px;font-size:16px;font-weight:bold;color:#333;">Total</td>
                <td style="padding:12px 8px;font-size:16px;font-weight:bold;color:#001489;text-align:right;">${formatXOF(order.total)}</td>
              </tr>
            </table>

            <p style="color:#555;margin-top:24px;">
              Vous pouvez suivre l'état de votre commande depuis votre espace client.
            </p>
            <p style="color:#888;font-size:13px;">
              Des questions ? Contactez-nous à l'adresse
              <a href="mailto:support@cheikhdistribution.sn" style="color:#001489;">support@cheikhdistribution.sn</a>.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f0f3ff;padding:16px 32px;text-align:center;">
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

// ── Transport layer ────────────────────────────────────────────────────────

/**
 * Send an email using Resend HTTP API.
 * Requires RESEND_API_KEY env var. From address must use a verified domain.
 */
async function sendViaResend(to, subject, html) {
  const from = process.env.RESEND_FROM_ADDRESS ||
    `Cheikh Distribution <onboarding@resend.dev>`; // fallback for domain-unverified accounts

  const res = await fetch('https://api.resend.com/emails', {
    method:  'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify({ from, to, subject, html }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Resend API ${res.status}: ${body}`);
  }
}

/**
 * Send an email via SMTP (nodemailer). Used for local dev.
 */
async function sendViaSMTP(to, subject, html) {
  const port = parseInt(process.env.EMAIL_PORT || '587', 10);
  const transporter = nodemailer.createTransport({
    host:       process.env.EMAIL_HOST,
    port,
    secure:     port === 465,
    requireTLS: port !== 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from:    `"Cheikh Distribution" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
}

/**
 * Core dispatcher — picks the right transport based on available env vars.
 */
async function sendMail(to, subject, html) {
  if (process.env.RESEND_API_KEY) {
    return sendViaResend(to, subject, html);
  }
  if (process.env.EMAIL_HOST && process.env.EMAIL_USER) {
    return sendViaSMTP(to, subject, html);
  }
  // Dev/CI fallback — no SMTP config
  console.log(`[emailService] No transport configured — simulating email:`);
  console.log(`  To: ${to}`);
  console.log(`  Subject: ${subject}`);
}

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * Send an order-confirmation email to the customer.
 * Failures are caught and logged — they must never surface as HTTP errors.
 */
async function sendOrderConfirmation(order, userEmail) {
  const subject = `Confirmation de votre commande #${order.orderNumber} — Cheikh Distribution`;
  try {
    await sendMail(userEmail, subject, buildConfirmationHtml(order));
    console.log(`[emailService] Confirmation envoyée à ${userEmail}`);
  } catch (err) {
    console.error(`[emailService] Erreur envoi email à ${userEmail}:`, err.message);
  }
}

/**
 * Send a password-reset link to the user.
 * Re-throws on failure so the caller can surface the error.
 */
async function sendPasswordResetEmail(email, resetToken) {
  const resetUrl = `${process.env.CLIENT_URL ?? 'http://localhost:3000'}/reset-password/${resetToken}`;
  const subject  = 'Réinitialisation de votre mot de passe — Cheikh Distribution';

  const html = `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:Arial,sans-serif;margin:0;padding:0;background:#f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:16px 0;">
    <tr><td align="center" style="padding:0 12px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);">
        <tr>
          <td style="background:#001489;padding:20px 24px;">
            <h1 style="color:#fff;margin:0;font-size:20px;">Cheikh Distribution</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:24px;">
            <h2 style="color:#001489;margin-top:0;font-size:18px;">Réinitialisation de mot de passe</h2>
            <p style="color:#333;font-size:14px;line-height:1.6;">Vous recevez cet email car vous (ou quelqu'un d'autre) avez demandé à réinitialiser le mot de passe de votre compte.</p>
            <p style="color:#333;font-size:14px;line-height:1.6;">Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe. Ce lien expirera dans <strong>10 minutes</strong>.</p>
            <div style="text-align:center;margin:28px 0;">
              <a href="${resetUrl}"
                 style="display:inline-block;background:#001489;color:#fff;padding:14px 28px;border-radius:6px;text-decoration:none;font-size:15px;font-weight:bold;">
                Réinitialiser mon mot de passe
              </a>
            </div>
            <p style="color:#888;font-size:13px;">Si vous n'avez pas demandé cette réinitialisation, ignorez simplement cet email. Votre mot de passe restera inchangé.</p>
          </td>
        </tr>
        <tr>
          <td style="background:#f0f3ff;padding:16px 24px;text-align:center;">
            <p style="color:#aaa;font-size:12px;margin:0;">© ${new Date().getFullYear()} Cheikh Distribution · Dakar, Sénégal</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  try {
    await sendMail(email, subject, html);
    console.log(`[emailService] Email de réinitialisation envoyé à ${email}`);
  } catch (err) {
    console.error(`[emailService] Erreur envoi email à ${email}:`, err.message);
    throw err; // Re-throw for password reset — caller needs to know
  }
}

/**
 * Send a low-stock alert email to admin(s).
 * @param {{ name: string, stock: number, minStock: number, _id: string }[]} products
 */
async function sendLowStockAlert(products) {
  if (!products.length) return;

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@cheikhdistribution.sn';
  const subject    = `⚠️ Alerte stock bas — ${products.length} produit${products.length > 1 ? 's' : ''} — Cheikh Distribution`;

  const rows = products
    .map(
      (p) => `<tr>
        <td style="padding:8px;border-bottom:1px solid #eee;">${p.name}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;color:#dc2626;font-weight:bold;">${p.stock}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${p.minStock}</td>
      </tr>`
    )
    .join('');

  const html = `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;background:#f4f4f4;padding:24px;">
  <div style="max-width:560px;margin:auto;background:#fff;border-radius:8px;padding:32px;box-shadow:0 2px 8px rgba(0,0,0,.08);">
    <h2 style="color:#dc2626;margin-top:0;">⚠️ Alerte de stock bas</h2>
    <p>Les produits suivants ont un stock inférieur ou égal à leur seuil minimum :</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;">
      <thead>
        <tr style="background:#fef2f2;">
          <th style="padding:8px;text-align:left;color:#555;font-size:13px;">Produit</th>
          <th style="padding:8px;text-align:center;color:#555;font-size:13px;">Stock actuel</th>
          <th style="padding:8px;text-align:center;color:#555;font-size:13px;">Seuil min.</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <p>Connectez-vous au <a href="${process.env.CLIENT_URL ?? 'http://localhost:3000'}/admin/stock" style="color:#001489;font-weight:bold;">tableau de bord</a> pour gérer le réapprovisionnement.</p>
    <p style="color:#aaa;font-size:12px;border-top:1px solid #eee;padding-top:16px;margin-bottom:0;">
      © ${new Date().getFullYear()} Cheikh Distribution · Dakar, Sénégal
    </p>
  </div>
</body>
</html>`;

  try {
    await sendMail(adminEmail, subject, html);
    console.log(`[emailService] Alerte stock bas envoyée à ${adminEmail}`);
  } catch (err) {
    console.error(`[emailService] Erreur envoi alerte stock:`, err.message);
  }
}

/**
 * Send an email-verification link to a newly registered user.
 * @param {string} email
 * @param {string} verificationToken — plain token (will be part of the URL)
 */
async function sendEmailVerification(email, verificationToken) {
  const verifyUrl = `${process.env.BACKEND_URL ?? 'http://localhost:5000'}/api/auth/verify-email/${verificationToken}`;
  const subject   = 'Confirmez votre adresse email — Cheikh Distribution';

  const html = `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:Arial,sans-serif;margin:0;padding:0;background:#f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:16px 0;">
    <tr><td align="center" style="padding:0 12px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);">
        <tr>
          <td style="background:#001489;padding:20px 24px;">
            <h1 style="color:#fff;margin:0;font-size:20px;">Cheikh Distribution</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:24px;">
            <h2 style="color:#001489;margin-top:0;font-size:18px;">Bienvenue !</h2>
            <p style="color:#333;font-size:14px;line-height:1.6;">Merci de vous être inscrit. Pour activer votre compte, veuillez confirmer votre adresse email en cliquant sur le bouton ci-dessous.</p>
            <div style="text-align:center;margin:28px 0;">
              <a href="${verifyUrl}"
                 style="display:inline-block;background:#001489;color:#fff;padding:14px 28px;border-radius:6px;text-decoration:none;font-size:15px;font-weight:bold;">
                Confirmer mon email
              </a>
            </div>
            <p style="color:#888;font-size:13px;">Si vous n'avez pas créé de compte, ignorez cet email.</p>
          </td>
        </tr>
        <tr>
          <td style="background:#f0f3ff;padding:16px 24px;text-align:center;">
            <p style="color:#aaa;font-size:12px;margin:0;">© ${new Date().getFullYear()} Cheikh Distribution · Dakar, Sénégal</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  try {
    await sendMail(email, subject, html);
    console.log(`[emailService] Email de vérification envoyé à ${email}`);
  } catch (err) {
    console.error(`[emailService] Erreur envoi vérification à ${email}:`, err.message);
  }
}

module.exports = { sendOrderConfirmation, sendPasswordResetEmail, sendLowStockAlert, sendEmailVerification };
