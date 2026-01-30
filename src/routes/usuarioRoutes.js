import express from "express";
import {
  registerUser,
  loginUser,
  updateUserPhoto,
  changePassword,
  updateUserTheme,
} from "../controllers/usuarioController.js";
import upload from "../middleware/upload.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Register
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// Update user photo
router.patch("/:userId/photo", auth, upload.single("photo"), updateUserPhoto);

// Change password
router.patch("/change-password", auth, changePassword);

// Update theme
router.patch("/theme", auth, updateUserTheme);

export default router;
