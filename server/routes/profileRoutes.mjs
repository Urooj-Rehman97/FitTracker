import express from "express";

import {
  getProfile,
  updateProfile,
} from "../controllers/profileController.mjs";

import { protect } from "../middleware/authMiddleware.mjs";

const router = express.Router();

router.use(protect);

router.get("/", getProfile);
router.put("/", updateProfile);

export default router;