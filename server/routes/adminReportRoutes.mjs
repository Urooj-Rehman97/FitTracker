import express from "express";

import {
  getAdminReport,
} from "../controllers/adminReportController.mjs";

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
  getAdminReport
);

export default router;