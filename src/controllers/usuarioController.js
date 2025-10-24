import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Shop from "../models/Shop.js";
import Raider from "../models/Raider.js";
import bcrypt from "bcryptjs";

// Register User
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, photo, phone, user_type, shopData } =
      req.body;

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
      photo,
      phone,
      user_type,
    });

    await newUser.save();

    // Si es una tienda, crear el registro de Shop
    if (user_type === "shop" && shopData) {
      const newShop = new Shop({
        user: newUser._id,
        name: shopData.shopName,
        address: shopData.streetAddress,
        category: shopData.shopType,
        menus: "",
      });
      await newShop.save();
    }

    // Si es un rider, crear el registro de Raider
    if (user_type === "rider") {
      const newRaider = new Raider({
        user: newUser._id,
        estado: "available",
      });
      await newRaider.save();
    }

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        user_type: newUser.user_type,
      },
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Login User
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
    );

    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      photo: user.photo,
      phone: user.phone,
      user_type: user.user_type,
    };

    // Si es shop, buscar el Shop ID
    if (user.user_type === "shop") {
      console.log("Buscando shop para user:", user._id);
      let shop = await Shop.findOne({ user: user._id });

      if (!shop) {
        console.log("Shop no existe, creando una por defecto...");
        // Crear una shop por defecto si no existe
        shop = new Shop({
          user: user._id,
          name: "Mi Tienda",
          address: "Dirección no especificada",
          category: "General",
        });
        await shop.save();
        console.log("Shop creada por defecto:", shop._id);
      } else {
        console.log("Shop encontrada:", shop._id);
      }

      userResponse.shopId = shop._id;
    }

    res.status(200).json({
      message: "Login successful",
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
