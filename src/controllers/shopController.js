import Shop from "../models/Shop.js";
import bcrypt from "bcryptjs";

// Registrar Tienda
export const registerShop = async (req, res) => {
  try {
    // Acepta tanto 'adress' (modelo) como 'address' (ortografía correcta del cliente)
    // y 'type' o 'category' para mayor compatibilidad.
    const {
      name,
      adress, // uso interno según el modelo
      address, // posible variante desde el cliente
      type,
      category,
      email,
      password,
      photo,
      phone,
    } = req.body;

    const shopAdress = adress || address;
    const shopType = type || category;

    // Valida campos obligatorios según el esquema
    if (!name || !shopAdress || !shopType || !email || !password) {
      return res.status(400).json({
        message:
          "Los campos obligatorios son: name, adress/address, type/category, email y password",
      });
    }

    // Hasheamos la contraseña igual que en usuarioController
    const hashedPassword = await bcrypt.hash(password, 10);

    const newShop = new Shop({
      name,
      adress: shopAdress,
      type: shopType,
      email,
      password: hashedPassword,
      photo: photo || "",
      phone,
    });

    await newShop.save();

    res
      .status(201)
      .json({ message: "Shop registered successfully", shop: newShop });
  } catch (error) {
    console.error("Error registering shop:", error);
    // Manejo de error de clave duplicada para campos únicos (11000)
    if (error && error.code === 11000) {
      const dupField = Object.keys(error.keyValue || {}).join(", ");
      return res.status(400).json({
        message: `Duplicate value for field(s): ${dupField}`,
        details: error.keyValue,
      });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

// Obtiene todas las tiendas
export const getAllShops = async (req, res) => {
  try {
    const shops = await Shop.find();
    res.json(shops);
  } catch (error) {
    console.error("Error fetching shops:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Obtiene tienda por ID (la ruta actual usa /user/:userId, mantenemos el parámetro
// pero buscamos por _id ya que el modelo no incluye un campo 'user')
export const getShopByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("Searching for shop with id:", userId);

    // Intentamos buscar por _id
    const shop = await Shop.findById(userId);
    console.log("Shop found:", shop);

    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }

    res.json(shop);
  } catch (error) {
    console.error("Error fetching shop:", error);
    // Si el id no es un ObjectId válido, mongoose lanza un CastError
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid shop id format" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};
