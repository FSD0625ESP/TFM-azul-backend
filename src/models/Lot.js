import mongoose from "mongoose";

const LotSchema = new mongoose.Schema({
  state: { type: Boolean, default: true },
  shop: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true },
  lot: { type: Number, required: true }, // cantidad de lotes
});

export default mongoose.model("Lot", LotSchema);
