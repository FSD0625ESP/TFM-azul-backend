import express from "express";
import {
  registerStore,
  loginStore,
  getAllStores,
  getStoreByUserId,
  updateStorePhoto,
  changeStorePassword,
  updateStoreTheme,
} from "../controllers/storeController.js";
import upload from "../middleware/upload.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/register", registerStore);
router.post("/login", loginStore);
router.get("/user/:userId", getStoreByUserId);
router.get("/", getAllStores);
router.patch("/:storeId/photo", auth, upload.single("photo"), updateStorePhoto);
router.patch("/change-password", auth, changeStorePassword);
router.patch("/theme", auth, updateStoreTheme);

export default router;
