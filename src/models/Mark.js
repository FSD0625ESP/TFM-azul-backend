import mongoose from "mongoose";

const MarkSchema = new mongoose.Schema({
  state: { type: Boolean, default: true },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "userModel",
    required: true,
  },
  userModel: { type: String, enum: ["User", "Store"], required: true },
  type_mark: { type: String, enum: ["shop", "homeless"], required: true },
  lat: { type: String, required: true, unique: true },
  long: { type: String, required: true, unique: true },
});

export default mongoose.model("Mark", MarkSchema);
