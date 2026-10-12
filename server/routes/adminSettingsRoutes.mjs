import express from "express";
import {
  getSettings,
  updateSettings,
  resetSettings,
} from "../controllers/adminSettingsController.mjs";
import { protect } from "../middleware/authMiddleware.mjs";
import { adminOnly } from "../middleware/adminMiddleware.mjs";

const router = express.Router();

router.use(protect);
router.use(adminOnly);

router.get("/", getSettings);
router.put("/", updateSettings);
router.post("/reset", resetSettings);

export default router;