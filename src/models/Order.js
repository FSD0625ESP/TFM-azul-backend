const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  raider: { type: mongoose.Schema.Types.ObjectId, ref: "Raider" },
  shop: { type: mongoose.Schema.Types.ObjectId, ref: "Shop" },
  state: String,
  time_reco: Date,
  amount_menus: String,
});

module.exports = mongoose.model("Order", OrderSchema);
