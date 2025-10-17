const mongoose = require("mongoose");

const RaiderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  state: Boolean,
});

module.exports = mongoose.model("Raider", RaiderSchema);
