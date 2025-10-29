import express from "express";
import Mark from "../models/Mark.js";
import Lot from "../models/Lot.js";

const router = express.Router();

// GET /api/marks → devuelve homeless + shops que tienen al menos 1 lote
router.get("/", async (req, res) => {
  try {
    // Obtener los shop ids que tienen al menos un lote
    const storeIds = await Lot.distinct("shop");

    // Construir consulta: todas las homeless + shops cuyo id (en user o shop)
    // esté en storeIds
    const marks = await Mark.find({
      $or: [
        { type_mark: "homeless" },
        {
          $and: [
            { type_mark: "shop" },
            {
              $or: [{ shop: { $in: storeIds } }, { user: { $in: storeIds } }],
            },
          ],
        },
      ],
    });

    res.json(marks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching marks" });
  }
});

export default router;
