import express from "express";

import {
  getAdminDashboard,
} from "../controllers/adminDashboardController.mjs";

import {
  protect,
} from "../middleware/authMiddleware.mjs";

import {
  adminOnly,
} from "../middleware/adminMiddleware.mjs";

const router = express.Router();

router.use(protect);
router.use(adminOnly);

router.get(
  "/",
  getAdminDashboard
);

export default router;