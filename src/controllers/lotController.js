import Lot from "../models/Lot.js";

// ➕ Crear un nuevo lote individual (plato)
export const createLot = async (req, res) => {
  try {
    const { shopId, name, description, pickupDeadline } = req.body;

    // Validación de campos obligatorios
    if (!shopId || !name || !pickupDeadline) {
      return res.status(400).json({
        message: "Faltan campos requeridos (shopId, name y pickupDeadline)",
      });
    }

    // Validar que pickupDeadline sea una fecha válida
    const deadlineDate = new Date(pickupDeadline);
    if (isNaN(deadlineDate.getTime())) {
      return res.status(400).json({
        message: "El campo pickupDeadline debe ser una fecha válida",
      });
    }

    // Crear el nuevo lote
    const newLot = new Lot({
      shop: shopId,
      name,
      description,
      pickupDeadline: deadlineDate,
    });

    // Guardar en la base de datos
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

// ❌ Eliminar un lote
export const deleteLot = async (req, res) => {
  try {
    const { lotId } = req.params;

    if (!lotId) {
      return res.status(400).json({ message: "Falta el ID del lote" });
    }

    const deletedLot = await Lot.findByIdAndDelete(lotId);

    if (!deletedLot) {
      return res.status(404).json({ message: "Lote no encontrado" });
    }

    res.json({ message: "Lote eliminado correctamente", lot: deletedLot });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error eliminando el lote" });
  }
};
