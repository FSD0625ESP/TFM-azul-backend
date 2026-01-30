import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log("Connected to MongoDB");

    const Store = mongoose.model(
      "Store",
      new mongoose.Schema({}, { strict: false }),
      "stores",
    );

    const shopId = "697bd98cdf0babc6f2d5b652";

    console.log("\n=== Buscando tienda específica ===");
    const shop = await Store.findById(shopId);
    console.log(shop);

    console.log("\n=== Todas las tiendas ===");
    const allStores = await Store.find();
    console.log(`Total: ${allStores.length}`);
    allStores.forEach((s) => {
      console.log({
        _id: s._id.toString(),
        name: s.name,
        type: s.type,
        email: s.email,
      });
    });

    process.exit();
  })
  .catch((err) => {
    console.error("Error:", err);
    process.exit(1);
  });
