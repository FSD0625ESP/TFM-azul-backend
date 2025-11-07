import Mark from "../models/Mark.js";
import Shop from "../models/Shop.js";

export const registerMark = async (req, res) => {
  try {
    const { userId } = req.params;
    // Acepta type_mark opcional para que este endpoint pueda crear tanto marcas de tiendas como de personas sin hogar
    const { shopType, lat, long, shopName, streetAddress, type_mark } =
      req.body;

    console.log("registerMark - userId:", userId);
    console.log("registerMark - body:", {
      shopType,
      lat,
      long,
      shopName,
      streetAddress,
      type_mark,
    });

    if (!lat || !long || !userId) {
      return res
        .status(400)
        .json({ message: "Faltan datos requeridos (lat, long, userId)" });
    }

    const markType = type_mark || (shopType ? "shop" : "homeless");

    // Si se crea una marca de tienda, asegurarse de que shopType esté presente
    if (markType === "shop" && !shopType) {
      return res
        .status(400)
        .json({ message: "Faltan datos requeridos para la tienda (shopType)" });
    }

    // Crear la marca
    const newMark = await Mark.create({
      state: true,
      user: userId,
      type_mark: markType,
      lat,
      long,
    });

    console.log("Marca creada:", newMark._id);

    // Si es una tienda y se proporcionan shopName + streetAddress, crear el registro de la tienda
    if (markType === "shop" && shopName && streetAddress) {
      const newShop = new Shop({
        user: userId,
        name: shopName,
        address: streetAddress,
        category: shopType,
      });
      await newShop.save();
      console.log("Tienda creada:", newShop._id);
    } else if (markType === "shop") {
      console.warn(
        "Se creó una marca de tienda pero faltan shopName o streetAddress; no se creó la tienda"
      );
    }

    return res.status(201).json({ mark: newMark });
  } catch (err) {
    console.error("Error en registerMark:", err);
    return res
      .status(500)
      .json({ message: "Error del servidor al crear la marca" });
  }
};
