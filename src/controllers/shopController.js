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
