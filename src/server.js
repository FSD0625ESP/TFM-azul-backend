import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import usuarioRoutes from "./routes/usuarioRoutes.js";
import storeRoutes from "./routes/storeRoutes.js";
import createMarkRoutes from "./routes/createMark.js";
import marksRoutes from "./routes/showMarks.js";
import lotRoutes from "./routes/lotRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import "./lotExpireTime/lotCleanup.js";
import Message from "./models/Message.js";
import Lot from "./models/Lot.js";
import messagesRoutes from "./routes/messages.js";
import { setSender } from "./utils/notify.js";

// 🔥 Necesario para WebSockets
import http from "http";
import { WebSocketServer } from "ws";

dotenv.config();
const app = express();

// Middlewares
const corsOptions = {
  origin: [
    "https://soulbites.netlify.app",
    /\.netlify\.app$/, // Permite cualquier subdominio de netlify.app
    "http://localhost:3000",
    "http://localhost:5173",
    process.env.FRONTEND_URL || "https://soulbites.netlify.app",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));
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
app.use("/api/messages", messagesRoutes);
app.use("/api/admin", adminRoutes);

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
// Mapa userId => Set<WebSocket> para notificar users conectados aunque no
// tengan el chat abierto
const userSockets = new Map();

// Register sender so other modules can notify users by userId
setSender(async (targetUserId, payload) => {
  if (!targetUserId) return;
  const sockets = userSockets.get(String(targetUserId)) || new Set();
  sockets.forEach((s) => {
    if (s.readyState === 1) s.send(JSON.stringify(payload));
  });
});
wss.on("connection", (ws) => {
  console.log("WS client connected");

  let orderId = null;
  let userType = null; // "rider" o "store"
  let userId = null;

  ws.on("message", async (raw) => {
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

      const room = rooms.get(orderId);
      const alreadyInRoom = room.has(ws);
      room.add(ws);

      if (!alreadyInRoom) {
        console.log(
          `🔵 ${userType} (${userId || "unknown"}) joined order ${orderId}`
        );
      }

      return;
    }

    // Identificar socket con userId (para notificaciones globales)
    if (data.type === "identify") {
      userId = data.userId;
      userType = data.userType;
      if (!userSockets.has(userId)) userSockets.set(userId, new Set());
      userSockets.get(userId).add(ws);
      console.log(`🆔 Identified socket for user ${userId}`);
      return;
    }

    // ---------------------------------------------
    // 🟩 MENSAJE PRIVADO ENTRE RIDER Y STORE
    // ---------------------------------------------
    if (data.type === "message") {
      try {
        // Persist message
        const saved = await Message.create({
          orderId: data.orderId,
          fromId: data.userId || userId,
          fromType: data.userType || userType,
          content: data.content,
          read: false,
        });

        const messagePayload = {
          type: "message",
          orderId: data.orderId,
          from: data.userType || userType,
          fromId: data.userId || userId,
          content: data.content,
          timestamp: saved.timestamp || new Date().toISOString(),
        };

        // Broadcast to room participants (if any)
        broadcast(data.orderId, messagePayload);

        // Notify other connected sockets for the other participant
        // Resolve order participants from Lot model
        const lot = await Lot.findById(data.orderId).lean();
        let recipientId = null;
        if (lot) {
          const shopId = lot.shop?._id || lot.shop;
          const riderId = lot.rider;
          // If sender is rider, recipient is shop; if sender is store, recipient is rider
          if ((data.userType || userType) === "rider")
            recipientId = String(shopId);
          else recipientId = String(riderId);
        }

        if (recipientId && userSockets.has(recipientId)) {
          userSockets.get(recipientId).forEach((s) => {
            if (s.readyState === 1) s.send(JSON.stringify(messagePayload));
          });
        }
      } catch (err) {
        console.error("Error saving or broadcasting message:", err);
      }
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

    // Remove from userSockets if identified
    if (userId && userSockets.has(userId)) {
      userSockets.get(userId).delete(ws);
      if (userSockets.get(userId).size === 0) userSockets.delete(userId);
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
