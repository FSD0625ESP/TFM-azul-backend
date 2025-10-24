import Shop from "../models/Shop.js";

// Registrar Tienda
export const registerShop = async (req, res) => {
  try {
    const { user, address, category, name } = req.body;

    // Validar campos obligatorios
    if (!user || !name || !address || !category) {
      return res
        .status(400)
        .json({ message: "User, name, address y category son requeridos" });
    }

    // Crear nueva tienda
    const newShop = new Shop({
      user,
      name,
      address,
      category,
    });

    // Guardar en la base de datos
    await newShop.save();

    res.status(201).json({
      message: "Tienda registrada correctamente",
      shop: newShop,
    });
  } catch (error) {
    console.error("Error registrando tienda:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Obtener todas las tiendas
export const getAllShops = async (req, res) => {
  try {
    const shops = await Shop.find().populate("user");
    res.json(shops);
  } catch (error) {
    console.error("Error obteniendo tiendas:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Obtener tienda por User ID
export const getShopByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("Buscando tienda para userId:", userId);
    let shop = await Shop.findOne({ user: userId }).populate("user");
    console.log("Tienda encontrada:", shop);

    if (!shop) {
      console.log("No existe shop, creando una por defecto...");
      // Si no existe, crear una por defecto
      shop = new Shop({
        user: userId,
        name: "Mi Tienda",
        address: "Dirección no especificada",
        category: "General",
      });
      await shop.save();
      console.log("Shop creada por defecto:", shop._id);
    }

    res.json(shop);
  } catch (error) {
    console.error("Error obteniendo tienda:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
