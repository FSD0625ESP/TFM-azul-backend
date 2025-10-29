import express from "express";
import {
  createLot,
  getLots,
  deleteLot,
  updateLot,
  reserveLot,
} from "../controllers/lotController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/create", createLot);
router.get("/", getLots);
router.post("/:lotId/reserve", auth, reserveLot);
router.put("/:lotId", updateLot);
router.delete("/:lotId", deleteLot);

export default router;
