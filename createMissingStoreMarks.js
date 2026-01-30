import mongoose from "mongoose";
import Store from "./src/models/Shop.js";
import Mark from "./src/models/Mark.js";
import dotenv from "dotenv";

dotenv.config();

const createMissingStoreMarks = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Obtener todas las tiendas
    const stores = await Store.find();
    console.log(`📊 Found ${stores.length} stores`);

    for (const store of stores) {
      // Verificar si ya existe una marca para esta tienda
      const existingMark = await Mark.findOne({
        user: store._id,
        type_mark: "shop",
      });

      if (existingMark) {
        console.log(`✓ Store ${store.name} already has a mark`);
        continue;
      }

      // Si no existe marca, crear una con coordenadas por defecto
      // IMPORTANTE: Estas coordenadas son de ejemplo, deberías usar
      // un servicio de geocoding para obtener las reales de la dirección
      console.log(
        `⚠️  Store ${store.name} (${store.address}) doesn't have a mark`,
      );
      console.log(
        `   You need to manually create a mark for this store or use a geocoding service`,
      );
      console.log(`   Store ID: ${store._id}`);
    }

    console.log("\n✅ Check completed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

createMissingStoreMarks();
