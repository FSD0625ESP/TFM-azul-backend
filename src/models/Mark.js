import mongoose from "mongoose";

const MarkSchema = new mongoose.Schema({
  state: { type: Boolean, default: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type_mark: { type: String, enum: ["shop", "homeless"], required: true },
  lat: { type: String, required: true },
  long: { type: String, required: true },
  lotes: { type: Number },
});

export default mongoose.model("Mark", MarkSchema);
