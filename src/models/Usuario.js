import mongoose from "mongoose";

const UsuarioSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "El nombre es obligatorio"],
    trim: true, // elimina espacios en blanco
  },
  mail: {
    type: String,
    required: [true, "El correo es obligatorio"],
    unique: true, // evita correos duplicados
    lowercase: true, // guarda el correo en minúsculas
  },
  password: {
    type: String,
    required: [true, "La contraseña es obligatoria"],
    minlength: [6, "La contraseña debe tener al menos 6 caracteres"],
  },
  photo: {
    type: String,
    default: "",
  },
  number: {
    type: Number,
  },
  type_user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TypeUser",
  },
});

const Usuario = mongoose.model("Usuario", UsuarioSchema);
export default Usuario;
