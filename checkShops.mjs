import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log("Connected to MongoDB");

    // Buscar el shop específico
    const Shop = mongoose.model(
      "Shop",
      new mongoose.Schema({}, { strict: false }),
      "shops",
    );
    const User = mongoose.model(
      "User",
      new mongoose.Schema({}, { strict: false }),
      "users",
    );

    const shopId = "697bd98cdf0babc6f2d5b652";

    console.log("\n=== Buscando en colección SHOPS ===");
    const shop = await Shop.findById(shopId);
    console.log(shop);

    console.log("\n=== Buscando en colección USERS ===");
    const user = await User.findById(shopId);
    console.log(user);

    console.log("\n=== Todas las tiendas en SHOPS ===");
    const allShops = await Shop.find();
    console.log(`Total: ${allShops.length}`);
    allShops.forEach((s) => {
      console.log({
        _id: s._id.toString(),
        name: s.name,
        type: s.type,
      });
    });

    process.exit();
  })
  .catch((err) => {
    console.error("Error:", err);
    process.exit(1);
  });
