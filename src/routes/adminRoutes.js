import express from "express";
import { loginAdmin, createAdmin } from "../controllers/adminController.js";
import adminAuth from "../middleware/adminAuth.js";
import User from "../models/User.js";
import Store from "../models/Shop.js";
import Lot from "../models/Lot.js";
import bcrypt from "bcryptjs";

const router = express.Router();

// Login de admin
router.post("/login", loginAdmin);

// Crear admin (endpoint de setup - en producción deberías protegerlo o quitarlo)
router.post("/create", createAdmin);

// ============ CRUD de USUARIOS ============

// Obtener todos los usuarios
router.get("/users", adminAuth, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Crear usuario
router.post("/users", adminAuth, async (req, res) => {
  try {
    const { name, email, password, phone, photo } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email and password are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      photo,
    });

    await newUser.save();

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        photo: newUser.photo,
      },
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Eliminar usuario
router.delete("/users/:userId", adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ============ CRUD de TIENDAS ============

// Obtener todas las tiendas
router.get("/stores", adminAuth, async (req, res) => {
  try {
    const stores = await Store.find().select("-password");
    res.json(stores);
  } catch (error) {
    console.error("Error fetching stores:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Crear tienda
router.post("/stores", adminAuth, async (req, res) => {
  try {
    const { name, address, type, email, password, phone, photo } = req.body;

    if (!name || !address || !type || !email || !password) {
      return res.status(400).json({
        message: "Name, address, type, email and password are required",
      });
    }

    const existingStore = await Store.findOne({ email });
    if (existingStore) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newStore = new Store({
      name,
      address,
      type,
      email,
      password: hashedPassword,
      phone,
      photo,
    });

    await newStore.save();

    res.status(201).json({
      message: "Store created successfully",
      store: {
        id: newStore._id,
        name: newStore.name,
        email: newStore.email,
        type: newStore.type,
        address: newStore.address,
        phone: newStore.phone,
        photo: newStore.photo,
      },
    });
  } catch (error) {
    console.error("Error creating store:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Eliminar tienda
router.delete("/stores/:storeId", adminAuth, async (req, res) => {
  try {
    const { storeId } = req.params;
    const deletedStore = await Store.findByIdAndDelete(storeId);

    if (!deletedStore) {
      return res.status(404).json({ message: "Store not found" });
    }

    res.json({ message: "Store deleted successfully" });
  } catch (error) {
    console.error("Error deleting store:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ============ VISTA DE LOTES ============

// Obtener todos los lotes con información completa (incluyendo quién los reservó)
router.get("/lots", adminAuth, async (req, res) => {
  try {
    const lots = await Lot.find()
      .populate("shop", "name email type address")
      .populate("rider", "name email phone");

    res.json(lots);
  } catch (error) {
    console.error("Error fetching lots:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
