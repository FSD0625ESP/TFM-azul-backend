const mongoose = require("mongoose");

const TipoMarcaSchema = new mongoose.Schema({
  nombre_marca: String,
});

module.exports = mongoose.model("TipoMarca", TipoMarcaSchema);
