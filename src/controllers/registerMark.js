import Mark from "../models/Mark.js";
import Shop from "../models/Shop.js";

export const registerMark = async (req, res) => {
  try {
    const { userId } = req.params;
    // Accept optional type_mark so this endpoint can create both shop and homeless marks
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
        .json({ message: "Missing required data (lat,long,userId)" });
    }

    const markType = type_mark || (shopType ? "shop" : "homeless");

    // If creating a shop mark, ensure shopType is provided
    if (markType === "shop" && !shopType) {
      return res
        .status(400)
        .json({ message: "Missing required data for shop (shopType)" });
    }

    // Create the Mark
    const newMark = await Mark.create({
      state: true,
      user: userId,
      type_mark: markType,
      lat,
      long,
    });

    console.log("Mark creado:", newMark._id);

    // If this is a shop and we have shopName+streetAddress, create the Shop record
    if (markType === "shop" && shopName && streetAddress) {
      const newShop = new Shop({
        user: userId,
        name: shopName,
        address: streetAddress,
        category: shopType,
      });
      await newShop.save();
      console.log("Shop creada:", newShop._id);
    } else if (markType === "shop") {
      console.warn(
        "Shop mark created but missing shopName or streetAddress; shop not created"
      );
    }

    return res.status(201).json({ mark: newMark });
  } catch (err) {
    console.error("Error en registerMark:", err);
    return res.status(500).json({ message: "Server error creating mark" });
  }
};
