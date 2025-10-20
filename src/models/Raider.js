import mongoose from "mongoose";

const RaiderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  estado: { type: String, default: "available" },
});

const Raider = mongoose.model("Raider", RaiderSchema);
export default Raider;
