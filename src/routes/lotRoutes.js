import express from "express";
import {
  createLot,
  getLots,
  deleteLot,
  updateLot,
  reserveLot,
  unreserveLot,
  getMyReservedLots,
} from "../controllers/lotController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/create", createLot);
router.get("/", getLots);
router.get("/my-reserved", auth, getMyReservedLots);
router.post("/:lotId/reserve", auth, reserveLot);
router.post("/:lotId/unreserve", auth, unreserveLot);
router.put("/:lotId", updateLot);
router.delete("/:lotId", deleteLot);

export default router;
