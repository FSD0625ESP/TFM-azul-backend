import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log("Connected to MongoDB");

    const Mark = mongoose.model(
      "Mark",
      new mongoose.Schema({}, { strict: false }),
      "marks",
    );

    // Actualizar marks de tipo shop para que tengan userModel: "Store"
    const shopMarks = await Mark.updateMany(
      { type_mark: "shop" },
      { $set: { userModel: "Store" } },
    );

    console.log("Marks de tiendas actualizados:", shopMarks.modifiedCount);

    // Actualizar marks de tipo homeless para que tengan userModel: "User"
    const homelessMarks = await Mark.updateMany(
      { type_mark: "homeless" },
      { $set: { userModel: "User" } },
    );

    console.log("Marks de usuarios actualizados:", homelessMarks.modifiedCount);

    // Mostrar todos los marks actualizados
    console.log("\n=== Marks actualizados ===");
    const allMarks = await Mark.find();
    allMarks.forEach((m) => {
      console.log({
        _id: m._id.toString(),
        type_mark: m.type_mark,
        userModel: m.userModel,
        user: m.user ? m.user.toString() : null,
      });
    });

    process.exit();
  })
  .catch((err) => {
    console.error("Error:", err);
    process.exit(1);
  });
