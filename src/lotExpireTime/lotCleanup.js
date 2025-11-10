import cron from "node-cron";
import Lot from "../models/Lot.js";

// Ejecutar cada minuto
cron.schedule("* * * * *", async () => {
  try {
    const now = new Date();

    // Eliminar lotes cuyo pickupDeadline ya pasó
    const result = await Lot.deleteMany({
      pickupDeadline: { $lt: now },
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
