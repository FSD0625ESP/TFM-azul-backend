import Store from "../models/Shop.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createMark } from "./markController.js";

// Registrar Tienda
export const registerStore = async (req, res) => {
  try {
    // Acepta 'address' y 'type' para el registro
    const { name, address, type, email, password, photo, phone, coordinates } =
      req.body;

    // Valida campos obligatorios según el esquema mongoose
    if (!name || !address || !type || !email || !password) {
      return res.status(400).json({
        message:
          "Los campos obligatorios son: name, address, type, email y password",
      });
    }

    // Hasheamos la contraseña igual que en usuarioController
    const hashedPassword = await bcrypt.hash(password, 10);

    const newStore = new Store({
      name,
      address,
      type,
      email,
      password: hashedPassword,
      photo: photo || "",
      phone,
    });

    await newStore.save();

    // Crear la marca para la tienda ya que se recojen las coordenadas en el registro
    if (coordinates && coordinates.lat && coordinates.lng) {
      await createMark(
        newStore._id,
        coordinates.lat.toString(),
        coordinates.lng.toString()
      );
    }

    res
      .status(201)
      .json({ message: "Store registered successfully", store: newStore });
  } catch (error) {
    console.error("Error registering store:", error);
    // Manejo de error de clave duplicada
    if (error && error.code === 11000) {
      const dupField = Object.keys(error.keyValue || {}).join(", ");
      return res.status(400).json({
        message: `Duplicate value for field(s): ${dupField}`,
        details: error.keyValue,
      });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

// Obtiene todas las tiendas
export const getAllStores = async (req, res) => {
  try {
    const stores = await Store.find();
    res.json(stores);
  } catch (error) {
    console.error("Error fetching stores:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Obtiene tienda por ID
// pero buscamos por _id ya que el modelo no incluye un campo 'user')
export const getStoreByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("Searching for store with id:", userId);

    // Intentamos buscar por _id
    const store = await Store.findById(userId);
    console.log("Store found:", store);

    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }

    res.json(store);
  } catch (error) {
    console.error("Error fetching store:", error);
    // Si el id no es un ObjectId válido, mongoose lanza un CastError
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid store id format" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

// Login de tienda
export const loginStore = async (req, res) => {
  try {
    // Extraemos email y contraseña
    const { email, password } = req.body;

    // Validamos que ambos campos
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Buscamos la tienda por su email
    const store = await Store.findOne({ email });

    // Si no existe, devolvemos error 404
    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }

    // Comparamos la contraseña enviada con la (encriptada)
    const isPasswordValid = await bcrypt.compare(password, store.password);

    // Si la contraseña no es valida, devolvemos error 401
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    // Generamos un token JWT para mantener la sesión de la tienda
    const token = jwt.sign(
      { id: store._id, email: store.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1d" } // expira en 1 dia
    );

    // Preparamos los datos que enviaremos como respuesta (sin password)
    const storeResponse = {
      id: store._id,
      name: store.name,
      email: store.email,
      type: store.type,
      address: store.address,
      photo: store.photo,
      phone: store.phone,
    };

    // Respondemos con éxito: token + datos de la tienda
    res.status(200).json({
      message: "Store login successful",
      token,
      store: storeResponse,
    });
  } catch (error) {
    // Si ocurre un error en el proceso de login
    console.error("Store login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
