import express from "express";
import {
  registerStore,
  loginStore,
  getAllStores,
  getStoreByUserId,
} from "../controllers/storeController.js";

const router = express.Router();

router.post("/register", registerStore);
router.post("/login", loginStore);
router.get("/user/:userId", getStoreByUserId);
router.get("/", getAllStores);

export default router;
