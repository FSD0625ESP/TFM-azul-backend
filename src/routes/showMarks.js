import express from "express";
import Mark from "../models/Mark.js";
import mongoose from "mongoose";

const router = express.Router();

// GET /api/marks → devuelve todos los marks (filtrando shops sin lotes)
router.get("/", async (req, res) => {
  try {
    // 1. Primero traemos las marks
    const marks = await Mark.aggregate([
      // 2. Para cada mark, buscamos sus lotes asociados
      {
        $lookup: {
          from: "lots",
          localField: "user", // campo en Mark
          foreignField: "shop", // campo en Lot
          as: "storeLots",
        },
      },
      // 3. Calculamos cuántos lotes tiene cada mark
      {
        $addFields: {
          lotCount: { $size: "$storeLots" },
        },
      },
      // 4. Filtramos: incluir homeless + shops con al menos 1 lote
      {
        $match: {
          $or: [
            { type_mark: "homeless" },
            { $and: [{ type_mark: "shop" }, { lotCount: { $gt: 0 } }] },
          ],
        },
      },
      // 5. Limpiamos el resultado (quitamos el array de lotes)
      {
        $project: {
          storeLots: 0,
          lotCount: 0,
        },
      },
    ]);

    res.json(marks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching marks" });
  }
});

export default router;
