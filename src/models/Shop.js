import mongoose from "mongoose";

const ShopSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
  },
  adress: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
  },
  type: {
    type: String,
    required: [true, "Type is required"],
    unique: true,
    lowercase: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [6, "Password must be at least 6 characters"],
  },
  photo: {
    type: String,
    default: "",
  },
  phone: {
    type: Number,
  },
});

const Shop = mongoose.model("Shop", ShopSchema);
export default Shop;
