import express from "express";

import { getAdminAnalytics } from "../controllers/adminAnalyticsController.mjs";
import { protect } from "../middleware/authMiddleware.mjs";
import { adminOnly } from "../middleware/adminMiddleware.mjs";

const router = express.Router();

router.use(protect);
router.use(adminOnly);

router.get("/", getAdminAnalytics);

export default router;