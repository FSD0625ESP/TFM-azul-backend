import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import Admin from "./src/models/Admin.js";

dotenv.config();

const createAdminUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Eliminar admin existente si existe
    const existingAdmin = await Admin.findOne({ email: "admin@soulbites.com" });
    if (existingAdmin) {
      await Admin.deleteOne({ email: "admin@soulbites.com" });
      console.log("Existing admin deleted");
    }

    // Crear admin con contraseña "admin123"
    const hashedPassword = await bcrypt.hash("admin123", 10);

    const admin = new Admin({
      email: "admin@soulbites.com",
      password: hashedPassword,
      name: "Administrator",
    });

    await admin.save();
    console.log("✅ Admin user created successfully!");
    console.log("Email: admin@soulbites.com");
    console.log("Password: admin123");

    process.exit(0);
  } catch (error) {
    console.error("Error creating admin:", error);
    process.exit(1);
  }
};

createAdminUser();
