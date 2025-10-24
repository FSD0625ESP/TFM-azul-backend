import express from "express";
import {
  createLot,
  getLots,
  deleteLot,
  updateLot,
} from "../controllers/lotController.js";

const router = express.Router();

router.post("/create", createLot);
router.get("/", getLots);
router.put("/:lotId", updateLot);
router.delete("/:lotId", deleteLot);

export default router;
