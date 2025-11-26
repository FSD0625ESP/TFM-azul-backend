import express from "express";
import { registerUser, loginUser, updateUserPhoto } from "../controllers/usuarioController.js";
import upload from "../middleware/upload.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Register
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// Update user photo
router.patch("/:userId/photo", auth, upload.single("photo"), updateUserPhoto);

export default router;
