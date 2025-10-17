const mongoose = require("mongoose");

const TypeUserSchema = new mongoose.Schema({
  name_type: String,
});

module.exports = mongoose.model("TypeUser", TypeUserSchema);
