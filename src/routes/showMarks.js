import express from "express";
import Mark from "../models/Mark.js";

const router = express.Router();

// GET /api/marks → devuelve todos los marks
router.get("/", async (req, res) => {
  try {
    const marks = await Mark.find(); // trae todos los marks de la DB
    res.json(marks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching marks" });
  }
});

export default router;
