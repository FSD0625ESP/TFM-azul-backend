const mongoose = require("mongoose");

const TiendaSchema = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario" },
  menus: String,
  direccion: String,
  categoria: String,
  horario: String,
  nombre: String,
});

module.exports = mongoose.model("Tienda", TiendaSchema);
