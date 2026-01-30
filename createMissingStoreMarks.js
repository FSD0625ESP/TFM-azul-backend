import mongoose from "mongoose";
import Store from "./src/models/Shop.js";
import Mark from "./src/models/Mark.js";
import dotenv from "dotenv";

dotenv.config();

// Función para geocodificar direcciones usando Mapbox
const geocodeAddress = async (address) => {
  const MAPBOX_TOKEN = process.env.MAPBOX_ACCESS_TOKEN;
  if (!MAPBOX_TOKEN) {
    throw new Error("MAPBOX_ACCESS_TOKEN no está configurado");
  }

  const encodedAddress = encodeURIComponent(address);
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json?access_token=${MAPBOX_TOKEN}&limit=1`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.features && data.features.length > 0) {
      const [lng, lat] = data.features[0].center;
      return { lat: lat.toString(), lng: lng.toString() };
    }
    return null;
  } catch (error) {
    console.error(`Error geocoding address "${address}":`, error);
    return null;
  }
};

const createMissingStoreMarks = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Obtener todas las tiendas
    const stores = await Store.find();
    console.log(`📊 Found ${stores.length} stores`);

    let created = 0;
    let skipped = 0;
    let errors = 0;

    for (const store of stores) {
      try {
        // Verificar si ya existe una marca para esta tienda
        const existingMark = await Mark.findOne({
          user: store._id,
          type_mark: "shop",
        });

        if (existingMark) {
          console.log(`✓ Store "${store.name}" already has a mark`);
          skipped++;
          continue;
        }

        console.log(`\n🔍 Processing: ${store.name}`);
        console.log(`   Address: ${store.address}`);

        // Geocodificar la dirección
        const coordinates = await geocodeAddress(store.address);

        if (!coordinates) {
          console.log(`❌ Could not geocode address for "${store.name}"`);
          errors++;
          continue;
        }

        console.log(
          `   📍 Coordinates: ${coordinates.lat}, ${coordinates.lng}`,
        );

        // Crear la marca
        const newMark = await Mark.create({
          state: true,
          user: store._id,
          userModel: "Store",
          type_mark: "shop",
          lat: coordinates.lat,
          long: coordinates.lng,
        });

        console.log(`   ✅ Mark created (ID: ${newMark._id})`);
        created++;

        // Pausa para no saturar la API de Mapbox
        await new Promise((resolve) => setTimeout(resolve, 200));
      } catch (error) {
        console.error(`❌ Error processing "${store.name}":`, error.message);
        errors++;
      }
    }

    console.log("\n" + "=".repeat(50));
    console.log("📊 SUMMARY:");
    console.log(`   Total stores: ${stores.length}`);
    console.log(`   Marks created: ${created}`);
    console.log(`   Skipped (already had mark): ${skipped}`);
    console.log(`   Errors: ${errors}`);
    console.log("=".repeat(50));

    process.exit(0);
  } catch (error) {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  }
};

createMissingStoreMarks();
