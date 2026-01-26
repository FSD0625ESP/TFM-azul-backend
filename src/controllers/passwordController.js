import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import User from "../models/User.js";
import Store from "../models/Shop.js";
import Admin from "../models/Admin.js";
import {
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
} from "../utils/emailService.js";

// Almacén temporal de tokens de reset (en producción usar Redis)
const resetTokens = new Map();

/**
 * Solicitar recuperación de contraseña
 * POST /api/auth/forgot-password
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Buscar en todas las colecciones
    let user = await User.findOne({ email });
    let userType = "user";

    if (!user) {
      user = await Store.findOne({ email });
      userType = "store";
    }

    if (!user) {
      user = await Admin.findOne({ email });
      userType = "admin";
    }

    // Por seguridad, siempre respondemos con éxito aunque no exista el email
    if (!user) {
      return res.status(200).json({
        message: "If that email exists, a reset link has been sent",
      });
    }

    // Generar token seguro
    const resetToken = crypto.randomBytes(32).toString("hex");
    const tokenExpiry = Date.now() + 3600000; // 1 hora

    // Guardar token (en producción usar Redis con TTL)
    resetTokens.set(resetToken, {
      userId: user._id.toString(),
      userType,
      expiry: tokenExpiry,
    });

    // Limpiar tokens expirados cada 10 minutos
    setTimeout(() => {
      for (const [token, data] of resetTokens.entries()) {
        if (data.expiry < Date.now()) {
          resetTokens.delete(token);
        }
      }
    }, 600000);

    // Enviar email
    await sendPasswordResetEmail(email, resetToken, user.name);

    res.status(200).json({
      message: "Password reset email sent successfully",
    });
  } catch (error) {
    console.error("Error in forgotPassword:", error);
    res.status(500).json({
      message: "Error sending password reset email",
      error: error.message,
    });
  }
};

/**
 * Resetear contraseña con token
 * POST /api/auth/reset-password
 */
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        message: "Token and new password are required",
      });
    }

    // Validar longitud de contraseña
    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    // Verificar token
    const tokenData = resetTokens.get(token);

    if (!tokenData) {
      return res.status(400).json({
        message: "Invalid or expired reset token",
      });
    }

    // Verificar expiración
    if (tokenData.expiry < Date.now()) {
      resetTokens.delete(token);
      return res.status(400).json({
        message: "Reset token has expired",
      });
    }

    // Buscar usuario según tipo
    let user;
    let Model;

    switch (tokenData.userType) {
      case "user":
        Model = User;
        break;
      case "store":
        Model = Store;
        break;
      case "admin":
        Model = Admin;
        break;
      default:
        return res.status(400).json({ message: "Invalid user type" });
    }

    user = await Model.findById(tokenData.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Hash nueva contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Actualizar contraseña
    user.password = hashedPassword;
    await user.save();

    // Eliminar token usado
    resetTokens.delete(token);

    // Enviar email de confirmación
    await sendPasswordChangedEmail(user.email, user.name);

    res.status(200).json({
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Error in resetPassword:", error);
    res.status(500).json({
      message: "Error resetting password",
      error: error.message,
    });
  }
};

/**
 * Verificar si un token es válido (opcional)
 * GET /api/auth/verify-reset-token?token=xxx
 */
export const verifyResetToken = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    const tokenData = resetTokens.get(token);

    if (!tokenData || tokenData.expiry < Date.now()) {
      return res.status(400).json({
        valid: false,
        message: "Invalid or expired token",
      });
    }

    res.status(200).json({
      valid: true,
      message: "Token is valid",
    });
  } catch (error) {
    console.error("Error in verifyResetToken:", error);
    res.status(500).json({
      message: "Error verifying token",
      error: error.message,
    });
  }
};
