import express from "express";
import {
  forgotPassword,
  resetPassword,
  verifyResetToken,
} from "../controllers/passwordController.js";

const router = express.Router();

// Solicitar recuperación de contraseña
router.post("/forgot-password", forgotPassword);

// Resetear contraseña con token
router.post("/reset-password", resetPassword);

// Verificar si un token es válido (opcional)
router.get("/verify-reset-token", verifyResetToken);

export default router;
