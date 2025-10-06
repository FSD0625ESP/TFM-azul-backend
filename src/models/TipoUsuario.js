const mongoose = require("mongoose");

const TipoUsuarioSchema = new mongoose.Schema({
  nombre_tipo: String,
});

module.exports = mongoose.model("TipoUsuario", TipoUsuarioSchema);
