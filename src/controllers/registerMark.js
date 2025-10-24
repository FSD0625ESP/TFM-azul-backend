import Mark from "../models/Mark.js";
import Shop from "../models/Shop.js";

export const registerMark = async (req, res) => {
  try {
    const { userId } = req.params;
    const { shopType, lat, long, shopName, streetAddress } = req.body;

    console.log("registerMark - userId:", userId);
    console.log("registerMark - body:", {
      shopType,
      lat,
      long,
      shopName,
      streetAddress,
    });

    if (!lat || !long || !shopType || !userId) {
      return res.status(400).json({ message: "Missing required data" });
    }

    // Crear el Mark
    const newMark = await Mark.create({
      state: true,
      user: userId,
      type_mark: "shop",
      lat,
      long,
    });

    console.log("Mark creado:", newMark._id);

    // Crear la Shop también
    if (shopName && streetAddress) {
      const newShop = new Shop({
        user: userId,
        name: shopName,
        address: streetAddress,
        category: shopType,
      });
      await newShop.save();
      console.log("Shop creada:", newShop._id);
    } else {
      console.warn("No se creó Shop - faltan shopName o streetAddress");
    }

    return res.status(201).json({ mark: newMark });
  } catch (err) {
    console.error("Error en registerMark:", err);
    return res.status(500).json({ message: "Server error creating mark" });
  }
};
