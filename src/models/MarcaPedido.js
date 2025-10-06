const mongoose = require("mongoose");

const MarcaPedidoSchema = new mongoose.Schema({
  marca: { type: mongoose.Schema.Types.ObjectId, ref: "Marca" },
  pedido: { type: mongoose.Schema.Types.ObjectId, ref: "Pedido" },
  cantidad_menus: String,
});

module.exports = mongoose.model("MarcaPedido", MarcaPedidoSchema);
