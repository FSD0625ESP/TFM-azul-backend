const mongoose = require("mongoose");

const ShopSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  menus: String,
  address: String,
  category: String,
  name: String,
});

module.exports = mongoose.model("Shop", ShopSchema);
