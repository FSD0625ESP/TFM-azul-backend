// models/Lot.js
import mongoose from "mongoose";

const lotSchema = new mongoose.Schema({
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Shop",
    required: true,
  },
  name: {
    type: String,
    required: true, // Ej: “Primer plato”, “Segundo plato”, “Postre”
  },
  description: {
    type: String,
    required: false, // Detalle opcional del plato
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Lot", lotSchema);
