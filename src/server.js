import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import usuarioRoutes from "./routes/usuarioRoutes.js";
import storeRoutes from "./routes/storeRoutes.js";
import createMarkRoutes from "./routes/createMark.js";
import marksRoutes from "./routes/showMarks.js";
import lotRoutes from "./routes/lotRoutes.js";
import "./lotExpireTime/lotCleanup.js";

dotenv.config();
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Conexión a MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

// Rutas existentes
app.use("/api/users", usuarioRoutes);
app.use("/api/stores", storeRoutes);

// Nueva ruta para registrar Shop y Mark
app.use("/api/createMark", createMarkRoutes);

app.use("/api/marks", marksRoutes);

app.use("/api/lots", lotRoutes);

// Ruta básica
app.get("/", (req, res) => {
  res.json({ message: "API working correctly" });
});

// Puerto
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
