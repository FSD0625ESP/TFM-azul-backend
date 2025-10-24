import express from "express";
import { createLot, getLots } from "../controllers/lotController.js";

const router = express.Router();

router.post("/create", createLot);
router.get("/", getLots);

export default router;
