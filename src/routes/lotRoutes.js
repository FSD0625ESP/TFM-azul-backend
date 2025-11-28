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
router.put("/:lotId", updateLot);
router.delete("/:lotId", deleteLot);

export default router;
