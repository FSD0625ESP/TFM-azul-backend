import Lot from "../models/Lot.js";
import cloudinary from "../config/cloudinary.js";

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
        0,
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

    // Subir imagen a Cloudinary si existe
    let imageUrl = "";
    if (req.file) {
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "soulbites/lots",
            transformation: [
              { width: 800, height: 600, crop: "fill" },
              { quality: "auto", fetch_format: "auto" },
            ],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          },
        );
        uploadStream.end(req.file.buffer);
      });
      imageUrl = uploadResult.secure_url;
    }

    // Crear el nuevo lote
    const newLot = new Lot({
      shop: shopId,
      name,
      description,
      image: imageUrl,
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

    // Filtrar solo lotes que NO han sido entregados ni recogidos
    const activeLots = allLots.filter((lot) => {
      return !lot.delivered && !lot.pickedUp;
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
        { new: true },
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
        0,
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
      { new: true },
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
      { new: true },
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
      { new: true },
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

// ✅ Confirmar recogida por QR: el rider escanea el QR de la tienda
export const confirmPickupByQRCode = async (req, res) => {
  try {
    const { storeId } = req.params;

    const riderId = req.user && (req.user.id || req.user._id);
    if (!riderId)
      return res.status(401).json({ message: "Usuario no autenticado" });

    if (!storeId)
      return res.status(400).json({ message: "Falta el ID de la tienda" });

    // Buscar el lote reservado por este rider en esta tienda que no haya sido recogido aún
    const lot = await Lot.findOne({
      shop: storeId,
      rider: riderId,
      reserved: true,
      pickedUp: { $ne: true },
    }).sort({ createdAt: 1 });

    if (!lot)
      return res.status(404).json({
        message: "No hay lotes reservados para esta tienda o ya recogidos",
      });

    // Marcar como recogido
    lot.pickedUp = true;
    await lot.save();

    // Notificar a la tienda
    try {
      const { notifyUser } = await import("../utils/notify.js");
      const shopId = lot.shop?._id || lot.shop;
      if (shopId) {
        notifyUser(String(shopId), {
          type: "pickup_confirmed",
          orderId: String(lot._id),
          riderId,
          message: "El rider ha confirmado la recogida mediante QR",
        });
      }
    } catch (e) {
      console.error("Error sending pickup notification:", e);
    }

    res.json({ message: "Recogida confirmada", lot });
  } catch (err) {
    console.error("Error confirmando recogida:", err);
    res.status(500).json({ message: "Error confirmando la recogida" });
  }
};

// 🚚 Entregar lote con validación de distancia (1km del destino homeless)
export const deliverLot = async (req, res) => {
  try {
    const { lotId } = req.params;
    const { riderLat, riderLng } = req.body;

    if (!lotId) {
      return res.status(400).json({ message: "Falta el ID del lote" });
    }

    const riderId = req.user && (req.user.id || req.user._id);
    if (!riderId) {
      return res.status(401).json({ message: "Usuario no autenticado" });
    }

    if (!riderLat || !riderLng) {
      return res
        .status(400)
        .json({ message: "Falta la ubicación del rider (lat, lng)" });
    }

    // Obtener el lote
    const lot = await Lot.findById(lotId);
    if (!lot) {
      return res.status(404).json({ message: "Lote no encontrado" });
    }

    // Validar que el lote pertenece al rider y está recogido
    const lotRiderId = String(lot.rider) === String(riderId);
    if (!lotRiderId) {
      return res.status(403).json({ message: "Este lote no te pertenece" });
    }

    if (!lot.pickedUp) {
      return res
        .status(400)
        .json({ message: "El lote no ha sido recogido aún" });
    }

    if (lot.delivered) {
      return res.status(400).json({ message: "El lote ya ha sido entregado" });
    }

    // Buscar todas las marcas homeless del sistema
    const Mark = (await import("../models/Mark.js")).default;
    const homelessMarks = await Mark.find({
      type_mark: "homeless",
      state: true,
    });

    if (homelessMarks.length === 0) {
      return res
        .status(400)
        .json({ message: "No hay puntos homeless disponibles" });
    }

    // Función para calcular distancia usando Haversine
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371; // Radio de la Tierra en km
      const dLat = (lat2 - lat1) * (Math.PI / 180);
      const dLon = (lon2 - lon1) * (Math.PI / 180);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) *
          Math.cos(lat2 * (Math.PI / 180)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c; // Distancia en km
    };

    // Encontrar la marca homeless más cercana
    let closestMark = null;
    let minDistance = Infinity;

    for (const mark of homelessMarks) {
      const markLat = parseFloat(mark.lat);
      const markLng = parseFloat(mark.long);
      const distance = calculateDistance(
        parseFloat(riderLat),
        parseFloat(riderLng),
        markLat,
        markLng,
      );

      if (distance < minDistance) {
        minDistance = distance;
        closestMark = mark;
      }
    }

    // Validar que la distancia sea menor a 50 metros (0.05km)
    if (minDistance > 0.05) {
      console.log(
        `❌ Entrega rechazada: Distancia ${(minDistance * 1000).toFixed(
          0,
        )}m > 50m. Pua más cercana: ${closestMark?.lat}, ${closestMark?.long}`,
      );
      return res.status(400).json({
        message: `Debes estar dentro de 50 metros del punto de entrega. Distancia actual: ${(
          minDistance * 1000
        ).toFixed(0)}m`,
        distance: minDistance,
        requiredDistance: 0.05,
        closestMark: closestMark,
      });
    }

    // Marcar como entregado
    lot.delivered = true;
    await lot.save();

    // Notificar a la tienda
    try {
      const { notifyUser } = await import("../utils/notify.js");
      const shopId = lot.shop?._id || lot.shop;
      if (shopId) {
        notifyUser(String(shopId), {
          type: "delivery_confirmed",
          orderId: String(lot._id),
          riderId,
          message: "El lote ha sido entregado al punto homeless",
          deliveryPoint: closestMark,
          distance: minDistance,
        });
      }
    } catch (e) {
      console.error("Error sending delivery notification:", e);
    }

    res.json({
      message: "Lote entregado correctamente",
      lot,
      distance: minDistance,
      deliveryPoint: closestMark,
    });
  } catch (err) {
    console.error("Error entregando lote:", err);
    res.status(500).json({ message: "Error entregando el lote" });
  }
};
// Comprueba si el rider está dentro del rango permitido para entregar (<= 50m)
export const checkDistance = async (req, res) => {
  try {
    const { lotId } = req.params;
    const { riderLat, riderLng } = req.body;

    if (riderLat === undefined || riderLng === undefined) {
      return res.status(400).json({ message: "Falta la ubicación (lat,lng)" });
    }

    const Mark = (await import("../models/Mark.js")).default;
    const homelessMarks = await Mark.find({
      type_mark: "homeless",
      state: true,
    });

    if (homelessMarks.length === 0) {
      return res
        .status(400)
        .json({ message: "No hay puntos homeless disponibles" });
    }

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371;
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    let minDistance = Infinity;
    let closestMark = null;

    for (const mark of homelessMarks) {
      const markLat = parseFloat(mark.lat);
      const markLng = parseFloat(mark.long);
      const distance = calculateDistance(
        parseFloat(riderLat),
        parseFloat(riderLng),
        markLat,
        markLng,
      );

      if (distance < minDistance) {
        minDistance = distance;
        closestMark = mark;
      }
    }

    // allowed = true si está a <= 0.05 km (50 m)
    const allowed = minDistance <= 0.05;

    return res.json({
      allowed,
      distance: minDistance,
      requiredDistance: 0.05,
      closestMark,
    });
  } catch (err) {
    console.error("Error en checkDistance:", err);
    res.status(500).json({ message: "Error comprobando la distancia" });
  }
};
