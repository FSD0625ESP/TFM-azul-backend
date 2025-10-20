import express from "express";
import { registerMark } from "../controllers/registerMark.js";

const router = express.Router();

// Crear mark para un usuario
router.post("/createMark/:userId", registerMark);

export default router;
