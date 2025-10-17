const mongoose = require("mongoose");

const MarkSchema = new mongoose.Schema({
  state: Boolean,
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  type_mark: { type: mongoose.Schema.Types.ObjectId, ref: "TypeMark" },
  lat: String,
  long: String,
});

module.exports = mongoose.model("Mark", MarkSchema);
