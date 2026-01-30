import mongoose from "mongoose";
import dotenv from "dotenv";
import Mark from "./src/models/Mark.js";

dotenv.config();

const createMarkForCondis = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const condisShopId = "697ce996c90b47e4ae9f815e";

    // Coordenadas aproximadas de Carrer De Maragall, 08912 Badalona
    const lat = "41.4481";
    const long = "2.2436";

    // Verificar si ya existe una marca para esta tienda
    const existingMark = await Mark.findOne({
      user: condisShopId,
      type_mark: "shop",
    });

    if (existingMark) {
      console.log("Mark already exists for Condis:", existingMark._id);
      process.exit(0);
    }

    // Crear la marca
    const newMark = await Mark.create({
      state: true,
      user: condisShopId,
      userModel: "Store",
      type_mark: "shop",
      lat,
      long,
    });

    console.log("✅ Mark created successfully for Condis!");
    console.log("Mark ID:", newMark._id);
    console.log("Coordinates:", { lat, long });

    process.exit(0);
  } catch (error) {
    console.error("Error creating mark:", error);
    process.exit(1);
  }
};

createMarkForCondis();
