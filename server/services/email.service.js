require('dotenv').config({ override: true });
const { BrevoClient } = require('@getbrevo/brevo');

/**
 * Configure and get Brevo API Client instance
 */
const getBrevoClient = () => {
  const apiKey = (process.env.BREVO_API_KEY || process.env.EMAIL_API_KEY || '').trim().replace(/^['"]|['"]$/g, '');
  if (!apiKey || apiKey === 'your_brevo_api_key') {
    throw new Error('Email service is not configured (BREVO_API_KEY / EMAIL_API_KEY missing)');
  }

  return new BrevoClient({ apiKey });
};

/**
 * Get validated sender object matching verified Brevo sender
 */
const getSender = () => {
  let fromEmail = (process.env.EMAIL_FROM || process.env.FROM_EMAIL || '').trim().replace(/^['"]|['"]$/g, '');
  if (!fromEmail || fromEmail === 'your_verified_sender@example.com') {
    // Verified transactional sender for KrishiShetra Brevo account
    fromEmail = 'surajmahto.work@gmail.com';
  }
  const fromName = (process.env.EMAIL_FROM_NAME || process.env.FROM_NAME || 'KrishiShetra').trim().replace(/^['"]|['"]$/g, '');
  return { name: fromName, email: fromEmail };
};

/**
 * Format Brevo API error into a clean, safe message without exposing secrets
 */
const formatBrevoError = (err) => {
  if (!err) return 'Unable to send verification email. Please try again.';

  const rawMsg = err.message || '';
  const rawBody = err.body ? (typeof err.body === 'string' ? err.body : JSON.stringify(err.body)) : '';
  const combined = `${rawMsg} ${rawBody}`.toLowerCase();

  if (combined.includes('not configured') || combined.includes('missing')) {
    return 'Email service is not configured. Please check server environment settings.';
  }
  if (combined.includes('key not found') || combined.includes('unauthorized') || combined.includes('invalid api key')) {
    return 'Invalid email provider API key configured.';
  }
  if (combined.includes('sender') || combined.includes('unverified') || combined.includes('not verified')) {
    return 'Sender email is not verified in email provider. Please verify your sender email in the provider dashboard.';
  }
  if (combined.includes('rate limit') || combined.includes('too many requests') || err.statusCode === 429) {
    return 'Email rate limit reached. Please wait a moment before requesting another OTP.';
  }
  if (err && err.body && typeof err.body === 'object' && err.body.message) {
    return err.body.message;
  }
  return 'Unable to send verification email. Please try again.';
};

/**
 * Send 6-digit OTP verification email for account registration via Brevo
 * @param {string} to - Recipient email address
 * @param {string} otp - 6-digit OTP code
 */
const sendVerificationEmail = async (to, otp) => {
  const client = getBrevoClient();
  const sender = getSender();

  const textContent = `KrishiShetra
────────────────────

Verify your email address

Your verification code is:

${otp}

This OTP expires in 10 minutes.

If you did not create a KrishiShetra account, you can safely ignore this email.

© 2026 KrishiShetra. All rights reserved.`;

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1e293b;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #16a34a; font-size: 26px; font-weight: 700; margin: 0 0 6px 0; letter-spacing: -0.5px;">KrishiShetra</h1>
        <p style="color: #64748b; font-size: 13px; margin: 0; text-transform: uppercase; letter-spacing: 1px;">Empowering Agricultural Commerce</p>
      </div>

      <div style="border-top: 1px solid #f1f5f9; padding-top: 24px;">
        <h2 style="color: #0f172a; font-size: 20px; font-weight: 600; margin: 0 0 12px 0;">Verify your email address</h2>
        <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
          Thank you for joining KrishiShetra. Please use the verification code below to verify your email address and activate your account.
        </p>

        <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 20px; border-radius: 10px; text-align: center; margin: 24px 0;">
          <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #166534; display: inline-block;">${otp}</span>
        </div>

        <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin: 0 0 24px 0;">
          ⏳ This verification code expires in <strong>10 minutes</strong>.
        </p>

        <div style="background-color: #f8fafc; border-left: 3px solid #94a3b8; padding: 12px 16px; border-radius: 4px; margin-bottom: 24px;">
          <p style="color: #64748b; font-size: 12px; margin: 0; line-height: 1.5;">
            <strong>Security Notice:</strong> If you did not create a KrishiShetra account, you can safely ignore this email. Never share this OTP with anyone.
          </p>
        </div>
      </div>

      <div style="border-top: 1px solid #f1f5f9; padding-top: 20px; text-align: center;">
        <p style="color: #94a3b8; font-size: 12px; margin: 0 0 4px 0;">
          © 2026 KrishiShetra. All rights reserved.
        </p>
        <p style="color: #cbd5e1; font-size: 11px; margin: 0;">
          Secured Agricultural Trade & Logistics Platform
        </p>
      </div>
    </div>
  `;

  try {
    const response = await client.transactionalEmails.sendTransacEmail({
      subject: 'KrishiShetra - Verify your email address',
      htmlContent: htmlContent,
      textContent: textContent,
      sender: sender,
      to: [{ email: to.toLowerCase().trim() }]
    });

    console.log('[Email Service] Verification OTP email dispatched via Brevo');
    return response;
  } catch (err) {
    const safeError = formatBrevoError(err);
    console.error('[Email Service Error]:', safeError);
    throw new Error(safeError);
  }
};

// Reusable alias matching the service specification
const sendVerificationOtp = sendVerificationEmail;

/**
 * Send 6-digit OTP password reset email via Brevo
 * @param {string} to - Recipient email address
 * @param {string} otp - 6-digit OTP code
 */
const sendPasswordResetEmail = async (to, otp) => {
  const client = getBrevoClient();
  const sender = getSender();

  const appOrigin = (process.env.RENDER_EXTERNAL_URL || process.env.FRONTEND_URL || 'http://localhost:5000').split(',')[0].trim().replace(/\/+$/, '');
  const resetUrl = `${appOrigin}/login.html?reset=true&email=${encodeURIComponent(to.toLowerCase().trim())}`;

  const textContent = `KrishiShetra
────────────────────

Password Reset Request

Your password reset OTP is:

${otp}

This OTP expires in 10 minutes.

You can also reset your password directly by visiting:
${resetUrl}

If you did not request a password reset, please ignore this email.

© 2026 KrishiShetra. All rights reserved.`;

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1e293b;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #12372A; font-size: 26px; font-weight: 700; margin: 0 0 6px 0; letter-spacing: -0.5px;">KrishiShetra</h1>
        <p style="color: #64748b; font-size: 13px; margin: 0; text-transform: uppercase; letter-spacing: 1px;">Security & Account Recovery</p>
      </div>

      <div style="border-top: 1px solid #f1f5f9; padding-top: 24px;">
        <h2 style="color: #0f172a; font-size: 20px; font-weight: 600; margin: 0 0 12px 0;">Password Reset Request</h2>
        <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
          We received a request to reset your password. Use the OTP code below or click the reset button to verify your identity and set a new password:
        </p>

        <div style="background-color: #f1f5f9; border: 1px solid #cbd5e1; padding: 20px; border-radius: 10px; text-align: center; margin: 24px 0;">
          <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #12372A; display: inline-block;">${otp}</span>
        </div>

        <div style="text-align: center; margin: 24px 0;">
          <a href="${resetUrl}" style="display: inline-block; background-color: #16a34a; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 600;">
            Reset Password Directly →
          </a>
        </div>

        <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin: 0 0 24px 0;">
          ⏳ This OTP and link expire in <strong>10 minutes</strong>.
        </p>

        <div style="background-color: #fef2f2; border-left: 3px solid #ef4444; padding: 12px 16px; border-radius: 4px; margin-bottom: 24px;">
          <p style="color: #991b1b; font-size: 12px; margin: 0; line-height: 1.5;">
            <strong>Notice:</strong> If you did not request a password reset, please ignore this email or change your password if you suspect unauthorized activity.
          </p>
        </div>
      </div>

      <div style="border-top: 1px solid #f1f5f9; padding-top: 20px; text-align: center;">
        <p style="color: #94a3b8; font-size: 12px; margin: 0 0 4px 0;">
          © 2026 KrishiShetra. All rights reserved.
        </p>
      </div>
    </div>
  `;

  try {
    const response = await client.transactionalEmails.sendTransacEmail({
      subject: 'KrishiShetra - Password Reset Request',
      htmlContent: htmlContent,
      textContent: textContent,
      sender: sender,
      to: [{ email: to.toLowerCase().trim() }]
    });

    console.log('[Email Service] Password reset OTP email dispatched via Brevo');
    return response;
  } catch (err) {
    const safeError = formatBrevoError(err);
    console.error('[Email Service Error]:', safeError);
    throw new Error(safeError);
  }
};

module.exports = {
  sendVerificationEmail,
  sendVerificationOtp,
  sendPasswordResetEmail
};
