const mongoose = require("mongoose");

const FavoritesSchema = new mongoose.Schema({
  raider: { type: mongoose.Schema.Types.ObjectId, ref: "Raider" },
  shop: { type: mongoose.Schema.Types.ObjectId, ref: "Shop" },
});

module.exports = mongoose.model("Favorites", FavoritesSchema);
