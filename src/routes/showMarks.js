import express from "express";
import Mark from "../models/Mark.js";
import Lot from "../models/Lot.js";

const router = express.Router();

// GET /api/marks → devuelve homeless + shops que tienen al menos 1 lote (reservado o no)
router.get("/", async (req, res) => {
  try {
    // Obtener los shop ids que tienen al menos un lote (reservado o no, pero no recogido/entregado)
    const lots = await Lot.find({
      pickedUp: false, // Solo lotes que no han sido recogidos
      delivered: false, // y no han sido entregados
    });
    const storeIds = [...new Set(lots.map((lot) => String(lot.shop)))];

    console.log("Store IDs with lots:", storeIds);

    // Devolver todas las homeless + shops que tienen lotes
    const marks = await Mark.find({
      $or: [
        { type_mark: "homeless" },
        {
          $and: [{ type_mark: "shop" }, { user: { $in: storeIds } }],
        },
      ],
    }).populate("user", "name photo");

    console.log(`Found ${marks.length} marks (shops + homeless)`);

    res.json(marks);
  } catch (err) {
    console.error("Error fetching marks:", err);
    res.status(500).json({ message: "Server error fetching marks" });
  }
});

export default router;
