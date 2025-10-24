import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Shop from "../models/Shop.js";
import Raider from "../models/Raider.js";
import bcrypt from "bcryptjs";

// Registro de usuario
export const registerUser = async (req, res) => {
  try {
    // Extraemos los datos
    const { name, email, password, photo, phone, shopData } = req.body;

    // Validamos que los campos obligatorios
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email and password are required" });
    }

    // Verificamos si el correo ya está registrado en la base de datos
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // Encriptamos la contraseña antes de guardarla
    const hashedPassword = await bcrypt.hash(password, 10);

    // Creamos una nueva instancia del modelo User
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      photo,
      phone,
    });

    // Guardamos el nuevo usuario en la base de datos
    await newUser.save();

    // Respondemos con :
    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    // Si ocurre un error devolvemos un error 500
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Login de usuario
export const loginUser = async (req, res) => {
  try {
    // Extraemos email y contraseña
    const { email, password } = req.body;

    // Validamos que ambos campos
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Buscamos el usuario por su email
    const user = await User.findOne({ email });

    // Si no existe, devolvemos error 404
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Comparamos la contraseña enviada con la guardada (encriptada)
    const isPasswordValid = await bcrypt.compare(password, user.password);

    // Si la contraseña no es valida, devolvemos error 401
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    // Generamos un token JWT para mantener la sesión del usuario
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1d" } // Por defecto, expira en 1 dia
    );

    // Preparamos los datos que enviaremos como respuesta (sin contraseña)
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      photo: user.photo,
      phone: user.phone,
    };

    // Respondemos con éxito: token + datos del usuario
    res.status(200).json({
      message: "Login successful",
      token,
      user: userResponse,
    });
  } catch (error) {
    // Si ocurre un error en el proceso de login
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
