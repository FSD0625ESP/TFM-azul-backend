const mongoose = require("mongoose");

const UsuarioSchema = new mongoose.Schema({
  nombre: String,
  correo: String,
  password: String,
  foto: String,
  telefono: Number,
  tipo_usuario: { type: mongoose.Schema.Types.ObjectId, ref: "TipoUsuario" },
});

module.exports = mongoose.model("Usuario", UsuarioSchema);
