const { Resend } = require('resend');

const sendVerificationEmail = async (to, otp) => {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not configured in environment variables');
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const fromEmail = process.env.EMAIL_FROM || 'onboarding@resend.dev';

  const textContent = `KrishiShetra
────────────────────

Verify your email

Your verification OTP is:

${otp}

This OTP expires in 5 minutes.

If you did not create a KrishiShetra account,
you can safely ignore this email.`;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
      <h2 style="color: #16a34a; margin-top: 0; font-size: 22px;">KrishiShetra</h2>
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
      <h3 style="color: #1e293b; font-size: 18px; margin-bottom: 8px;">Verify your email</h3>
      <p style="color: #475569; font-size: 14px; line-height: 1.5;">Your verification OTP is:</p>
      <div style="background-color: #f1f5f9; padding: 16px; border-radius: 6px; text-align: center; margin: 20px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #0f172a;">${otp}</span>
      </div>
      <p style="color: #64748b; font-size: 13px; line-height: 1.5;">This OTP expires in <strong>5 minutes</strong>.</p>
      <p style="color: #94a3b8; font-size: 12px; margin-top: 24px; border-top: 1px solid #f1f5f9; padding-top: 12px;">
        If you did not create a KrishiShetra account, you can safely ignore this email.
      </p>
    </div>
  `;

  const { data, error } = await resend.emails.send({
    from: fromEmail,
    to: [to],
    subject: 'KrishiShetra - Verify your email',
    text: textContent,
    html: htmlContent
  });

  if (error) {
    throw new Error(error.message || 'Failed to send verification email');
  }

  return data;
};

const sendPasswordResetEmail = async (to, otp) => {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not configured in environment variables');
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const fromEmail = process.env.EMAIL_FROM || 'onboarding@resend.dev';

  const textContent = `KrishiShetra
────────────────────

Password Reset

Your password reset OTP is:

${otp}

This OTP expires in 5 minutes.

If you did not request a password reset,
please ignore this email.`;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
      <h2 style="color: #12372A; margin-top: 0; font-size: 22px;">KrishiShetra</h2>
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
      <h3 style="color: #1e293b; font-size: 18px; margin-bottom: 8px;">Password Reset Request</h3>
      <p style="color: #475569; font-size: 14px; line-height: 1.5;">Your password reset OTP is:</p>
      <div style="background-color: #f1f5f9; padding: 16px; border-radius: 6px; text-align: center; margin: 20px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #12372A;">${otp}</span>
      </div>
      <p style="color: #64748b; font-size: 13px; line-height: 1.5;">This OTP expires in <strong>5 minutes</strong>.</p>
      <p style="color: #94a3b8; font-size: 12px; margin-top: 24px; border-top: 1px solid #f1f5f9; padding-top: 12px;">
        If you did not request a password reset, please ignore this email.
      </p>
    </div>
  `;

  const { data, error } = await resend.emails.send({
    from: fromEmail,
    to: [to],
    subject: 'KrishiShetra - Password Reset Request',
    text: textContent,
    html: htmlContent
  });

  if (error) {
    throw new Error(error.message || 'Failed to send password reset email');
  }

  return data;
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail
};

