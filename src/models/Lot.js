// models/Lot.js
import mongoose from "mongoose";

const lotSchema = new mongoose.Schema({
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Shop",
    required: true, // Relación con la tienda que creó el lote
  },
  name: {
    type: String,
    required: true, // Ej: "Primer plato", "Segundo plato", "Postre"
  },
  description: {
    type: String,
    required: false, // Detalle opcional del plato
  },
  pickupDeadline: {
    type: Date,
    required: true, // Nueva propiedad: hora límite para recoger el pedido
    // Ejemplo de valor esperado: "2025-10-24T15:30:00Z"
  },
  createdAt: {
    type: Date,
    default: Date.now, // Fecha de creación del lote
  },
});

export default mongoose.model("Lot", lotSchema);
