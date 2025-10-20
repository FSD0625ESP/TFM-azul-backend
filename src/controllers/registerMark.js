import Mark from "../models/Mark.js";
import User from "../models/User.js";

export const registerMark = async (req, res) => {
  try {
    const { userId } = req.params;
    const { shopName, shopType, streetAddress, lat, long } = req.body;

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

    // Opcional: guardar la info de la tienda en User o Shop si tienes otro modelo
    // await User.findByIdAndUpdate(userId, { shopName, shopType, streetAddress });

    return res.status(201).json({ mark: newMark });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error creating mark" });
  }
};
