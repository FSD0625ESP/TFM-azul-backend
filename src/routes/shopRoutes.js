import express from "express";
import { registerShop } from "../controllers/shopController.js";

const router = express.Router();

router.post("/register", registerShop);

export default router;
