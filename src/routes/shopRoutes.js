import express from "express";
import {
  registerShop,
  getAllShops,
  getShopByUserId,
} from "../controllers/shopController.js";

const router = express.Router();

router.post("/register", registerShop);
router.get("/user/:userId", getShopByUserId);
router.get("/", getAllShops);

export default router;
