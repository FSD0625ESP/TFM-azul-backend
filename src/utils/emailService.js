import SibApiV3Sdk from "@sendinblue/client";

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
apiInstance.setApiKey(
  SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY,
);

/**
 * Enviar email de recuperación de contraseña
 * @param {string} toEmail - Email del destinatario
 * @param {string} resetToken - Token de reseteo
 * @param {string} userName - Nombre del usuario (opcional)
 */
export const sendPasswordResetEmail = async (toEmail, resetToken, userName) => {
  // Detectar automáticamente el entorno
  const frontendUrl =
    process.env.NODE_ENV === "production"
      ? process.env.FRONTEND_URL_PRODUCTION
      : process.env.FRONTEND_URL;

  const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

  const sendSmtpEmail = {
    to: [
      {
        email: toEmail,
        name: userName || "User",
      },
    ],
    sender: {
      email: process.env.SENDER_EMAIL,
      name: process.env.SENDER_NAME || "SoulBites",
    },
    subject: "Reset Your Password - SoulBites",
    htmlContent: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
              background-color: #f6f8f7;
            }
            .container {
              max-width: 600px;
              margin: 40px auto;
              background-color: #ffffff;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              background: linear-gradient(135deg, #10b981 0%, #059669 100%);
              color: white;
              padding: 40px 30px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: 700;
            }
            .content {
              padding: 40px 30px;
            }
            .content p {
              font-size: 16px;
              margin: 0 0 20px;
              color: #4b5563;
            }
            .button-container {
              text-align: center;
              margin: 35px 0;
            }
            .button {
              display: inline-block;
              padding: 16px 40px;
              background: linear-gradient(135deg, #10b981 0%, #059669 100%);
              color: white;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
              font-size: 16px;
              transition: transform 0.2s;
            }
            .button:hover {
              transform: translateY(-2px);
            }
            .info-box {
              background-color: #fef3c7;
              border-left: 4px solid #f59e0b;
              padding: 16px;
              margin: 25px 0;
              border-radius: 4px;
            }
            .info-box p {
              margin: 0;
              color: #92400e;
              font-size: 14px;
            }
            .footer {
              background-color: #f9fafb;
              padding: 25px 30px;
              text-align: center;
              border-top: 1px solid #e5e7eb;
            }
            .footer p {
              margin: 5px 0;
              font-size: 14px;
              color: #6b7280;
            }
            .footer a {
              color: #10b981;
              text-decoration: none;
            }
            .divider {
              height: 1px;
              background: linear-gradient(to right, transparent, #e5e7eb, transparent);
              margin: 30px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔒 Password Reset Request</h1>
            </div>
            
            <div class="content">
              <p>Hi ${userName || "there"},</p>
              
              <p>We received a request to reset your password for your <strong>SoulBites</strong> account.</p>
              
              <p>Click the button below to create a new password:</p>
              
              <div class="button-container">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>
              
              <div class="info-box">
                <p><strong>⏰ Important:</strong> This link will expire in 1 hour for security reasons.</p>
              </div>
              
              <div class="divider"></div>
              
              <p style="font-size: 14px;">If the button doesn't work, copy and paste this link into your browser:</p>
              <p style="font-size: 13px; word-break: break-all; color: #10b981;">${resetUrl}</p>
              
              <div class="divider"></div>
              
              <p style="font-size: 14px; color: #6b7280;">
                <strong>Didn't request this?</strong> You can safely ignore this email. Your password won't be changed.
              </p>
            </div>
            
            <div class="footer">
              <p><strong>SoulBites</strong></p>
              <p>Fighting food waste, one lot at a time 🌍</p>
              <p style="margin-top: 15px;">
                Need help? <a href="mailto:${process.env.SENDER_EMAIL}">Contact Support</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
    textContent: `
      Hi ${userName || "there"},

      We received a request to reset your password for your SoulBites account.

      Click the link below to create a new password:
      ${resetUrl}

      This link will expire in 1 hour for security reasons.

      If you didn't request this, you can safely ignore this email. Your password won't be changed.

      Best regards,
      SoulBites Team
    `,
  };

  try {
    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("✅ Password reset email sent successfully:", response);
    return response;
  } catch (error) {
    console.error("❌ Error sending password reset email:", error);
    throw new Error("Failed to send password reset email");
  }
};

/**
 * Enviar email de confirmación de cambio de contraseña
 * @param {string} toEmail - Email del destinatario
 * @param {string} userName - Nombre del usuario (opcional)
 */
export const sendPasswordChangedEmail = async (toEmail, userName) => {
  const sendSmtpEmail = {
    to: [
      {
        email: toEmail,
        name: userName || "User",
      },
    ],
    sender: {
      email: process.env.SENDER_EMAIL,
      name: process.env.SENDER_NAME || "SoulBites",
    },
    subject: "Your Password Has Been Changed - SoulBites",
    htmlContent: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
              background-color: #f6f8f7;
            }
            .container {
              max-width: 600px;
              margin: 40px auto;
              background-color: #ffffff;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              background: linear-gradient(135deg, #10b981 0%, #059669 100%);
              color: white;
              padding: 40px 30px;
              text-align: center;
            }
            .content {
              padding: 40px 30px;
            }
            .footer {
              background-color: #f9fafb;
              padding: 25px 30px;
              text-align: center;
              border-top: 1px solid #e5e7eb;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Password Changed Successfully</h1>
            </div>
            <div class="content">
              <p>Hi ${userName || "there"},</p>
              <p>This is a confirmation that your password has been successfully changed.</p>
              <p>If you didn't make this change, please contact our support team immediately.</p>
            </div>
            <div class="footer">
              <p><strong>SoulBites</strong></p>
              <p>Need help? <a href="mailto:${process.env.SENDER_EMAIL}">Contact Support</a></p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("✅ Password changed confirmation email sent");
  } catch (error) {
    console.error("❌ Error sending confirmation email:", error);
  }
};
