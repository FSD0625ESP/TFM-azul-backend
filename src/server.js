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

// 🔥 Necesario para WebSockets
import http from "http";
import { WebSocketServer } from "ws";

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

// Rutas backend
app.use("/api/users", usuarioRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/createMark", createMarkRoutes);
app.use("/api/marks", marksRoutes);
app.use("/api/lots", lotRoutes);

// Ruta básica
app.get("/", (req, res) => {
  res.json({ message: "API working correctly" });
});

// ----------------------------------------------------------------------------
// 🔥 Crear servidor HTTP para combinar Express + WebSockets
// ----------------------------------------------------------------------------
const server = http.createServer(app);

// 🔥 Crear WebSocket Server
const wss = new WebSocketServer({ server });

// ----------------------------------------------------------------------------
// 🟦 CHAT PRIVADO RIDER ↔ STORE POR ORDER ID
// ----------------------------------------------------------------------------

// Estructura: rooms = { orderId: Set<WebSockets> }
const rooms = new Map();

wss.on("connection", (ws) => {
  console.log("WS client connected");

  let orderId = null;
  let userType = null; // "rider" o "store"
  let userId = null;

  ws.on("message", (raw) => {
    const data = JSON.parse(raw);

    // ---------------------------------------------
    // 🟦 JOIN AL CHAT DEL PEDIDO
    // ---------------------------------------------
    if (data.type === "join") {
      orderId = data.orderId;
      userType = data.userType; // rider o store
      userId = data.userId;

      if (!rooms.has(orderId)) {
        rooms.set(orderId, new Set());
      }

      rooms.get(orderId).add(ws);

      console.log(`🔵 ${userType} (${userId}) joined order ${orderId}`);

      return;
    }

    // ---------------------------------------------
    // 🟩 MENSAJE PRIVADO ENTRE RIDER Y STORE
    // ---------------------------------------------
    if (data.type === "message") {
      broadcast(orderId, {
        type: "message",
        from: userType,
        fromId: userId,
        content: data.content,
        timestamp: new Date().toISOString(),
      });
    }
  });

  // ---------------------------------------------
  // 🔴 DESCONEXIÓN DEL USUARIO
  // ---------------------------------------------
  ws.on("close", () => {
    if (rooms.has(orderId)) {
      rooms.get(orderId).delete(ws);

      if (rooms.get(orderId).size === 0) {
        rooms.delete(orderId);
      }
    }

    console.log("WS client disconnected");
  });
});

// ----------------------------------------------------------------------------
// 🔈 BROADCAST SOLO A LOS PARTICIPANTES DEL PEDIDO
// ----------------------------------------------------------------------------
function broadcast(orderId, message) {
  if (!rooms.has(orderId)) return;

  rooms.get(orderId).forEach((client) => {
    if (client.readyState === 1) {
      client.send(JSON.stringify(message));
    }
  });
}

// ----------------------------------------------------------------------------
// 🟢 INICIAR SERVIDOR EXPRESS + WEBSOCKETS
// ----------------------------------------------------------------------------
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`🔥 Server running on port ${PORT}`));
