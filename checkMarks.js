const mongoose = require("mongoose");

mongoose
  .connect("mongodb://localhost:27017/tfmazul")
  .then(async () => {
    console.log("Connected to MongoDB");

    const Mark = mongoose.model(
      "Mark",
      new mongoose.Schema({
        user: mongoose.Schema.Types.ObjectId,
        type_mark: String,
        lat: String,
        long: String,
        state: Boolean,
      }),
    );

    const marks = await Mark.find({ type_mark: "shop" });
    console.log("\n=== SHOP MARKS ===");
    marks.forEach((m) => {
      console.log({
        _id: m._id.toString(),
        user: m.user ? m.user.toString() : null,
        type_mark: m.type_mark,
        lat: m.lat,
        long: m.long,
      });
    });

    process.exit();
  })
  .catch((err) => {
    console.error("Error:", err);
    process.exit(1);
  });
