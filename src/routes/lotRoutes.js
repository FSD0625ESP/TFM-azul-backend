import express from "express";
import { createLot, getLots, deleteLot } from "../controllers/lotController.js";

const router = express.Router();

router.post("/create", createLot);
router.get("/", getLots);
router.delete("/:lotId", deleteLot);

export default router;
