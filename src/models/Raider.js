const mongoose = require("mongoose");

const RaiderSchema = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario" },
  estado: Boolean,
});

module.exports = mongoose.model("Raider", RaiderSchema);
