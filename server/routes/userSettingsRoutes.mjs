import express from "express";

import {
  getUserSettings,
  updateUserSettings,
  resetUserSettings,
} from "../controllers/userSettingsController.mjs";

import { protect } from "../middleware/authMiddleware.mjs";

const router = express.Router();

router.use(protect);

router.get("/", getUserSettings);

router.put("/", updateUserSettings);

router.put("/reset", resetUserSettings);

export default router;