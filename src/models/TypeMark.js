const mongoose = require("mongoose");

const TypeMarkSchema = new mongoose.Schema({
  name_mark: String,
});

module.exports = mongoose.model("TypeMark", TypeMarkSchema);
