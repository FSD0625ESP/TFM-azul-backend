import mongoose from "mongoose";

const ShopSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  address: String,
  category: String,
  name: String,
});

const Shop = mongoose.model("Shop", ShopSchema);
export default Shop;
