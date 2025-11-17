import cron from "node-cron";
import Lot from "../models/Lot.js";

// Ejecutar cada minuto
cron.schedule("*/3 * * * *", async () => {
  try {
    const now = new Date();

    // Eliminar solo lotes no reservados y expirados
    const result = await Lot.deleteMany({
      pickupDeadline: { $lt: now },
      reserved: false,
    });

    if (result.deletedCount > 0) {
      console.log(
        `🗑️ ${
          result.deletedCount
        } lote(s) eliminados automáticamente (${now.toISOString()})`
      );
    }
  } catch (err) {
    console.error("Error en la limpieza de lotes:", err);
  }
});
