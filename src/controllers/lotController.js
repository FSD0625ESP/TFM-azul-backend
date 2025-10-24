import Lot from "../models/Lot.js";

// ➕ Crear un nuevo lote asociado a una tienda
export const createLot = async (req, res) => {
  try {
    const { shopId, lot } = req.body;

    if (!shopId || !lot) {
      return res.status(400).json({ message: "Faltan campos requeridos" });
    }

    const newLot = new Lot({ shop: shopId, lot });
    await newLot.save();

    res.status(201).json({ message: "Lote creado correctamente", lot: newLot });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creando el lote" });
  }
};

// 📦 Obtener todos los lotes
export const getLots = async (req, res) => {
  try {
    const lots = await Lot.find().populate("shop", "name address category");
    res.json(lots);
  } catch (err) {
    res.status(500).json({ message: "Error al obtener los lotes" });
  }
};
