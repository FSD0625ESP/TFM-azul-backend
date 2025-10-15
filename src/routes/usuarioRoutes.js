import express from "express";
import {
  registrarUsuario,
  loginUsuario,
} from "../controllers/usuarioController.js";

const router = express.Router();

// Register
router.post("/register", registrarUsuario);

// Login
router.post("/login", loginUsuario);

export default router;
