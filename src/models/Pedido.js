const mongoose = require("mongoose");

const PedidoSchema = new mongoose.Schema({
  raider: { type: mongoose.Schema.Types.ObjectId, ref: "Raider" },
  tienda: { type: mongoose.Schema.Types.ObjectId, ref: "Tienda" },
  estado: String,
  time_reco: Date,
  cantidad_menus: String,
});

module.exports = mongoose.model("Pedido", PedidoSchema);
