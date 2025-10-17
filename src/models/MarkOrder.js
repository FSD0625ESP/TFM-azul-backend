const mongoose = require("mongoose");

const MarkOrderSchema = new mongoose.Schema({
  mark: { type: mongoose.Schema.Types.ObjectId, ref: "Mark" },
  order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
  amount_menus: String,
});

module.exports = mongoose.model("MarkOrder", MarkOrderSchema);
