const mongoose = require("mongoose");

const FavoritoSchema = new mongoose.Schema({
  raider: { type: mongoose.Schema.Types.ObjectId, ref: "Raider" },
  tienda: { type: mongoose.Schema.Types.ObjectId, ref: "Tienda" },
});

module.exports = mongoose.model("Favorito", FavoritoSchema);
