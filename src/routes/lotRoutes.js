import express from "express";
import {
  createLot,
  getLots,
  deleteLot,
  updateLot,
  reserveLot,
  unreserveLot,
  getMyReservedLots,
  confirmPickupByQRCode,
  deliverLot,
  checkDistance,
} from "../controllers/lotController.js";
import auth from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.post("/create", upload.single("image"), createLot);
router.get("/", getLots);
router.get("/my-reserved", auth, getMyReservedLots);
router.post("/:lotId/reserve", auth, reserveLot);
router.post("/:lotId/unreserve", auth, unreserveLot);
router.post("/confirm-pickup/:storeId", auth, confirmPickupByQRCode);
router.post("/:lotId/deliver", auth, deliverLot);
router.put("/:lotId", updateLot);
router.delete("/:lotId", deleteLot);

// ✅ CORRECTO → usamos el mismo middleware "auth"
router.post("/:lotId/check-distance", auth, checkDistance);

export default router;
