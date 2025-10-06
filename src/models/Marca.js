const mongoose = require("mongoose");

const MarcaSchema = new mongoose.Schema({
  estado: Boolean,
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario" },
  tipo_marca: { type: mongoose.Schema.Types.ObjectId, ref: "TipoMarca" },
  lat: String,
  long: String,
});

module.exports = mongoose.model("Marca", MarcaSchema);
