import express from "express";
import Message from "../models/Message.js";

const router = express.Router();

// GET messages for an order
router.get("/order/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    const messages = await Message.find({ orderId }).sort({ timestamp: 1 });
    res.json({ messages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching messages" });
  }
});

// Mark messages for an order as read (by orderId)
router.post("/order/:orderId/read", async (req, res) => {
  try {
    const { orderId } = req.params;
    await Message.updateMany({ orderId, read: false }, { read: true });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error marking messages as read" });
  }
});

export default router;
