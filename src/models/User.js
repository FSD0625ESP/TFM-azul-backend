import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
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
  reservedLots: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lot",
    },
  ],
});

const User = mongoose.model("User", UserSchema);
export default User;
