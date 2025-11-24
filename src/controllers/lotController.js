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

    // Si pickupDeadline solo hora (formato HH:mm), combinarla con hoy
    let deadlineDate;
    if (pickupDeadline.match(/^\d{2}:\d{2}$/)) {
      // Ejemplo de Formato valido : "20:21"
      const today = new Date();
      const [hours, minutes] = pickupDeadline.split(":");
      deadlineDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        parseInt(hours),
        parseInt(minutes),
        0
      );
    } else {
      // Formato datetime completo
      deadlineDate = new Date(pickupDeadline);
    }

    //Si la fecha no es válida
    if (isNaN(deadlineDate.getTime())) {
      return res.status(400).json({
        message:
          "El campo pickupDeadline debe ser una hora válida (HH:mm) o fecha completa",
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
    const allLots = await Lot.find()
      .populate("shop", "name address category phone")
      .populate("rider", "name email phone");

    const now = new Date();

    // Filtrar lotes según su estado de caducidad
    const activeLots = allLots.filter((lot) => {
      const pickupDeadline = new Date(lot.pickupDeadline);

      if (lot.reserved) {
        // Si está reservado, permitir 10 minutos extra después de la hora
        const extendedDeadline = new Date(
          pickupDeadline.getTime() + 10 * 60 * 1000
        );
        return now <= extendedDeadline;
      } else {
        // Si no está reservado, caducar en la hora exacta
        return now <= pickupDeadline;
      }
    });

    res.json(activeLots);
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

    // Buscar el lote antes de eliminarlo para obtener su rider
    const lot = await Lot.findById(lotId);
    if (!lot) {
      return res.status(404).json({ message: "Lote no encontrado" });
    }

    // Si el lote tenía un rider asignado, quitarlo de su lista de reservas
    if (lot.rider) {
      const User = (await import("../models/User.js")).default;
      await User.findByIdAndUpdate(
        lot.rider,
        { $pull: { reservedLots: lotId } }, // ← elimina el lote del array reservedLots
        { new: true }
      );
    }

    // Ahora sí eliminar el lote
    const deletedLot = await Lot.findByIdAndDelete(lotId);

    res.json({ message: "Lote eliminado correctamente", lot: deletedLot });
  } catch (err) {
    console.error("Error eliminando el lote:", err);
    res.status(500).json({ message: "Error eliminando el lote" });
  }
};

// ✏️ Actualizar un lote
export const updateLot = async (req, res) => {
  try {
    const { lotId } = req.params;
    const { name, description, pickupDeadline } = req.body;

    if (!lotId) {
      return res.status(400).json({ message: "Falta el ID del lote" });
    }

    if (!name || !pickupDeadline) {
      return res.status(400).json({
        message: "Faltan campos requeridos (name y pickupDeadline)",
      });
    }

    // Procesar pickupDeadline igual que en createLot para veridificar formato
    let deadlineDate;
    if (pickupDeadline.match(/^\d{2}:\d{2}$/)) {
      const today = new Date();
      const [hours, minutes] = pickupDeadline.split(":");
      deadlineDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        parseInt(hours),
        parseInt(minutes),
        0
      );
    } else {
      // Formato datetime completo
      deadlineDate = new Date(pickupDeadline);
    }

    if (isNaN(deadlineDate.getTime())) {
      return res.status(400).json({
        message:
          "El campo pickupDeadline debe ser una hora válida (HH:mm) o fecha completa",
      });
    }

    const updatedLot = await Lot.findByIdAndUpdate(
      lotId,
      {
        name,
        description,
        pickupDeadline: deadlineDate,
      },
      { new: true }
    );

    if (!updatedLot) {
      return res.status(404).json({ message: "Lote no encontrado" });
    }

    res.json({ message: "Lote actualizado correctamente", lot: updatedLot });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error actualizando el lote" });
  }
};

// ✅ Reservar un lote (protegido): establecer reserved=true y asignar rider desde JWT
export const reserveLot = async (req, res) => {
  try {
    const { lotId } = req.params;

    if (!lotId) {
      return res.status(400).json({ message: "Falta el ID del lote" });
    }

    const riderId = req.user && (req.user.id || req.user._id);
    if (!riderId) {
      return res.status(401).json({ message: "Usuario no autenticado" });
    }

    const lot = await Lot.findById(lotId);
    if (!lot) return res.status(404).json({ message: "Lote no encontrado" });

    if (lot.reserved) {
      return res.status(409).json({ message: "Lote ya reservado" });
    }

    lot.reserved = true;
    lot.rider = riderId;

    await lot.save();

    // Importar User para agregar la reserva al rider
    const User = (await import("../models/User.js")).default;
    await User.findByIdAndUpdate(
      riderId,
      { $push: { reservedLots: lotId } },
      { new: true }
    );

    res.json({ message: "Lote reservado", lot });
  } catch (err) {
    console.error("Error reservando lote:", err);
    res.status(500).json({ message: "Error reservando lote" });
  }
};

// 🔄 Desreservar un lote (quitar reserva)
export const unreserveLot = async (req, res) => {
  try {
    const { lotId } = req.params;

    if (!lotId) {
      return res.status(400).json({ message: "Falta el ID del lote" });
    }

    const riderId = req.user && (req.user.id || req.user._id);
    if (!riderId) {
      return res.status(401).json({ message: "Usuario no autenticado" });
    }

    const lot = await Lot.findById(lotId);
    if (!lot) return res.status(404).json({ message: "Lote no encontrado" });

    // Verificar que el lote está reservado por este rider
    if (!lot.reserved) {
      return res.status(400).json({ message: "Lote no está reservado" });
    }

    const lotRiderId = String(lot.rider) === String(riderId);
    if (!lotRiderId) {
      return res
        .status(403)
        .json({ message: "Este lote no está reservado por ti" });
    }

    // Desreservar el lote
    lot.reserved = false;
    lot.rider = null;

    await lot.save();

    // Importar User para quitar la reserva del rider
    const User = (await import("../models/User.js")).default;
    await User.findByIdAndUpdate(
      riderId,
      { $pull: { reservedLots: lotId } },
      { new: true }
    );

    // Notificar a la tienda (shop) que el rider canceló la reserva
    try {
      const { notifyUser } = await import("../utils/notify.js");
      const shopId = lot.shop?._id || lot.shop;
      if (shopId) {
        notifyUser(String(shopId), {
          type: "reservation_cancelled",
          orderId: lotId,
          riderId,
          message: "El rider ha cancelado la reserva",
        });
      }
    } catch (e) {
      console.error("Error sending cancel notification:", e);
    }

    res.json({ message: "Lote desreservado correctamente", lot });
  } catch (err) {
    console.error("Error desreservando lote:", err);
    res.status(500).json({ message: "Error desreservando lote" });
  }
};

// 🎫 Obtener lotes reservados del rider autenticado
export const getMyReservedLots = async (req, res) => {
  try {
    const riderId = req.user && (req.user.id || req.user._id);
    if (!riderId) {
      return res.status(401).json({ message: "Usuario no autenticado" });
    }

    const lots = await Lot.find({ rider: riderId, reserved: true })
      .populate("shop", "name address category phone")
      .sort({ createdAt: -1 });

    res.json(lots);
  } catch (err) {
    console.error("Error obteniendo reservas:", err);
    res.status(500).json({ message: "Error obteniendo reservas" });
  }
};
